import asyncio
import json
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from config.database import Database, get_db
from dependencies import get_current_user, get_user_id_from_payload
from services import projects as projects_service
from services.pipeline_runner import ensure_pipeline_task
from services.stream_hub import stream_hub

router = APIRouter(prefix="/projects", tags=["projects"])


class ProjectPostResponse(BaseModel):
    id: UUID
    final_post: Optional[str] = None
    failed_facts: Optional[list] = None


class ProjectResponse(BaseModel):
    id: UUID
    title: str
    status: str
    created_at: str
    post: Optional[ProjectPostResponse] = None
    total_input_tokens: int = 0
    total_output_tokens: int = 0
    execution_time_seconds: int = 0
    retry_count: int = 0


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]


class ProjectCreateBody(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    prd: str = Field(..., min_length=1)


class ProjectPatchBody(BaseModel):
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    execution_time: Optional[int] = None
    retry_count: Optional[int] = None
    status: Optional[str] = None


def _require_user_uuid(user: dict) -> UUID:
    try:
        return get_user_id_from_payload(user)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.post("/upload", response_model=ProjectResponse, status_code=201)
async def create_project(
    body: ProjectCreateBody,
    user: dict = Depends(get_current_user),
    database: Database = Depends(get_db),
):
    """Create a project in pending state (ready for pipeline + SSE)."""
    user_id = _require_user_uuid(user)
    payload = await projects_service.create_project(
        database,
        user_id,
        title=body.title.strip(),
        prd=body.prd.strip(),
    )
    return ProjectResponse(**payload)


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    user: dict = Depends(get_current_user),
    database: Database = Depends(get_db),
):
    """List all projects for the current user."""
    user_id = _require_user_uuid(user)
    items = await projects_service.list_projects_for_user(database, user_id)
    return ProjectListResponse(projects=[ProjectResponse(**item) for item in items])


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    user: dict = Depends(get_current_user),
    database: Database = Depends(get_db),
):
    """Get a specific project by ID."""
    user_id = _require_user_uuid(user)
    payload = await projects_service.get_project_for_user(database, user_id, project_id)
    if not payload:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse(**payload)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def patch_project(
    project_id: UUID,
    body: ProjectPatchBody,
    user: dict = Depends(get_current_user),
    database: Database = Depends(get_db),
):
    """Update cumulative metrics / status for a project."""
    user_id = _require_user_uuid(user)
    owned = await projects_service.get_project_owned(database, user_id, project_id)
    if not owned:
        raise HTTPException(status_code=404, detail="Project not found")

    await projects_service.patch_project_metrics(
        database,
        user_id,
        project_id,
        input_tokens=body.input_tokens,
        output_tokens=body.output_tokens,
        execution_time_seconds=body.execution_time,
        retry_count=body.retry_count,
        status=body.status,
    )
    payload = await projects_service.get_project_for_user(database, user_id, project_id)
    if not payload:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse(**payload)


@router.get("/{project_id}/stream")
async def stream_project(
    project_id: UUID,
    user: dict = Depends(get_current_user),
    database: Database = Depends(get_db),
):
    """SSE: eventos de progreso del pipeline y métricas finales."""
    user_id = _require_user_uuid(user)
    owned = await projects_service.get_project_owned(database, user_id, project_id)
    if not owned:
        raise HTTPException(status_code=404, detail="Project not found")

    async def event_generator():
        queue = await stream_hub.subscribe(project_id)
        ensure_pipeline_task(database, user_id, project_id)
        try:
            while True:
                try:
                    event, data = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield f"event: {event}\ndata: {json.dumps(data)}\n\n"
                    if event in ("complete", "error"):
                        break
                except asyncio.TimeoutError:
                    yield ": ping\n\n"
        finally:
            await stream_hub.unsubscribe(project_id, queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

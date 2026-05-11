from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from config.database import Database, get_db
from dependencies import get_current_user, get_user_id_from_payload
from services import projects as projects_service

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


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]


def _require_user_uuid(user: dict) -> UUID:
    try:
        return get_user_id_from_payload(user)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


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

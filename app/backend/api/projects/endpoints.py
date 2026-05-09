from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from dependencies import get_current_user
from config.database import get_db

from ...config.database import Database

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


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    user: dict = Depends(get_current_user),
    database: Database = Depends(get_db),
):
    """List all projects for the current user."""
    user_id = user.get("sub") or user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in token")

    projects_data = await database.execute(
        """
        SELECT id, title, status, created_at
        FROM projects
        WHERE user_id = $1
        ORDER BY created_at DESC
        """,
        (user_id,),
    )

    result = []
    for project in projects_data:
        posts_data = await database.execute(
            """
            SELECT id, final_post, failed_facts
            FROM posts
            WHERE project_id = $1
            LIMIT 1
            """,
            (str(project["id"]),),
        )

        post = None
        if posts_data:
            post_data = posts_data[0]
            post = ProjectPostResponse(
                id=post_data["id"],
                final_post=post_data.get("final_post"),
                failed_facts=post_data.get("failed_facts"),
            )

        result.append(
            ProjectResponse(
                id=project["id"],
                title=project["title"],
                status=project["status"],
                created_at=str(project["created_at"]),
                post=post,
            )
        )

    return ProjectListResponse(projects=result)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    user: dict = Depends(get_current_user),
    database: Database = Depends(get_db),
):
    """Get a specific project by ID."""
    user_id = user.get("sub") or user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in token")

    projects_data = await database.execute(
        """
        SELECT id, title, status, created_at
        FROM projects
        WHERE id = $1 AND user_id = $2
        """,
        (str(project_id), user_id),
    )

    if not projects_data:
        raise HTTPException(status_code=404, detail="Project not found")

    project = projects_data[0]

    posts_data = await database.execute(
        """
        SELECT id, final_post, failed_facts
        FROM posts
        WHERE project_id = $1
        LIMIT 1
        """,
        (str(project_id),),
    )

    post = None
    if posts_data:
        post_data = posts_data[0]
        post = ProjectPostResponse(
            id=post_data["id"],
            final_post=post_data.get("final_post"),
            failed_facts=post_data.get("failed_facts"),
        )

    return ProjectResponse(
        id=project["id"],
        title=project["title"],
        status=project["status"],
        created_at=str(project["created_at"]),
        post=post,
    )
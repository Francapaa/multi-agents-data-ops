from typing import Any
from uuid import UUID

from config.database import Database


def _as_uuid(value: Any) -> UUID:
    if isinstance(value, UUID):
        return value
    return UUID(str(value))


async def _fetch_first_post_for_project(
    database: Database, project_id: UUID
) -> dict[str, Any] | None:
    rows = await database.execute(
        """
        SELECT id, final_post, failed_facts
        FROM posts
        WHERE project_id = $1
        LIMIT 1
        """,
        (project_id,),
    )
    return rows[0] if rows else None


def _post_payload(post_row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": _as_uuid(post_row["id"]),
        "final_post": post_row.get("final_post"),
        "failed_facts": post_row.get("failed_facts"),
    }


def _project_payload(project_row: dict[str, Any], post: dict[str, Any] | None) -> dict[str, Any]:
    return {
        "id": _as_uuid(project_row["id"]),
        "title": project_row["title"],
        "status": project_row["status"],
        "created_at": str(project_row["created_at"]),
        "post": _post_payload(post) if post else None,
    }


async def list_projects_for_user(database: Database, user_id: UUID) -> list[dict[str, Any]]:
    projects_data = await database.execute(
        """
        SELECT id, title, status, created_at
        FROM projects
        WHERE user_id = $1
        ORDER BY created_at DESC
        """,
        (user_id,),
    )

    result: list[dict[str, Any]] = []
    for project in projects_data:
        post_row = await _fetch_first_post_for_project(database, _as_uuid(project["id"]))
        result.append(_project_payload(project, post_row))
    return result


async def get_project_for_user(
    database: Database, user_id: UUID, project_id: UUID
) -> dict[str, Any] | None:
    projects_data = await database.execute(
        """
        SELECT id, title, status, created_at
        FROM projects
        WHERE id = $1 AND user_id = $2
        """,
        (project_id, user_id),
    )

    if not projects_data:
        return None

    project = projects_data[0]
    post_row = await _fetch_first_post_for_project(database, project_id)
    return _project_payload(project, post_row)

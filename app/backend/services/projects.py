from typing import Any
from uuid import UUID, uuid4

from psycopg.types.json import Json

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
        WHERE project_id = %s
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
        "total_input_tokens": int(project_row.get("total_input_tokens") or 0),
        "total_output_tokens": int(project_row.get("total_output_tokens") or 0),
        "execution_time_seconds": int(project_row.get("execution_time_seconds") or 0),
        "retry_count": int(project_row.get("retry_count") or 0),
    }


async def list_projects_for_user(database: Database, user_id: UUID) -> list[dict[str, Any]]:
    projects_data = await database.execute(
        """
        SELECT
          id, title, status, created_at,
          total_input_tokens, total_output_tokens, execution_time_seconds, retry_count
        FROM projects
        WHERE user_id = %s
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
        SELECT
          id, title, status, created_at,
          total_input_tokens, total_output_tokens, execution_time_seconds, retry_count
        FROM projects
        WHERE id = %s AND user_id = %s
        """,
        (project_id, user_id),
    )

    if not projects_data:
        return None

    project = projects_data[0]
    post_row = await _fetch_first_post_for_project(database, project_id)
    return _project_payload(project, post_row)


async def get_project_owned(
    database: Database, user_id: UUID, project_id: UUID
) -> dict[str, Any] | None:
    """Fila completa para pipeline (incluye prd)."""
    return await database.execute_one(
        """
        SELECT
          id, user_id, title, prd, status, created_at,
          total_input_tokens, total_output_tokens, execution_time_seconds, retry_count
        FROM projects
        WHERE id = %s AND user_id = %s
        """,
        (project_id, user_id),
    )


async def create_project(
    database: Database,
    user_id: UUID,
    *,
    title: str,
    prd: str,
) -> dict[str, Any]:
    new_id = uuid4()
    await database.execute(
        """
        INSERT INTO projects (id, user_id, title, prd, status)
        VALUES (%s, %s, %s, %s, 'pending')
        """,
        (new_id, user_id, title, prd),
    )
    loaded = await get_project_for_user(database, user_id, new_id)
    if not loaded:
        raise RuntimeError("Project created but could not be reloaded")
    return loaded


async def patch_project_metrics(
    database: Database,
    user_id: UUID,
    project_id: UUID,
    *,
    input_tokens: int | None = None,
    output_tokens: int | None = None,
    execution_time_seconds: int | None = None,
    retry_count: int | None = None,
    status: str | None = None,
) -> None:
    await database.execute(
        """
        UPDATE projects SET
          total_input_tokens = COALESCE(%s, total_input_tokens),
          total_output_tokens = COALESCE(%s, total_output_tokens),
          execution_time_seconds = COALESCE(%s, execution_time_seconds),
          retry_count = COALESCE(%s, retry_count),
          status = COALESCE(%s, status)
        WHERE id = %s AND user_id = %s
        """,
        (
            input_tokens,
            output_tokens,
            execution_time_seconds,
            retry_count,
            status,
            project_id,
            user_id,
        ),
    )


async def increment_project_retry_count(
    database: Database, user_id: UUID, project_id: UUID
) -> None:
    await database.execute(
        """
        UPDATE projects
        SET retry_count = retry_count + 1
        WHERE id = %s AND user_id = %s
        """,
        (project_id, user_id),
    )


async def save_prd_for_project(
    database: Database,
    user_id: UUID,
    project_id: UUID,
    *,
    prd: str,
) -> None:
    owned = await database.execute_one(
        "SELECT id FROM projects WHERE id = %s AND user_id = %s",
        (project_id, user_id),
    )
    if not owned:
        return
    await database.execute(
        "UPDATE projects SET prd = %s WHERE id = %s AND user_id = %s",
        (prd, project_id, user_id),
    )


async def save_post_for_project(
    database: Database,
    user_id: UUID,
    project_id: UUID,
    *,
    final_post: str,
    failed_facts: list[str] | None,
) -> None:
    owned = await database.execute_one(
        "SELECT id FROM projects WHERE id = %s AND user_id = %s",
        (project_id, user_id),
    )
    if not owned:
        return

    existing = await database.execute_one(
        "SELECT id FROM posts WHERE project_id = %s LIMIT 1",
        (project_id,),
    )
    facts = failed_facts or []
    if existing:
            await database.execute(
                """
                UPDATE posts
                SET final_post = %s, failed_facts = %s
                WHERE id = %s
                """,
                (final_post, facts, existing["id"]),
            )
    else:
        await database.execute(
            """
            INSERT INTO posts (id, project_id, final_post, failed_facts)
            VALUES (gen_random_uuid(), %s, %s, %s)
            """,
            (project_id, final_post, facts),
        )

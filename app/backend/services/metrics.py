from typing import Any
from uuid import UUID

from config.database import Database


async def overview_for_user(database: Database, user_id: UUID) -> dict[str, Any]:
    row = await database.execute_one(
        """
        SELECT
          COUNT(*)::bigint AS total,
          COUNT(*) FILTER (WHERE status = 'completed')::bigint AS completed,
          COUNT(*) FILTER (WHERE status = 'failed')::bigint AS failed
        FROM projects
        WHERE user_id = $1
        """,
        (user_id,),
    )
    if not row:
        return {"total": 0, "completed": 0, "failed": 0, "success_rate": 0.0}
    total = int(row["total"] or 0)
    completed = int(row["completed"] or 0)
    failed = int(row["failed"] or 0)
    success_rate = (completed / total * 100.0) if total > 0 else 0.0
    return {
        "total": total,
        "completed": completed,
        "failed": failed,
        "success_rate": round(success_rate, 2),
    }


async def costs_for_user(database: Database, user_id: UUID) -> dict[str, Any]:
    row = await database.execute_one(
        """
        SELECT
          COALESCE(SUM(total_input_tokens), 0)::bigint AS input_tokens,
          COALESCE(SUM(total_output_tokens), 0)::bigint AS output_tokens,
          COALESCE(AVG(execution_time_seconds), 0)::float AS avg_time_seconds
        FROM projects
        WHERE user_id = $1
        """,
        (user_id,),
    )
    if not row:
        return {
            "input_tokens": 0,
            "output_tokens": 0,
            "avg_time_seconds": 0.0,
            "cost_usd": 0.0,
        }
    inp = int(row["input_tokens"] or 0)
    out = int(row["output_tokens"] or 0)
    avg_time = float(row["avg_time_seconds"] or 0.0)
    from config.pricing import (
        GEMINI_INPUT_USD_PER_TOKEN,
        GEMINI_OUTPUT_USD_PER_TOKEN,
    )

    cost = inp * GEMINI_INPUT_USD_PER_TOKEN + out * GEMINI_OUTPUT_USD_PER_TOKEN
    return {
        "input_tokens": inp,
        "output_tokens": out,
        "avg_time_seconds": round(avg_time, 2),
        "cost_usd": round(cost, 6),
    }


async def recent_posts_for_user(
    database: Database, user_id: UUID, limit: int = 10
) -> list[dict[str, Any]]:
    rows = await database.execute(
        """
        SELECT
          p.id AS post_id,
          p.final_post,
          p.failed_facts,
          pr.id AS project_id,
          pr.title AS project_title,
          pr.status AS project_status
        FROM posts p
        INNER JOIN projects pr ON pr.id = p.project_id
        WHERE pr.user_id = $1
        ORDER BY p.id DESC
        LIMIT $2
        """,
        (user_id, limit),
    )
    return [dict(r) for r in rows]


async def system_health_for_user(database: Database, user_id: UUID) -> dict[str, Any]:
    row = await database.execute_one(
        """
        SELECT
          COUNT(*) FILTER (WHERE status = 'completed')::bigint AS completed,
          COUNT(*) FILTER (WHERE status = 'failed')::bigint AS failed,
          COALESCE(AVG(retry_count), 0)::float AS avg_retries
        FROM projects
        WHERE user_id = $1
          AND status IN ('completed', 'failed')
        """,
        (user_id,),
    )
    if not row:
        return {"success_rate": 0.0, "avg_retries": 0.0}
    completed = int(row["completed"] or 0)
    failed = int(row["failed"] or 0)
    denom = completed + failed
    success_rate = (completed / denom * 100.0) if denom > 0 else 0.0
    return {
        "success_rate": round(success_rate, 2),
        "avg_retries": round(float(row["avg_retries"] or 0.0), 2),
    }

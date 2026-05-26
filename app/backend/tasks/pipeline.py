import asyncio
import json
import logging
import os
from typing import Optional
from uuid import UUID

from config.celery_app import celery_app
from config.database import Database
from services import projects as projects_service
from services.file_parser import FileTooLargeError, UnsupportedFormatError, parse_file

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL")


async def _pub_async(project_id: str, event: str, data: dict) -> None:
    import redis.asyncio as aioredis

    try:
        r = aioredis.from_url(REDIS_URL)
        await r.publish(
            f"project:{project_id}",
            json.dumps({"event": event, "data": data}),
        )
        await r.close()
    except Exception:
        logger.exception("Redis publish failed (non-fatal)")


@celery_app.task(bind=True, max_retries=3, default_retry_delay=10, name="process_project")
def process_project(
    self,
    project_id: str,
    user_id: str,
    file_bytes: Optional[list] = None,
    filename: Optional[str] = None,
):
    from services.pipeline_runner import run_pipeline

    db = Database()
    uid = UUID(user_id)
    pid = UUID(project_id)

    def _publish(event: str, data: dict):
        asyncio.run(_pub_async(project_id, event, data))

    _publish("status", {"status": "parsing", "progress": 5, "message": "Recibiendo archivo..."})

    if file_bytes is not None:
        try:
            raw = bytes(file_bytes)
            file_text = parse_file(raw, filename or "documento")
        except (UnsupportedFormatError, FileTooLargeError) as exc:
            _publish("error", {"detail": str(exc)})
            asyncio.run(
                projects_service.patch_project_metrics(db, uid, pid, status="failed")
            )
            return {"status": "failed", "project_id": project_id, "error": str(exc)}

        row = asyncio.run(projects_service.get_project_owned(db, uid, pid))
        current_prd = (row.get("prd") or "").strip() if row else ""
        combined = f"{current_prd}\n\n{file_text}" if current_prd else file_text

        asyncio.run(projects_service.save_prd_for_project(db, uid, pid, prd=combined))
        _publish("status", {"status": "parsing", "progress": 80, "message": "Guardando PRD en base de datos..."})

    asyncio.run(
        projects_service.patch_project_metrics(db, uid, pid, status="running", execution_time_seconds=0)
    )

    _publish("status", {"status": "parsing", "progress": 100, "message": "PRD listo, iniciando agentes..."})

    try:
        asyncio.run(
            run_pipeline(db, uid, pid, publish=lambda e, d: _pub_async(project_id, e, d))
        )
    except Exception as exc:
        logger.exception("Pipeline failed for project %s", project_id)
        raise self.retry(exc=exc)

    return {"status": "completed", "project_id": project_id}

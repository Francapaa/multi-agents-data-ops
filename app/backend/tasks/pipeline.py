import asyncio
import json
import logging
import os
from uuid import UUID

from config.celery_app import celery_app
from config.database import Database
from services import projects as projects_service
from services.file_parser import FileTooLargeError, UnsupportedFormatError, parse_file

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")


def _pub_sync(project_id: str, event: str, data: dict):
    import redis as sync_redis

    try:
        r = sync_redis.from_url(REDIS_URL)
        r.publish(f"project:{project_id}", json.dumps({"event": event, "data": data}))
        r.close()
    except Exception:
        logger.exception("Redis publish failed (non-fatal)")


@celery_app.task(bind=True, max_retries=3, default_retry_delay=10, name="process_project")
def process_project(self, project_id: str, user_id: str, file_bytes: list, filename: str):
    from services.pipeline_runner import run_pipeline

    db = Database()
    uid = UUID(user_id)
    pid = UUID(project_id)

    _pub_sync(project_id, "status", {"status": "parsing", "progress": 5, "message": "Recibiendo archivo..."})

    try:
        raw = bytes(file_bytes)
        text = parse_file(raw, filename)
    except (UnsupportedFormatError, FileTooLargeError) as exc:
        _pub_sync(project_id, "error", {"detail": str(exc)})
        asyncio.run(
            projects_service.patch_project_metrics(db, uid, pid, status="failed")
        )
        return {"status": "failed", "project_id": project_id, "error": str(exc)}

    _pub_sync(project_id, "status", {"status": "parsing", "progress": 80, "message": "Guardando PRD en base de datos..."})

    asyncio.run(
        projects_service.save_prd_for_project(db, uid, pid, prd=text)
    )

    asyncio.run(
        projects_service.patch_project_metrics(db, uid, pid, status="running", execution_time_seconds=0)
    )

    _pub_sync(project_id, "status", {"status": "parsing", "progress": 100, "message": "PRD listo, iniciando agentes..."})

    try:
        asyncio.run(run_pipeline(db, uid, pid))
    except Exception as exc:
        logger.exception("Pipeline failed for project %s", project_id)
        raise self.retry(exc=exc)

    return {"status": "completed", "project_id": project_id}

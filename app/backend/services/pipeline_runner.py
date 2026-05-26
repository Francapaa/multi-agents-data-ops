import asyncio
import logging
import time
import uuid
from typing import Any, Optional
from uuid import UUID

from agents.graph import get_compiled_workflow
from config.database import Database
from services import projects as projects_service
from services.stream_hub import stream_hub

logger = logging.getLogger(__name__)

NODE_PROGRESS: dict[str, tuple[str, int]] = {
    "researcher": ("researcher", 25),
    "writer": ("writer", 50),
    "fast_checker": ("checker", 65),
    "polisher": ("polisher", 90),
}

_STREAM_DONE = object()


def _empty_agent_state(prd: str, project_id: UUID) -> dict[str, Any]:
    return {
        "prd": prd,
        "project_id": project_id,
        "run_id": uuid.uuid4(),
        "researcher": {
            "search_queries": [],
            "sources": [],
            "facts": [],
            "context": "",
        },
        "writer": {"draft": "", "retry_count": 0},
        "fastChecker": {
            "verified": None,
            "failed_facts": [],
            "confidence": 0.0,
            "requested_writer_retry": False,
        },
        "polisherAgent": {"final_post": ""},
        "error": None,
        "current_agent": uuid.UUID(int=0),
        "total_input_tokens": 0,
        "total_output_tokens": 0,
    }


async def run_pipeline(
    database: Database,
    user_id: UUID,
    project_id: UUID,
    publish: Optional[callable] = None,
) -> None:
    if publish is None:
        publish = lambda e, d: stream_hub.publish(project_id, e, d)

    start = time.monotonic()
    full_state: dict[str, Any] = {}
    try:
        row = await projects_service.get_project_owned(database, user_id, project_id)
        if not row:
            await publish("error", {"detail": "Project not found"})
            return

        prd = (row.get("prd") or "").strip()
        if not prd:
            await projects_service.patch_project_metrics(
                database,
                user_id,
                project_id,
                status="failed",
            )
            await publish("error", {"detail": "Project has no PRD"})
            return

        await projects_service.patch_project_metrics(
            database,
            user_id,
            project_id,
            status="running",
            execution_time_seconds=0,
        )

        initial = _empty_agent_state(prd, project_id)
        app = get_compiled_workflow()
        stream_iter = iter(app.stream(initial, stream_mode="updates"))
        full_state = dict(initial)

        while True:
            chunk = await asyncio.to_thread(next, stream_iter, _STREAM_DONE)
            if chunk is _STREAM_DONE:
                break
            for node_name, partial in chunk.items():
                full_state.update(partial)
                elapsed = int(time.monotonic() - start)
                tin = int(full_state.get("total_input_tokens") or 0)
                tout = int(full_state.get("total_output_tokens") or 0)

                if node_name in NODE_PROGRESS:
                    status_key, progress = NODE_PROGRESS[node_name]
                    await publish("status", {"status": status_key, "progress": progress})

                if node_name == "fast_checker":
                    fc = full_state.get("fastChecker") or {}
                    if fc.get("requested_writer_retry"):
                        await projects_service.increment_project_retry_count(
                            database, user_id, project_id
                        )

                await projects_service.patch_project_metrics(
                    database,
                    user_id,
                    project_id,
                    input_tokens=tin,
                    output_tokens=tout,
                    execution_time_seconds=elapsed,
                    status="running",
                )

        elapsed = int(time.monotonic() - start)
        tin = int(full_state.get("total_input_tokens") or 0)
        tout = int(full_state.get("total_output_tokens") or 0)

        polished = (full_state.get("polisherAgent") or {}).get("final_post") or ""
        polished = polished.strip()
        fc = full_state.get("fastChecker") or {}
        failed_facts = list(fc.get("failed_facts") or [])

        if polished:
            await projects_service.save_post_for_project(
                database,
                user_id,
                project_id,
                final_post=polished,
                failed_facts=failed_facts,
            )
            await projects_service.patch_project_metrics(
                database,
                user_id,
                project_id,
                input_tokens=tin,
                output_tokens=tout,
                execution_time_seconds=elapsed,
                status="completed",
            )
            await publish(
                "complete",
                {
                    "total_input_tokens": tin,
                    "total_output_tokens": tout,
                    "execution_time": elapsed,
                },
            )
        else:
            await projects_service.patch_project_metrics(
                database,
                user_id,
                project_id,
                input_tokens=tin,
                output_tokens=tout,
                execution_time_seconds=elapsed,
                status="failed",
            )
            await publish(
                "error",
                {"detail": "Pipeline finished without a polished post"},
            )
    except Exception as exc:
        logger.exception("Pipeline failed for project %s", project_id)
        try:
            elapsed = int(time.monotonic() - start)
            tin = int(full_state.get("total_input_tokens") or 0)
            tout = int(full_state.get("total_output_tokens") or 0)
            await projects_service.patch_project_metrics(
                database,
                user_id,
                project_id,
                input_tokens=tin,
                output_tokens=tout,
                execution_time_seconds=elapsed,
                status="failed",
            )
        except Exception:
            logger.exception("Failed to persist failed status")
        await publish("error", {"detail": str(exc)})

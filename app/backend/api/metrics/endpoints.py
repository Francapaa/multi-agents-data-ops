import logging

from fastapi import APIRouter, Depends

from config.database import Database, get_db
from dependencies import get_current_user, get_user_id_from_payload
from services import metrics as metrics_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/metrics", tags=["metrics"])


def _user_uuid(user: dict):
    try:
        return get_user_id_from_payload(user)
    except ValueError as exc:
        from fastapi import HTTPException

        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.get("/overview")
async def metrics_overview(
    user: dict = Depends(get_current_user),
    database: Database = Depends(get_db),
):
    uid = _user_uuid(user)
    logger.info("[METRICS] overview_for_user called — user_id=%s", uid)
    result = await metrics_service.overview_for_user(database, uid)
    logger.info("[METRICS] overview_for_user result: %s", result)
    return result


@router.get("/costs")
async def metrics_costs(
    user: dict = Depends(get_current_user),
    database: Database = Depends(get_db),
):
    uid = _user_uuid(user)
    logger.info("[METRICS] costs_for_user called — user_id=%s", uid)
    result = await metrics_service.costs_for_user(database, uid)
    logger.info("[METRICS] costs_for_user result: %s", result)
    return result


@router.get("/recent-posts")
async def metrics_recent_posts(
    user: dict = Depends(get_current_user),
    database: Database = Depends(get_db),
):
    uid = _user_uuid(user)
    logger.info("[METRICS] recent_posts_for_user called — user_id=%s", uid)
    rows = await metrics_service.recent_posts_for_user(database, uid, limit=10)
    logger.info("[METRICS] recent_posts_for_user returned %s rows", len(rows) if rows else 0)
    if not rows: 
        return{"posts": None}
    return {"posts": rows}


@router.get("/health")
async def metrics_health(
    user: dict = Depends(get_current_user),
    database: Database = Depends(get_db),
):
    uid = _user_uuid(user)
    logger.info("[METRICS] system_health_for_user called — user_id=%s", uid)
    result = await metrics_service.system_health_for_user(database, uid)
    logger.info("[METRICS] system_health_for_user result: %s", result)
    return result

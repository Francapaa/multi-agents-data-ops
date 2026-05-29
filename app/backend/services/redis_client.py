import json
import logging
import os

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL")
_redis = None


async def get_redis():
    import redis.asyncio as aioredis

    global _redis
    if _redis is None:
        _redis = aioredis.from_url(REDIS_URL, decode_responses=True)
        logger.info("Redis client created (shared pool)")
    return _redis


STREAM_KEY = "project:%s:stream"


async def publish_event(project_id: str, event: str, data: dict) -> None:
    """Publish an event to Redis Stream. Persistent — late subscribers can catch up."""
    try:
        r = await get_redis()
        await r.xadd(
            STREAM_KEY % project_id,
            {"event": event, "data": json.dumps(data)},
            maxlen=100,
        )
        logger.debug("Redis XADD ok: project=%s event=%s", project_id, event)
    except Exception:
        logger.exception("Redis XADD failed for project=%s event=%s", project_id, event)

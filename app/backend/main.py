import logging
import os

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import api_router
from middleware.authSession import NeonAuthMiddleware

app = FastAPI()

NEON_AUTH_BASE_URL = os.getenv("NEON_AUTH_BASE_URL")
logger.info("[MAIN] NEON_AUTH_BASE_URL=%s", NEON_AUTH_BASE_URL)
if NEON_AUTH_BASE_URL:
    app.add_middleware(NeonAuthMiddleware, neon_auth_url=NEON_AUTH_BASE_URL)
    logger.info("[MAIN] NeonAuthMiddleware added")

url_frontend: str = os.getenv("FRONTEND_URL", "")
logger.info("[MAIN] FRONTEND_URL=%s", url_frontend)

_origins = os.getenv("CORS_ORIGINS", url_frontend).strip()
logger.info("[MAIN] CORS origins: %s", _origins)
if _origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in _origins.split(",") if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    logger.info("[MAIN] CORSMiddleware added with origins: %s", _origins)

logger.info("[MAIN] Neon DB connection string set: %s", "yes" if os.getenv("NEON_DATABASE_CONNECTION_STRING") else "NO")
logger.info("[MAIN] Redis URL set: %s", "yes" if os.getenv("REDIS_URL") else "NO")

app.include_router(api_router)
logger.info("[MAIN] Router included, server ready")

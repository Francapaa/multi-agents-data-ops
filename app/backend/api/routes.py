from fastapi import APIRouter

from api.metrics import metrics_router
from api.projects import projects_router

api_router = APIRouter(prefix="/api")

api_router.include_router(projects_router)
api_router.include_router(metrics_router)
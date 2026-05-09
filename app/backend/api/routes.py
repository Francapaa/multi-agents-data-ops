from fastapi import APIRouter

from api.projects import projects_router

api_router = APIRouter(prefix="/api")

api_router.include_router(projects_router)
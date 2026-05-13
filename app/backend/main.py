from nt import error
import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import api_router
from middleware.authSession import NeonAuthMiddleware

app = FastAPI()

NEON_AUTH_BASE_URL = os.getenv("NEON_AUTH_BASE_URL")
if NEON_AUTH_BASE_URL:
    app.add_middleware(NeonAuthMiddleware, neon_auth_url=NEON_AUTH_BASE_URL)

url_frontend : str= os.getenv("FRONTEND_URL")

if not url_frontend:
    print("URL FRONTEND DOESN'T EXIST")
    

_origins = os.getenv("CORS_ORIGINS", url_frontend).strip()
if _origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in _origins.split(",") if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router)

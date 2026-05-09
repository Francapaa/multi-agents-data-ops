import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from pydantic import BaseModel
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from celery import Celery

from middleware.authSession import NeonAuthMiddleware
from api import api_router


app = FastAPI()

NEON_AUTH_BASE_URL = os.getenv("NEON_AUTH_BASE_URL")
if NEON_AUTH_BASE_URL:
    app.add_middleware(NeonAuthMiddleware, neon_auth_url=NEON_AUTH_BASE_URL)

app.include_router(api_router)

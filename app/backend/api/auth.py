from fastapi import APIRouter, Depends, Request
import os
import oauth
from ..services.auth import auth_service


router = APIRouter(prefix="/api/auth", tags=["auth"])
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")


@router.get("/google")
async def login_goolge(request: Request):
        return await oauth.google.authorize_redirect(request, GOOGLE_REDIRECT_URI)


@router.post("/callback")
async def google_callback(code:str):
    user_data = await auth_service.verify_google_user(code)
        
    return user_data
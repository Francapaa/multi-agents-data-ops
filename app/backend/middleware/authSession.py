from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from jose import createRemoteJWKSet
from urllib.parse import urlparse
import httpx

class NeonAuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, neon_auth_url: str) -> None:
        super().__init__(app)
        self.neon_auth_url = neon_auth_url.rstrip('/')
        self.jwks_url = f"{self.neon_auth_url}/.well-known/jwks.json"

    async def dispatch(self, request: Request, call_next):
        auth_header = request.headers.get('authorization')

        if not auth_header:
            return await call_next(request)
        
        if not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header")

        token = auth_header.replace("Bearer ", " ")
        payload = await self.validate_token(token)

        if not payload: 
            raise HTTPException(status_code=401, detail="Invalid authorization header")

        request.state.user = payload    

        return await call_next(request)

    async def validate_token(self, token: str) -> dict | None:
        try:
            async with httpx.AsyncClient() as client:
                JWKS = createRemoteJWKSet()
        except Exception as e:
            print(f"Token validation error: {e}")
            return None
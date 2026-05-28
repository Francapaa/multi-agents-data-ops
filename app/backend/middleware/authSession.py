import base64
from urllib.parse import urlparse

import httpx
import jwt
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

class NeonAuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, neon_auth_url: str) -> None:
        super().__init__(app)
        self.neon_auth_url = neon_auth_url.rstrip("/")
        self.jwks_url = f"{self.neon_auth_url}/.well-known/jwks.json"
        parsed = urlparse(neon_auth_url)
        self.expected_origin = f"{parsed.scheme}://{parsed.netloc}"
        self._jwks_cache: dict | None = None

    async def dispatch(self, request: Request, call_next):
        auth_header = request.headers.get("authorization")

        if not auth_header:
            return await call_next(request)

        scheme, _, token = auth_header.partition(" ")
        if scheme.lower() != "bearer" or not token:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid authorization header"},
            )

        print(f"[AUTH] Token received (first 80 chars): {token[:80]}")
        print(f"[AUTH] Token length: {len(token)}")
        print(f"[AUTH] Token segments: {token.count('.')}")
        payload = await self.validate_token(token)
        if not payload:
            return JSONResponse(status_code=401, content={"detail": "Invalid token"})

        request.state.user = payload
        print(payload)
        return await call_next(request)

    async def validate_token(self, token: str) -> dict | None:
        try:
            jwks = await self._get_jwks()
            signing_key = self._get_signing_key(token, jwks)

            payload = jwt.decode(
                token,
                key=signing_key,
                algorithms=["EdDSA"],
                issuer=self.expected_origin,
                audience=self.expected_origin,
            )
            return payload
        except Exception as e:
            print(f"[AUTH] Token validation error: {e}")
            return None

    async def _get_jwks(self) -> dict:
        if self._jwks_cache:
            return self._jwks_cache

        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(self.jwks_url)
            response.raise_for_status()
            self._jwks_cache = response.json()

        return self._jwks_cache

    def _get_signing_key(self, token: str, jwks: dict) -> Ed25519PublicKey:
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")

        #we search the key in our dictonary
        for jwk in jwks.get("keys", []):
            if jwk.get("kid") == kid:
                x_value = jwk["x"]
                padding = "=" * ((4 - len(x_value) % 4) % 4)
                #we check for errors about base64
                public_key_bytes = base64.urlsafe_b64decode(x_value + padding)
                #text => binary
                return Ed25519PublicKey.from_public_bytes(public_key_bytes)

        raise ValueError("No signing key found for token kid")


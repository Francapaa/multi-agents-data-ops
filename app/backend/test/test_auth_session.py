import asyncio
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from backend.middleware.authSession import NeonAuthMiddleware


class TestNeonAuthMiddleware(NeonAuthMiddleware):
    """Middleware controlado para testear dispatch sin pegar a red."""
    __test__ = False # to prevent the warning
    async def validate_token(self, token: str):
        if token == "valid-token":
            return {"sub": "user-123", "email": "test@example.com"}
        if token == "raise-error":
            raise RuntimeError("forced error")
        return None


def build_test_app() -> FastAPI:
    app = FastAPI()
    app.add_middleware(
        TestNeonAuthMiddleware,
        neon_auth_url="https://example.neonauth.aws.neon.tech/neondb/auth",
    )

    @app.get("/health")
    async def health(request: Request):
        return {"ok": True, "user": getattr(request.state, "user", None)}

    return app


def test_without_authorization_header_passes_through():
    client = TestClient(build_test_app())

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"ok": True, "user": None}


def test_invalid_authorization_header_returns_401():
    client = TestClient(build_test_app())

    response = client.get("/health", headers={"Authorization": "Token abc"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid authorization header"


def test_invalid_bearer_token_returns_401():
    client = TestClient(build_test_app())

    response = client.get("/health", headers={"Authorization": "Bearer invalid-token"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid token"


def test_valid_bearer_token_sets_request_state_user():
    client = TestClient(build_test_app())

    response = client.get("/health", headers={"Authorization": "Bearer valid-token"})

    assert response.status_code == 200
    body = response.json()
    assert body["ok"] is True
    assert body["user"]["sub"] == "user-123"
    assert body["user"]["email"] == "test@example.com"


def test_validate_token_returns_none_on_internal_error(monkeypatch):
    middleware = NeonAuthMiddleware(
        app=lambda scope, receive, send: None,
        neon_auth_url="https://example.neonauth.aws.neon.tech/neondb/auth",
    )

    async def explode():
        raise RuntimeError("network error")

    monkeypatch.setattr(middleware, "_get_jwks", explode)

    result = asyncio.run(middleware.validate_token("any-token"))
    assert result is None

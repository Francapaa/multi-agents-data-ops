import asyncio
import base64
from datetime import datetime, timedelta, timezone

import jwt
from cryptography.hazmat.primitives.asymmetric import ed25519

from backend.middleware.authSession import NeonAuthMiddleware


def _build_crypto_materials():
    private_key = ed25519.Ed25519PrivateKey.generate()
    public_key = private_key.public_key()
    public_key_bytes = public_key.public_bytes_raw()
    x_value = base64.urlsafe_b64encode(public_key_bytes).decode().rstrip("=")
    kid = "test-kid-1"
    jwks = {"keys": [{"kty": "OKP", "crv": "Ed25519", "kid": kid, "x": x_value}]}
    return private_key, jwks, kid


def _build_neon_token(private_key, kid, issuer, audience, expires_delta_seconds=900):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "user-123",
        "email": "test@example.com",
        "role": "authenticated",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=expires_delta_seconds)).timestamp()),
        "iss": issuer,
        "aud": audience,
    }
    return jwt.encode(payload, private_key, algorithm="EdDSA", headers={"kid": kid})


def _build_middleware():
    return NeonAuthMiddleware(
        app=lambda scope, receive, send: None,
        neon_auth_url="https://example.neonauth.aws.neon.tech/neondb/auth",
    )


def test_validate_token_success_with_real_eddsa_and_jwks(monkeypatch):
    middleware = _build_middleware()
    private_key, jwks, kid = _build_crypto_materials()
    token = _build_neon_token(
        private_key=private_key,
        kid=kid,
        issuer=middleware.expected_origin,
        audience=middleware.expected_origin,
    )

    async def fake_get_jwks():
        return jwks

    monkeypatch.setattr(middleware, "_get_jwks", fake_get_jwks)
    payload = asyncio.run(middleware.validate_token(token))

    assert payload is not None
    assert payload["sub"] == "user-123"
    assert payload["email"] == "test@example.com"


def test_validate_token_fails_when_kid_does_not_exist(monkeypatch):
    middleware = _build_middleware()
    private_key, jwks, _ = _build_crypto_materials()
    token = _build_neon_token(
        private_key=private_key,
        kid="unknown-kid",
        issuer=middleware.expected_origin,
        audience=middleware.expected_origin,
    )

    async def fake_get_jwks():
        return jwks

    monkeypatch.setattr(middleware, "_get_jwks", fake_get_jwks)
    payload = asyncio.run(middleware.validate_token(token))

    assert payload is None


def test_validate_token_fails_with_wrong_issuer(monkeypatch):
    middleware = _build_middleware()
    private_key, jwks, kid = _build_crypto_materials()
    token = _build_neon_token(
        private_key=private_key,
        kid=kid,
        issuer="https://evil.example.com",
        audience=middleware.expected_origin,
    )

    async def fake_get_jwks():
        return jwks

    monkeypatch.setattr(middleware, "_get_jwks", fake_get_jwks)
    payload = asyncio.run(middleware.validate_token(token))

    assert payload is None


def test_validate_token_fails_with_wrong_audience(monkeypatch):
    middleware = _build_middleware()
    private_key, jwks, kid = _build_crypto_materials()
    token = _build_neon_token(
        private_key=private_key,
        kid=kid,
        issuer=middleware.expected_origin,
        audience="https://another.example.com",
    )

    async def fake_get_jwks():
        return jwks

    monkeypatch.setattr(middleware, "_get_jwks", fake_get_jwks)
    payload = asyncio.run(middleware.validate_token(token))

    assert payload is None


def test_validate_token_fails_when_expired(monkeypatch):
    middleware = _build_middleware()
    private_key, jwks, kid = _build_crypto_materials()
    token = _build_neon_token(
        private_key=private_key,
        kid=kid,
        issuer=middleware.expected_origin,
        audience=middleware.expected_origin,
        expires_delta_seconds=-10,
    )

    async def fake_get_jwks():
        return jwks

    monkeypatch.setattr(middleware, "_get_jwks", fake_get_jwks)
    payload = asyncio.run(middleware.validate_token(token))

    assert payload is None

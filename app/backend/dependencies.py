from uuid import UUID

from fastapi import HTTPException, Request


async def get_current_user(request: Request):
    """Dependency to get the current user from the request state."""
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


def get_user_id_from_payload(payload: dict) -> UUID:
    """Extract user ID from the JWT payload as a UUID."""
    raw = payload.get("sub") or payload.get("id")
    if raw is None:
        raise ValueError("User ID not found in token")
    try:
        return UUID(str(raw))
    except ValueError as exc:
        raise ValueError(
            "User identifier in token must be a valid UUID",
        ) from exc
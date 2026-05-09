from fastapi import Depends, HTTPException, Request


async def get_current_user(request: Request):
    """Dependency to get the current user from the request state."""
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


def get_user_id_from_payload(payload: dict) -> str:
    """Extract user ID from the JWT payload."""
    return payload.get("sub") or payload.get("id")
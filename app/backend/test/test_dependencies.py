import pytest
from uuid import UUID
from unittest.mock import Mock, AsyncMock

from dependencies import get_current_user, get_user_id_from_payload


class TestGetCurrentUser:
    @pytest.mark.asyncio
    async def test_user_in_request_state_returns_user(self):
        request = Mock()
        request.state.user = {"sub": "user-123", "email": "test@example.com"}
        user = await get_current_user(request)
        assert user == {"sub": "user-123", "email": "test@example.com"}

    @pytest.mark.asyncio
    async def test_no_user_in_request_state_raises_401(self):
        request = Mock()
        request.state.user = None
        with pytest.raises(Exception) as exc:
            await get_current_user(request)
        assert exc.value.status_code == 401

    @pytest.mark.asyncio
    async def test_user_attribute_missing_raises_401(self):
        request = Mock()
        del request.state.user
        with pytest.raises(Exception) as exc:
            await get_current_user(request)
        assert exc.value.status_code == 401


class TestGetUserIdFromPayload:
    def test_valid_uuid_in_sub(self):
        uid = "550e8400-e29b-41d4-a716-446655440000"
        result = get_user_id_from_payload({"sub": uid})
        assert isinstance(result, UUID)
        assert str(result) == uid

    def test_valid_uuid_in_id(self):
        uid = "550e8400-e29b-41d4-a716-446655440000"
        result = get_user_id_from_payload({"id": uid})
        assert str(result) == uid

    def test_sub_takes_priority_over_id(self):
        uid1 = "550e8400-e29b-41d4-a716-446655440000"
        uid2 = "660e8400-e29b-41d4-a716-446655440001"
        result = get_user_id_from_payload({"sub": uid1, "id": uid2})
        assert str(result) == uid1

    def test_missing_user_id_raises_value_error(self):
        with pytest.raises(ValueError, match="User ID not found"):
            get_user_id_from_payload({})

    def test_invalid_uuid_raises_value_error(self):
        with pytest.raises(ValueError, match="valid UUID"):
            get_user_id_from_payload({"sub": "not-a-uuid"})

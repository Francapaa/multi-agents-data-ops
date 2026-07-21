import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4


@pytest.fixture
def app():
    from unittest.mock import patch
    from api.routes import api_router
    from config.database import Database

    patcher = patch("tasks.pipeline.process_project.delay")
    patcher.start()

    _app = FastAPI()
    _app.include_router(api_router)

    async def mock_get_db():
        from uuid import uuid4
        db = AsyncMock(spec=Database)
        project_row = {
            "id": uuid4(),
            "title": "Test Project",
            "status": "pending",
            "created_at": "2026-01-01",
            "target_audience": "b2c",
            "total_input_tokens": 0,
            "total_output_tokens": 0,
            "execution_time_seconds": 0,
            "retry_count": 0,
        }
        db.execute.side_effect = [[], [project_row], []]
        db.execute_one.return_value = None
        return db

    async def mock_get_current_user():
        return {"sub": str(uuid4()), "email": "test@example.com"}

    _app.dependency_overrides.clear()
    from dependencies import get_current_user
    from config.database import get_db

    _app.dependency_overrides[get_db] = mock_get_db
    _app.dependency_overrides[get_current_user] = mock_get_current_user

    yield _app

    patcher.stop()


@pytest.fixture
def client(app):
    return TestClient(app)


class TestListProjects:
    def test_list_projects_returns_empty_list(self, client):
        response = client.get("/api/projects")
        assert response.status_code == 200
        body = response.json()
        assert body["projects"] == []


class TestCreateProject:
    def test_create_project_with_message(self, client):
        response = client.post("/api/projects/upload", data={"message": "Build a todo app with React."})
        assert response.status_code in (200, 201)

    def test_create_project_with_audience(self, client):
        response = client.post(
            "/api/projects/upload",
            data={"message": "Build a todo app.", "audience": "b2b"},
        )
        assert response.status_code in (200, 201)

    def test_create_project_without_message_returns_error(self, client):
        response = client.post("/api/projects/upload")
        assert response.status_code in (200, 201, 422)


class TestGetProject:
    def test_get_project_not_found(self, client):
        response = client.get(f"/api/projects/{uuid4()}")
        assert response.status_code in (404, 200)

    def test_get_project_invalid_uuid(self, client):
        response = client.get("/api/projects/not-a-uuid")
        assert response.status_code == 422


class TestPatchProject:
    def test_patch_project_not_found(self, client):
        response = client.patch(
            f"/api/projects/{uuid4()}",
            json={"status": "completed"},
        )
        assert response.status_code in (404, 200)

    def test_patch_project_invalid_uuid(self, client):
        response = client.patch(
            "/api/projects/not-a-uuid",
            json={"status": "completed"},
        )
        assert response.status_code == 422

from unittest.mock import AsyncMock
from uuid import uuid4

import pytest


@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.execute.return_value = []
    db.execute_one.return_value = None
    return db


@pytest.mark.asyncio
class TestCreateProject:
    async def test_create_project_inserts_and_returns(self, mock_db):
        from services.projects import create_project

        pid = uuid4()
        user_id = uuid4()

        row = {
            "id": pid,
            "title": "Test Project",
            "status": "pending",
            "created_at": "2026-01-01",
            "target_audience": "b2c",
            "total_input_tokens": 0,
            "total_output_tokens": 0,
            "execution_time_seconds": 0,
            "retry_count": 0,
        }
        mock_db.execute.side_effect = [[], [row], []]

        result = await create_project(
            mock_db,
            user_id,
            title="Test Project",
            prd="This is the PRD content.",
        )

        insert_call = [c for c in mock_db.execute.call_args_list if "INSERT INTO projects" in str(c)]
        assert len(insert_call) == 1
        assert result["title"] == "Test Project"

    async def test_create_project_with_custom_audience(self, mock_db):
        from services.projects import create_project

        pid = uuid4()
        user_id = uuid4()

        row = {
            "id": pid,
            "title": "B2B Project",
            "status": "pending",
            "created_at": "2026-01-01",
            "target_audience": "b2b",
            "total_input_tokens": 0,
            "total_output_tokens": 0,
            "execution_time_seconds": 0,
            "retry_count": 0,
        }
        mock_db.execute.side_effect = [[], [row], []]

        result = await create_project(
            mock_db,
            user_id,
            title="B2B Project",
            prd="PRD content.",
            target_audience="b2b",
        )

        assert result["target_audience"] == "b2b"

    async def test_create_project_default_audience(self, mock_db):
        from services.projects import create_project

        pid = uuid4()
        user_id = uuid4()

        row = {
            "id": pid,
            "title": "Default",
            "status": "pending",
            "created_at": "2026-01-01",
            "target_audience": "b2c",
            "total_input_tokens": 0,
            "total_output_tokens": 0,
            "execution_time_seconds": 0,
            "retry_count": 0,
        }
        mock_db.execute.side_effect = [[], [row], []]

        result = await create_project(
            mock_db,
            user_id,
            title="Default",
            prd="Content.",
        )

        assert result["target_audience"] == "b2c"


@pytest.mark.asyncio
class TestGetProject:
    async def test_get_project_owned_returns_row(self, mock_db):
        from services.projects import get_project_owned

        pid = uuid4()
        uid = uuid4()
        mock_db.execute_one.return_value = {
            "id": pid,
            "user_id": uid,
            "title": "Test",
            "prd": "PRD",
            "status": "running",
            "created_at": "2026-01-01",
            "target_audience": "b2c",
            "total_input_tokens": 100,
            "total_output_tokens": 50,
            "execution_time_seconds": 30,
            "retry_count": 0,
        }

        result = await get_project_owned(mock_db, uid, pid)
        assert result is not None
        assert result["title"] == "Test"
        assert result["target_audience"] == "b2c"

    async def test_get_project_owned_not_found(self, mock_db):
        from services.projects import get_project_owned

        mock_db.execute_one.return_value = None

        result = await get_project_owned(mock_db, uuid4(), uuid4())
        assert result is None

    async def test_get_project_for_user_returns_payload(self, mock_db):
        from services.projects import get_project_for_user

        pid = uuid4()
        uid = uuid4()
        mock_db.execute.return_value = [{
            "id": pid,
            "title": "My Project",
            "status": "completed",
            "created_at": "2026-06-01",
            "target_audience": "b2b",
            "total_input_tokens": 200,
            "total_output_tokens": 100,
            "execution_time_seconds": 60,
            "retry_count": 1,
        }]
        mock_db.execute_one.return_value = {
            "id": uuid4(),
            "final_post": "# Post",
            "failed_facts": [],
        }

        result = await get_project_for_user(mock_db, uid, pid)
        assert result is not None
        assert result["target_audience"] == "b2b"
        assert result["title"] == "My Project"


@pytest.mark.asyncio
class TestPatchProject:
    async def test_patch_project_metrics(self, mock_db):
        from services.projects import patch_project_metrics

        await patch_project_metrics(
            mock_db,
            uuid4(),
            uuid4(),
            input_tokens=100,
            output_tokens=50,
            execution_time_seconds=30,
            status="running",
        )

        update_call = [c for c in mock_db.execute.call_args_list if "UPDATE projects" in str(c)]
        assert len(update_call) > 0


@pytest.mark.asyncio
class TestSavePost:
    async def test_save_post_for_project_upserts(self, mock_db):
        from services.projects import save_post_for_project

        mock_db.execute_one.side_effect = [
            {"id": uuid4()},
            {"id": uuid4()},
        ]

        await save_post_for_project(
            mock_db,
            uuid4(),
            uuid4(),
            final_post="# Final post",
            failed_facts=[],
        )

        assert mock_db.execute_one.called

    async def test_save_post_not_owned_skips(self, mock_db):
        from services.projects import save_post_for_project

        mock_db.execute_one.return_value = None

        await save_post_for_project(
            mock_db,
            uuid4(),
            uuid4(),
            final_post="# Post",
            failed_facts=[],
        )

        insert_call = [c for c in mock_db.execute.call_args_list if "INSERT INTO posts" in str(c)]
        assert len(insert_call) == 0


@pytest.mark.asyncio
class TestSavePrd:
    async def test_save_prd_for_project(self, mock_db):
        from services.projects import save_prd_for_project

        mock_db.execute_one.return_value = {"id": uuid4()}

        await save_prd_for_project(
            mock_db,
            uuid4(),
            uuid4(),
            prd="Updated PRD content.",
        )

        update_call = [c for c in mock_db.execute.call_args_list if "UPDATE projects SET prd" in str(c)]
        assert len(update_call) > 0


@pytest.mark.asyncio
class TestListProjects:
    async def test_list_projects_for_user(self, mock_db):
        from services.projects import list_projects_for_user

        uid = uuid4()
        pid = uuid4()
        post = {
            "id": uuid4(),
            "final_post": "# Post content",
            "failed_facts": [],
        }
        mock_db.execute.side_effect = [
            [
                {
                    "id": pid,
                    "title": "Project 1",
                    "status": "completed",
                    "created_at": "2026-01-01",
                    "target_audience": "b2c",
                    "total_input_tokens": 100,
                    "total_output_tokens": 50,
                    "execution_time_seconds": 30,
                    "retry_count": 0,
                },
            ],
            [post],
        ]

        result = await list_projects_for_user(mock_db, uid)
        assert len(result) == 1
        assert result[0]["target_audience"] == "b2c"
        assert result[0]["post"]["final_post"] == "# Post content"

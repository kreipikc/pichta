from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
from fastapi import HTTPException, status

from routers.task.schemas import TaskCreateSelf, TaskUpdate
from routers.task.service import TaskRepository


pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
def session():
    session = Mock()
    session.add = Mock()
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.delete = AsyncMock()
    return session


def make_task(**overrides):
    base = {
        "id": 1,
        "id_user": 7,
        "title": "Initial title",
        "description": "Initial description",
        "status": "pending",
        "start_time": datetime(2026, 4, 6, 12, 0, tzinfo=timezone.utc),
        "end_time": None,
        "created_from": 7,
    }
    base.update(overrides)
    return SimpleNamespace(**base)


async def test_get_task_returns_result_from_session(session):
    task = make_task()
    result = Mock()
    result.scalar_one_or_none.return_value = task
    session.execute.return_value = result
    repository = TaskRepository(session)

    found_task = await repository.get_task(1)

    assert found_task is task
    session.execute.assert_awaited_once()


async def test_create_task_for_self_normalizes_naive_datetime(session):
    async def refresh_side_effect(task):
        task.id = 123

    session.refresh.side_effect = refresh_side_effect
    repository = TaskRepository(session)
    naive_start_time = datetime(2026, 4, 6, 9, 30)
    task_data = TaskCreateSelf(
        title="Write tests",
        description="Repository level test",
        status="in_progress",
        start_time=naive_start_time,
        created_from=999,
    )

    result = await repository.create_task_for_self(7, task_data)

    added_task = session.add.call_args.args[0]
    assert added_task.id_user == 7
    assert added_task.created_from == 7
    assert added_task.start_time.tzinfo == timezone.utc
    assert added_task.end_time is None
    assert result.id == 123
    assert result.title == "Write tests"
    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once_with(added_task)


async def test_create_task_for_self_uses_current_utc_time_when_start_time_missing(session):
    async def refresh_side_effect(task):
        task.id = 456

    session.refresh.side_effect = refresh_side_effect
    repository = TaskRepository(session)
    task_data = TaskCreateSelf(
        title="Plan next step",
        description=None,
        status="pending",
        start_time=None,
        created_from=123,
    )

    before_call = datetime.now(timezone.utc)
    result = await repository.create_task_for_self(7, task_data)
    after_call = datetime.now(timezone.utc)

    added_task = session.add.call_args.args[0]
    assert before_call <= added_task.start_time <= after_call
    assert added_task.start_time.tzinfo == timezone.utc
    assert result.id == 456


async def test_update_task_updates_only_provided_fields(session, monkeypatch):
    repository = TaskRepository(session)
    task = make_task()
    monkeypatch.setattr(repository, "get_task", AsyncMock(return_value=task))
    task_data = TaskUpdate(title="Updated title")

    result = await repository.update_task(1, task_data)

    assert task.title == "Updated title"
    assert task.description == "Initial description"
    assert task.status == "pending"
    assert result.title == "Updated title"
    session.commit.assert_awaited_once()
    session.refresh.assert_awaited_once_with(task)


async def test_update_task_raises_404_when_task_not_found(session, monkeypatch):
    repository = TaskRepository(session)
    monkeypatch.setattr(repository, "get_task", AsyncMock(return_value=None))

    with pytest.raises(HTTPException) as exc_info:
        await repository.update_task(99, TaskUpdate(title="Missing task"))

    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
    assert exc_info.value.detail == "Task not found"
    session.commit.assert_not_awaited()
    session.refresh.assert_not_awaited()


async def test_delete_task_deletes_existing_task(session, monkeypatch):
    repository = TaskRepository(session)
    task = make_task()
    monkeypatch.setattr(repository, "get_task", AsyncMock(return_value=task))

    await repository.delete_task(1)

    session.delete.assert_awaited_once_with(task)
    session.commit.assert_awaited_once()


async def test_delete_task_raises_404_when_task_not_found(session, monkeypatch):
    repository = TaskRepository(session)
    monkeypatch.setattr(repository, "get_task", AsyncMock(return_value=None))

    with pytest.raises(HTTPException) as exc_info:
        await repository.delete_task(404)

    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
    assert exc_info.value.detail == "Task not found"
    session.delete.assert_not_awaited()
    session.commit.assert_not_awaited()

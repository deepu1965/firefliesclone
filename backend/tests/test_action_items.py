"""Action item CRUD integration tests."""
import pytest

from app.core.exceptions import NotFoundError
from app.schemas.action_item import ActionItemCreate, ActionItemUpdate
from app.schemas.meeting import MeetingCreate
from app.services.action_item_service import action_item_service
from app.services.meeting_service import meeting_service


async def _create_test_meeting(db):
    return await meeting_service.create_meeting(db, MeetingCreate(title="Action Item Test Meeting"))


async def test_create_action_item(db):
    meeting = await _create_test_meeting(db)

    item = await action_item_service.create_action_item(
        db,
        meeting.external_id,
        ActionItemCreate(description="Write unit tests", priority="high"),
    )

    assert item.external_id is not None
    assert item.description == "Write unit tests"
    assert item.status == "pending"
    assert item.priority == "high"


async def test_list_action_items(db):
    meeting = await _create_test_meeting(db)

    await action_item_service.create_action_item(
        db, meeting.external_id, ActionItemCreate(description="Task 1")
    )
    await action_item_service.create_action_item(
        db, meeting.external_id, ActionItemCreate(description="Task 2")
    )

    items = await action_item_service.list_action_items(db, meeting.external_id)
    assert len(items) == 2


async def test_update_action_item_status(db):
    meeting = await _create_test_meeting(db)
    item = await action_item_service.create_action_item(
        db, meeting.external_id, ActionItemCreate(description="Complete me")
    )

    updated = await action_item_service.update_action_item(
        db, item.external_id, ActionItemUpdate(status="completed")
    )
    assert updated.status == "completed"
    assert updated.description == "Complete me"


async def test_update_action_item_description(db):
    meeting = await _create_test_meeting(db)
    item = await action_item_service.create_action_item(
        db, meeting.external_id, ActionItemCreate(description="Old description")
    )

    updated = await action_item_service.update_action_item(
        db,
        item.external_id,
        ActionItemUpdate(description="New description", priority="low"),
    )
    assert updated.description == "New description"
    assert updated.priority == "low"


async def test_delete_action_item(db):
    meeting = await _create_test_meeting(db)
    item = await action_item_service.create_action_item(
        db, meeting.external_id, ActionItemCreate(description="Delete me")
    )

    await action_item_service.delete_action_item(db, item.external_id)

    with pytest.raises(NotFoundError):
        await action_item_service.update_action_item(
            db, item.external_id, ActionItemUpdate(status="completed")
        )


async def test_action_item_not_found(db):
    with pytest.raises(NotFoundError):
        await action_item_service.update_action_item(
            db, "nonexistentid", ActionItemUpdate(status="completed")
        )


async def test_filter_action_items_by_status(db):
    meeting = await _create_test_meeting(db)

    item1 = await action_item_service.create_action_item(
        db, meeting.external_id, ActionItemCreate(description="Pending task")
    )
    item2 = await action_item_service.create_action_item(
        db, meeting.external_id, ActionItemCreate(description="Complete task")
    )
    await action_item_service.update_action_item(
        db, item2.external_id, ActionItemUpdate(status="completed")
    )

    pending = await action_item_service.list_action_items(db, meeting.external_id, status="pending")
    completed = await action_item_service.list_action_items(db, meeting.external_id, status="completed")

    assert all(i.status == "pending" for i in pending)
    assert all(i.status == "completed" for i in completed)

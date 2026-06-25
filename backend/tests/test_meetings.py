"""Meeting CRUD integration tests using the service and repository layers."""
import uuid

import pytest

from app.models import Meeting, User
from app.repositories.meeting_repo import meeting_repo
from app.schemas.meeting import MeetingCreate, MeetingUpdate
from app.services.meeting_service import meeting_service


async def _create_user(db) -> User:
    user = User(
        external_id=str(uuid.uuid4()).replace("-", ""),
        email=f"test_{uuid.uuid4().hex[:6]}@example.com",
        name="Test User",
    )
    db.add(user)
    await db.flush()
    return user


async def test_create_user_and_meeting(db):
    user = await _create_user(db)

    meeting = Meeting(
        external_id=str(uuid.uuid4()).replace("-", ""),
        title="Test Meeting",
        host_user_id=user.id,
        duration_seconds=1800,
        status="processed",
    )
    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)

    assert meeting.id is not None
    assert meeting.title == "Test Meeting"
    assert meeting.status == "processed"


async def test_meeting_service_create(db):
    data = MeetingCreate(
        title="Service Created Meeting",
        duration_seconds=3600,
        participants=[],
    )
    result = await meeting_service.create_meeting(db, data)

    assert result.external_id is not None
    assert result.title == "Service Created Meeting"
    assert result.duration_seconds == 3600


async def test_meeting_service_get(db):
    data = MeetingCreate(title="Get Test Meeting", duration_seconds=900)
    created = await meeting_service.create_meeting(db, data)

    fetched = await meeting_service.get_meeting(db, created.external_id)
    assert fetched.external_id == created.external_id
    assert fetched.title == "Get Test Meeting"


async def test_meeting_service_update(db):
    data = MeetingCreate(title="Original Title")
    created = await meeting_service.create_meeting(db, data)

    update_data = MeetingUpdate(title="Updated Title")
    updated = await meeting_service.update_meeting(db, created.external_id, update_data)

    assert updated.title == "Updated Title"
    assert updated.external_id == created.external_id


async def test_meeting_service_delete(db):
    from app.core.exceptions import NotFoundError

    data = MeetingCreate(title="To Be Deleted")
    created = await meeting_service.create_meeting(db, data)

    await meeting_service.delete_meeting(db, created.external_id)

    with pytest.raises(NotFoundError):
        await meeting_service.get_meeting(db, created.external_id)


async def test_meeting_list_pagination(db):
    for i in range(5):
        await meeting_service.create_meeting(db, MeetingCreate(title=f"Paginate Meeting {i}"))

    page1 = await meeting_service.list_meetings(db, page=1, page_size=3)
    assert len(page1.items) == 3
    assert page1.total >= 5
    assert page1.pages >= 2


async def test_meeting_list_search(db):
    await meeting_service.create_meeting(db, MeetingCreate(title="Alpha Search Meeting"))
    await meeting_service.create_meeting(db, MeetingCreate(title="Beta Meeting"))

    results = await meeting_service.list_meetings(db, q="Alpha Search")
    assert any("Alpha Search" in item.title for item in results.items)


async def test_meeting_not_found(db):
    from app.core.exceptions import NotFoundError

    with pytest.raises(NotFoundError):
        await meeting_service.get_meeting(db, "nonexistentid")

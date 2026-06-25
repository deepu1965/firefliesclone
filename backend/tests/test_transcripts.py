"""Transcript parser unit tests and transcript retrieval integration tests."""
import uuid

import pytest

from app.models import Meeting, Transcript, User
from app.repositories.transcript_repo import transcript_repo
from app.schemas.meeting import MeetingCreate
from app.services.meeting_service import meeting_service
from app.services.transcript_service import transcript_service
from app.utils.transcript_parser import parse_transcript


def test_parse_vtt_basic():
    vtt = """WEBVTT

00:00:01.000 --> 00:00:05.500
<v Alice Chen>Hello world, this is a test.

00:00:06.000 --> 00:00:10.200
<v Bob Martinez>This is the second segment.
"""
    segs = parse_transcript(vtt, fmt="vtt")
    assert len(segs) == 2
    assert segs[0]["speaker_name"] == "Alice Chen"
    assert segs[0]["start_time_ms"] == 1000
    assert segs[0]["end_time_ms"] == 5500
    assert segs[0]["text"] == "Hello world, this is a test."
    assert segs[1]["speaker_name"] == "Bob Martinez"
    assert segs[1]["sequence_index"] == 1


def test_parse_vtt_colon_speaker():
    vtt = """WEBVTT

00:00:01.000 --> 00:00:05.000
Alice: This uses the colon speaker format.
"""
    segs = parse_transcript(vtt, fmt="vtt")
    assert len(segs) == 1
    assert segs[0]["speaker_name"] == "Alice"
    assert "colon speaker format" in segs[0]["text"]


def test_parse_txt():
    txt = "Line one of transcript.\nLine two of transcript.\n"
    segs = parse_transcript(txt, fmt="txt")
    assert len(segs) == 2
    assert segs[0]["speaker_name"] == "Speaker 1"
    assert segs[0]["start_time_ms"] == 0
    assert segs[1]["start_time_ms"] == 30000


def test_parse_json():
    import json
    data = [
        {"speaker_name": "Alice", "start_time_ms": 0, "end_time_ms": 5000, "text": "Hello"},
        {"speaker_name": "Bob", "start_time_ms": 5500, "end_time_ms": 10000, "text": "World"},
    ]
    segs = parse_transcript(json.dumps(data), fmt="json")
    assert len(segs) == 2
    assert segs[0]["speaker_name"] == "Alice"
    assert segs[1]["end_time_ms"] == 10000


def test_end_time_guard():
    """end_time_ms must always be > start_time_ms after parsing."""
    vtt = """WEBVTT

00:00:05.000 --> 00:00:05.000
<v Test>Identical start and end.
"""
    segs = parse_transcript(vtt, fmt="vtt")
    assert segs[0]["end_time_ms"] > segs[0]["start_time_ms"]


async def test_transcript_retrieval_via_service(db):
    meeting = await meeting_service.create_meeting(db, MeetingCreate(title="Transcript Test Meeting"))

    raw_text = "This is line one.\nThis is line two.\n"
    result = await transcript_service.create_transcript(
        db, meeting.external_id, raw_text=raw_text
    )

    assert result.id is not None
    assert result.total_segments == 2
    assert result.segments[0].sequence_index == 0


async def test_bulk_insert_segments(db):
    user = User(
        external_id=str(uuid.uuid4()).replace("-", ""),
        email=f"bulk_{uuid.uuid4().hex[:6]}@example.com",
        name="Bulk Test",
    )
    db.add(user)
    await db.flush()

    meeting = Meeting(
        external_id=str(uuid.uuid4()).replace("-", ""),
        title="Bulk Insert Meeting",
        host_user_id=user.id,
        status="processed",
    )
    db.add(meeting)
    await db.flush()

    transcript = Transcript(meeting_id=meeting.id, source="seeded")
    db.add(transcript)
    await db.flush()

    segments = [
        {
            "speaker_name": f"Speaker {i}",
            "start_time_ms": i * 5000,
            "end_time_ms": (i + 1) * 5000,
            "text": f"Segment {i} text content.",
            "sequence_index": i,
        }
        for i in range(30)
    ]
    await transcript_repo.bulk_insert_segments(db, transcript.id, segments)
    await db.commit()

    refreshed = await transcript_repo.get_by_meeting_id(db, meeting.id)
    assert len(refreshed.segments) == 30

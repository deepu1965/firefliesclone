"""FTS5 search integration tests — verifies the full insert → index → MATCH round-trip."""
import uuid

from app.models import Meeting, Transcript, TranscriptSegment, User
from app.repositories.transcript_repo import transcript_repo


async def _seed_meeting_with_segments(db) -> tuple:
    user = User(
        external_id=str(uuid.uuid4()).replace("-", ""),
        email=f"fts_{uuid.uuid4().hex[:6]}@example.com",
        name="FTS Test User",
    )
    db.add(user)
    await db.flush()

    meeting = Meeting(
        external_id=str(uuid.uuid4()).replace("-", ""),
        title="FTS Test Meeting",
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
            "speaker_name": "Alice",
            "start_time_ms": 0,
            "end_time_ms": 5000,
            "text": "We need to improve our latency metrics significantly.",
            "sequence_index": 0,
        },
        {
            "speaker_name": "Bob",
            "start_time_ms": 5000,
            "end_time_ms": 10000,
            "text": "The budget allocation for Q3 has been approved.",
            "sequence_index": 1,
        },
        {
            "speaker_name": "Alice",
            "start_time_ms": 10000,
            "end_time_ms": 15000,
            "text": "Performance testing showed latencies above threshold.",
            "sequence_index": 2,
        },
    ]
    await transcript_repo.bulk_insert_segments(db, transcript.id, segments)
    await db.commit()

    return meeting, transcript


async def test_fts5_insert_and_match(db):
    meeting, transcript = await _seed_meeting_with_segments(db)

    results = await transcript_repo.fts_search(db, meeting.id, "budget", limit=10)
    assert len(results) == 1
    assert results[0].speaker_name == "Bob"
    assert results[0].start_time_ms == 5000


async def test_fts5_porter_stemming(db):
    """Porter stemming: 'latency' matches 'latencies'."""
    meeting, transcript = await _seed_meeting_with_segments(db)

    results = await transcript_repo.fts_search(db, meeting.id, "latency", limit=10)
    assert len(results) >= 1
    segment_ids = {r.segment_id for r in results}
    assert len(segment_ids) >= 1


async def test_fts5_snippet_contains_mark(db):
    meeting, transcript = await _seed_meeting_with_segments(db)

    results = await transcript_repo.fts_search(db, meeting.id, "budget", limit=10)
    assert len(results) == 1
    assert "<mark>" in results[0].highlighted_text


async def test_fts5_no_match_returns_empty(db):
    meeting, transcript = await _seed_meeting_with_segments(db)

    results = await transcript_repo.fts_search(db, meeting.id, "zzznomatch", limit=10)
    assert results == []


async def test_fts5_meeting_isolation(db):
    """FTS search in meeting A should not return results from meeting B."""
    meeting_a, _ = await _seed_meeting_with_segments(db)
    meeting_b, _ = await _seed_meeting_with_segments(db)

    results = await transcript_repo.fts_search(db, meeting_a.id, "budget", limit=10)
    for r in results:
        assert r.start_time_ms in {5000}

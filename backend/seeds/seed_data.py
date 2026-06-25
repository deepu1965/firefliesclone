"""
Seed database with 5 realistic meetings.

Run: python -m seeds.seed_data  (from backend/ directory)

Idempotent: if any user exists the script exits without making changes.
"""
import asyncio
import json
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Allow running as a module from the backend/ directory
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select

from app.db.session import async_session_factory
from app.models import (
    ActionItem,
    Meeting,
    Participant,
    Summary,
    Topic,
    Transcript,
    TranscriptSegment,
    User,
)
from app.utils.transcript_parser import parse_transcript

TRANSCRIPT_DIR = Path(__file__).parent / "transcripts"

NOW = datetime.now(tz=timezone.utc)

# ─────────────────────────────────────────────────────────────
# MEETING DEFINITIONS
# Each entry follows the audit spec requirements:
#   - started_at distributed: 2 this week, 1 last week, 1 three weeks ago, 1 six weeks ago
#   - action_item statuses: 1 completed, 1 in_progress, 1 pending per meeting
#   - speaker roster defined first; exact strings used in participants AND segments
# ─────────────────────────────────────────────────────────────

MEETINGS = [
    {
        "title": "Q3 Product Roadmap Review",
        "vtt_file": "q3_review.vtt",
        "started_at_offset_days": -1,   # yesterday → this week
        "duration_seconds": 600,
        "speakers": [
            {"name": "Alice Chen",   "email": "alice@company.com",  "role": "host"},
            {"name": "Bob Martinez", "email": "bob@company.com",    "role": "attendee"},
            {"name": "Carol Zhang",  "email": "carol@company.com",  "role": "attendee"},
            {"name": "David Kim",    "email": "david@company.com",  "role": "attendee"},
        ],
        "summary": {
            "overview": (
                "The Q3 roadmap review covered three major product tracks: AI assistant beta launch, "
                "mobile app redesign, and database infrastructure scalability. "
                "The team aligned on prioritizing transcript schema migration as a P0 item before "
                "the AI feature ships, and scheduled a build-vs-buy analysis for LLM infrastructure."
            ),
            "key_points": [
                "Onboarding activation rate improved 27% after removing mandatory credit card step",
                "AI assistant beta targeting end of August with 80% confidence",
                "Schema migration to segmented transcripts is P0 — Carol to deliver design doc by Thursday",
                "Build-vs-buy analysis needed: API costs $80K/mo at scale vs $200K upfront + $15K/mo in-house",
                "Mobile redesign soft launch in beta channel by September 15th",
            ],
            "next_steps": [
                "Carol: Schema migration technical design doc by Thursday EOD",
                "David: AI timeline risk assessment and build-vs-buy doc by Monday morning",
                "Bob: Q3 onboarding metrics report",
                "Alice: Schedule finance strategy session for next Tuesday",
            ],
        },
        "action_items": [
            {"description": "Write schema migration technical design doc", "assignee": "Carol Zhang", "status": "completed", "priority": "high"},
            {"description": "Prepare build-vs-buy analysis for LLM infrastructure", "assignee": "David Kim", "status": "in_progress", "priority": "high"},
            {"description": "Compile Q3 onboarding activation metrics report", "assignee": "Bob Martinez", "status": "pending", "priority": "medium"},
        ],
        "topics": [
            {"title": "Onboarding metrics review", "start_time_ms": 0},
            {"title": "AI assistant beta timeline", "start_time_ms": 157000},
            {"title": "Schema migration priority", "start_time_ms": 210000},
            {"title": "Mobile redesign status", "start_time_ms": 443000},
        ],
    },
    {
        "title": "Product Roadmap Planning",
        "vtt_file": "product_roadmap.vtt",
        "started_at_offset_days": -3,   # 3 days ago → this week
        "duration_seconds": 540,
        "speakers": [
            {"name": "Sarah Johnson", "email": "sarah@product.co",  "role": "host"},
            {"name": "James Park",    "email": "james@product.co",  "role": "attendee"},
            {"name": "Rachel Torres", "email": "rachel@product.co", "role": "attendee"},
        ],
        "summary": {
            "overview": (
                "The team reviewed user research findings and set Q3 product priorities. "
                "Full-text search (FTS5), bidirectional transcript-player sync, and the meeting detail "
                "layout restructure were selected as the top three priorities based on user feedback and "
                "engineering estimates."
            ),
            "key_points": [
                "Users consistently flag slow, context-unaware search as top pain point",
                "FTS5 with porter stemming is the chosen solution — 2-3 week backend implementation",
                "Bidirectional transcript sync requires forward (timeupdate) and reverse (click) directions to ship together",
                "Loading skeletons added to layout sprint — high ROI, low effort",
                "A/B testing with Amplitude planned for layout changes",
            ],
            "next_steps": [
                "Rachel: Begin FTS5 implementation in next sprint",
                "James: Write search UX spec by Wednesday",
                "Rachel: Bidirectional sync in sprint 2",
                "Sarah: Review roadmap doc with leadership by end of week",
            ],
        },
        "action_items": [
            {"description": "Write search UX specification document", "assignee": "James Park", "status": "completed", "priority": "high"},
            {"description": "Implement FTS5 backend with Porter stemming", "assignee": "Rachel Torres", "status": "in_progress", "priority": "high"},
            {"description": "Set up Amplitude A/B test configuration for layout changes", "assignee": "Sarah Johnson", "status": "pending", "priority": "medium"},
        ],
        "topics": [
            {"title": "User research themes", "start_time_ms": 43000},
            {"title": "FTS search implementation", "start_time_ms": 114000},
            {"title": "Bidirectional transcript sync", "start_time_ms": 211000},
            {"title": "Sprint planning and action items", "start_time_ms": 475000},
        ],
    },
    {
        "title": "Engineering Weekly Standup",
        "vtt_file": "engineering_standup.vtt",
        "started_at_offset_days": -9,   # last week
        "duration_seconds": 510,
        "speakers": [
            {"name": "Priya Patel",    "email": "priya@eng.io",   "role": "host"},
            {"name": "Tom Nguyen",     "email": "tom@eng.io",     "role": "attendee"},
            {"name": "Aisha Mohammed", "email": "aisha@eng.io",   "role": "attendee"},
            {"name": "Marcus Lee",     "email": "marcus@eng.io",  "role": "attendee"},
        ],
        "summary": {
            "overview": (
                "Engineering standup covered FTS5 trigger implementation, async SQLAlchemy session "
                "patterns, and seed data framework progress. "
                "A critical issue with the FTS5 external content DELETE trigger was identified and fixed, "
                "and a CI lint rule was proposed to catch async/sync session mismatches."
            ),
            "key_points": [
                "FTS5 external content DELETE trigger must use INSERT...VALUES('delete',...) not a regular DELETE",
                "Using sync Session in async FastAPI routes causes MissingGreenlet error — caught by Aisha",
                "Speaker label consistency between participants table and transcript segments is critical for color assignment",
                "Sample audio file must be committed before seed timestamps can be validated",
            ],
            "next_steps": [
                "Tom: Update migration docs with FTS5 trigger pattern explanation",
                "Aisha: Add AsyncSession type check to CI pipeline",
                "Marcus: Finish last two seed meetings with correct date distribution",
                "Priya: Commit royalty-free sample audio file to frontend/public",
            ],
        },
        "action_items": [
            {"description": "Update migration docs with FTS5 DELETE trigger explanation", "assignee": "Tom Nguyen", "status": "completed", "priority": "medium"},
            {"description": "Add AsyncSession vs Session lint check to CI pipeline", "assignee": "Aisha Mohammed", "status": "in_progress", "priority": "high"},
            {"description": "Verify all seed transcript timestamps are within audio duration", "assignee": "Marcus Lee", "status": "pending", "priority": "medium"},
        ],
        "topics": [
            {"title": "FTS5 trigger implementation", "start_time_ms": 13000},
            {"title": "Async SQLAlchemy session patterns", "start_time_ms": 159000},
            {"title": "Seed data progress and blockers", "start_time_ms": 295000},
        ],
    },
    {
        "title": "Investor Pitch Prep — Series B",
        "vtt_file": "investor_pitch.vtt",
        "started_at_offset_days": -21,  # three weeks ago
        "duration_seconds": 520,
        "speakers": [
            {"name": "Elena Vasquez", "email": "elena@startup.vc",  "role": "host"},
            {"name": "Ryan Chen",     "email": "ryan@startup.vc",   "role": "attendee"},
            {"name": "Nina Kowalski", "email": "nina@startup.vc",   "role": "attendee"},
        ],
        "summary": {
            "overview": (
                "Final Series B pitch preparation session covering narrative positioning, slide revisions, "
                "and Q&A preparation. "
                "The team refined the differentiation story versus Otter.ai and Fireflies, aligned on the "
                "financial narrative around AI cost structure and margin expansion, and assigned slide "
                "ownership for Thursday's investor meeting."
            ),
            "key_points": [
                "Positioning: deep meeting analytics vs. Otter (transcription) and Fireflies (horizontal comms)",
                "Three market tailwinds: remote work shift, async collaboration tools, LLM cost reduction",
                "$12B TAM growing at 18% CAGR; 340% YoY growth; $2.4M ARR; NPS 72",
                "Current GM 68% improves to 78% at scale via volume discounts + proprietary model by Q2",
                "Ask: $12M at $60M pre-money; 24-month runway to Series C milestones",
            ],
            "next_steps": [
                "Ryan: Finalize slides 3, 8, and 12 by tomorrow noon",
                "Elena: Review financial model assumptions",
                "Nina: Prepare Q&A script with 10 most likely investor questions",
                "Team: Final rehearsal Wednesday at 2pm",
            ],
        },
        "action_items": [
            {"description": "Finalize pitch slides 3, 8, and 12", "assignee": "Ryan Chen", "status": "completed", "priority": "high"},
            {"description": "Review and validate financial model assumptions", "assignee": "Elena Vasquez", "status": "completed", "priority": "high"},
            {"description": "Prepare investor Q&A script with 10 likely questions", "assignee": "Nina Kowalski", "status": "in_progress", "priority": "high"},
        ],
        "topics": [
            {"title": "Competitive positioning", "start_time_ms": 45000},
            {"title": "Market timing narrative", "start_time_ms": 116000},
            {"title": "Traction and financial metrics", "start_time_ms": 208000},
            {"title": "AI cost structure and margin story", "start_time_ms": 297000},
            {"title": "Ask and use of proceeds", "start_time_ms": 404000},
        ],
    },
    {
        "title": "Design System Sprint Review",
        "vtt_file": "design_review.vtt",
        "started_at_offset_days": -42,  # six weeks ago
        "duration_seconds": 560,
        "speakers": [
            {"name": "Maya Patel",  "email": "maya@design.co",  "role": "host"},
            {"name": "Liam O'Brien","email": "liam@design.co",  "role": "attendee"},
            {"name": "Zoe Kim",     "email": "zoe@design.co",   "role": "attendee"},
        ],
        "summary": {
            "overview": (
                "Sprint review of the design system covering color tokens, component status, speaker color "
                "assignment, and the meeting detail page layout specification. "
                "The team confirmed the dark-only theme approach, defined the useSpeakerColorMap hook design, "
                "and finalized the 55/45 column split layout for the meeting detail page."
            ),
            "key_points": [
                "Dark mode only — no system preference toggle to maintain visual identity consistency",
                "Color tokens use CSS custom properties with Tailwind integration via ff.* prefix",
                "Speaker colors: deterministic round-robin assignment via useSpeakerColorMap hook",
                "Meeting detail layout: player bar full-width, then 55/45 grid (transcript left, summary right)",
                "Active transcript segment: bg-highlight + 3px left accent border + accent-light timestamp",
            ],
            "next_steps": [
                "Zoe: Complete component designs for Skeleton, Tabs, Toast, Tooltip by Friday",
                "Liam: Implement Button through Checkbox with accessibility checks by Friday",
                "Maya: Accessibility review on all interactive components Monday",
                "Zoe: Update design doc with layout spec and useSpeakerColorMap hook spec by tomorrow",
            ],
        },
        "action_items": [
            {"description": "Complete Skeleton, Tabs, Toast, Tooltip component designs", "assignee": "Zoe Kim", "status": "completed", "priority": "medium"},
            {"description": "Implement Button, Input, Badge, Checkbox with accessibility", "assignee": "Liam O'Brien", "status": "completed", "priority": "high"},
            {"description": "Conduct accessibility review on all interactive components", "assignee": "Maya Patel", "status": "in_progress", "priority": "high"},
        ],
        "topics": [
            {"title": "Color token system", "start_time_ms": 17000},
            {"title": "Component status review", "start_time_ms": 160000},
            {"title": "Speaker color assignment design", "start_time_ms": 293000},
            {"title": "Meeting detail layout specification", "start_time_ms": 413000},
        ],
    },
]


async def seed() -> None:
    async with async_session_factory() as db:
        # Idempotency guard — if any user exists, skip
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            print("Seed data already present, skipping.")
            return

        # Create default host user
        host = User(
            external_id=str(uuid.uuid4()).replace("-", ""),
            email="alex@fireflies.ai",
            name="Alex Rivera",
        )
        db.add(host)
        await db.flush()

        for idx, meeting_def in enumerate(MEETINGS):
            await _seed_meeting(db, host, meeting_def, idx)

        await db.commit()
        print(f"Seeded {len(MEETINGS)} meetings successfully.")


async def _seed_meeting(db, host: User, defn: dict, idx: int) -> None:
    offset_days = defn["started_at_offset_days"]
    started_at = NOW + timedelta(days=offset_days)
    duration = defn["duration_seconds"]

    meeting = Meeting(
        external_id=str(uuid.uuid4()).replace("-", ""),
        title=defn["title"],
        host_user_id=host.id,
        started_at=started_at,
        ended_at=started_at + timedelta(seconds=duration),
        duration_seconds=duration,
        status="processed",
        audio_url="/sample-audio.wav",
    )
    db.add(meeting)
    await db.flush()

    # Participants — speaker roster defined here, reused for segment speaker_name
    participants = []
    for p_def in defn["speakers"]:
        p = Participant(
            meeting_id=meeting.id,
            name=p_def["name"],
            email=p_def["email"],
            role=p_def["role"],
            speaker_label=p_def["name"],   # exact match with transcript speaker_name
        )
        db.add(p)
        participants.append(p)
    await db.flush()

    # Load and parse VTT transcript
    vtt_path = TRANSCRIPT_DIR / defn["vtt_file"]
    vtt_content = vtt_path.read_text(encoding="utf-8")
    segment_dicts = parse_transcript(vtt_content, fmt="vtt")

    # Build speaker_name → participant_id mapping
    name_to_participant = {p.name: p for p in participants}

    transcript = Transcript(
        meeting_id=meeting.id,
        raw_text="\n".join(s["text"] for s in segment_dicts),
        source="seeded",
    )
    db.add(transcript)
    await db.flush()

    for seg_dict in segment_dicts:
        end_ms = min(seg_dict["end_time_ms"], duration * 1000)
        start_ms = seg_dict["start_time_ms"]
        if end_ms <= start_ms:
            end_ms = start_ms + 1000

        speaker_participant = name_to_participant.get(seg_dict["speaker_name"])
        seg = TranscriptSegment(
            transcript_id=transcript.id,
            speaker_id=speaker_participant.id if speaker_participant else None,
            speaker_name=seg_dict["speaker_name"],
            start_time_ms=start_ms,
            end_time_ms=end_ms,
            text=seg_dict["text"],
            sequence_index=seg_dict["sequence_index"],
        )
        db.add(seg)

    await db.flush()

    # Summary
    s_def = defn["summary"]
    summary = Summary(
        meeting_id=meeting.id,
        overview=s_def["overview"],
        key_points=json.dumps(s_def["key_points"]),
        next_steps=json.dumps(s_def["next_steps"]),
        generated_by="seeded",
        generated_at=started_at,
    )
    db.add(summary)

    # Action items (1 completed, 1 in_progress, 1 pending per meeting)
    for ai_def in defn["action_items"]:
        ai = ActionItem(
            external_id=str(uuid.uuid4()).replace("-", ""),
            meeting_id=meeting.id,
            assignee_name=ai_def["assignee"],
            description=ai_def["description"],
            status=ai_def["status"],
            priority=ai_def["priority"],
        )
        db.add(ai)

    # Topics
    for t_idx, t_def in enumerate(defn["topics"]):
        topic = Topic(
            meeting_id=meeting.id,
            title=t_def["title"],
            start_time_ms=t_def["start_time_ms"],
            sequence_index=t_idx,
        )
        db.add(topic)

    await db.flush()


if __name__ == "__main__":
    asyncio.run(seed())

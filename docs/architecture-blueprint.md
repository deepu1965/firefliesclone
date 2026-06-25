# Fireflies Clone — Full Architecture Specification

---

## PART 1 — ASSIGNMENT DECONSTRUCTION

---

### Explicit Requirements

**Technical constraints**
- Frontend: Next.js with TypeScript (not optional, not React CRA)
- Backend: Python with FastAPI *or* Django (FastAPI is listed first — evaluators expect it)
- Database: SQLite with a self-designed schema
- No real audio transcription; mocking and seeding are acceptable

**Core feature set**
- Meetings library: list, search/filter by title/date/participant, sort by recency, navbar
- Meeting detail: transcript with speaker labels + timestamps, mock media player with seek bar, click-to-seek bidirectional sync, in-transcript search with highlights
- AI Summary section: overview, action items with completion state, key topics/chapters
- Full CRUD: create meeting (upload or paste transcript), edit metadata, delete meeting, manage action items (add/edit/complete/delete)
- All data persisted to SQLite

**Deliverables**
- Public GitHub repository with `frontend/` and `backend/` directories
- README covering setup instructions, tech stack, architecture overview, database schema, API overview, assumptions
- Hosted deployed link (Vercel + Render/Railway or equivalent)
- Seeded database with several meetings, full transcripts, summaries, and action items

---

### Implicit Requirements

These are never stated but every evaluator assumes them.

- TypeScript strict mode with zero `any` types — loose TypeScript signals inexperience
- Proper HTTP semantics: GET for reads, POST for creates, PATCH for partial updates, DELETE for deletes; using POST for everything is a red flag
- API versioning under `/api/v1/` — not versioning is an interview talking point against you
- CORS configured correctly (FastAPI `CORSMiddleware` with explicit origins)
- Environment variable management — no hardcoded secrets, `.env.example` committed
- Pagination on the meetings list — "library" implies it scales; a 500-item flat list is a design failure
- Speaker colors — different speakers should have visually distinct color labels in the transcript (Fireflies does this)
- Loading skeleton states — not just spinners; Fireflies uses content-shape skeletons
- Responsive layout — the assignment says "experience"; a desktop-only app loses points
- Error states — API errors must surface to UI gracefully, not silently fail
- Realistic seed data — 5+ meetings, multi-speaker conversations, coherent summaries; an empty or single-meeting seed shows lack of care

---

### Hidden Expectations

These separate top-5% submissions from good submissions.

**Schema normalization**: Evaluators will read the schema. Storing the transcript as a single TEXT column is the single most common mistake and the clearest signal of shallow thinking. `transcript_segments` must be individual rows with `start_time_ms`, `end_time_ms`, `speaker_id`, and `sequence_index`. This is what enables efficient search, player sync, and timestamp linking.

**FTS5 for search**: SQLite has a built-in full-text search engine. Using `LIKE '%query%'` when FTS5 is available is a missed opportunity that evaluators notice. The query `SELECT rowid FROM transcript_segments_fts WHERE text MATCH 'budget'` is demonstrably better than a LIKE scan.

**Service and Repository layers**: Routes that directly call `db.query(...)` collapse business logic and data access into one untestable function. Evaluators reviewing the codebase look for `services/` (business logic) and `repositories/` (data access) as separate layers.

**Alembic migrations**: Even with SQLite, having Alembic wired up signals production-readiness. Running `alembic revision --autogenerate` and committing the migration files shows maturity.

**The README is evaluated as seriously as the code**: It should include an architecture diagram (even ASCII is fine), a schema diagram, API endpoint table, and setup instructions that actually work on a clean machine.

**LLM integration is a differentiator**: The assignment says "summaries can be seeded, mocked, or LLM-generated." The top 5% call an LLM API to actually generate summaries from transcript text. This demonstrates AI-adjacent engineering, which is directly relevant to the role.

**Player-transcript bidirectional sync is the hardest feature**: Many candidates implement click-to-seek (clicking a segment sets the player time) but miss the reverse: as the player plays, the transcript scrolls and highlights the active segment. Both directions must work. This is tested immediately during evaluation.

---

### Evaluator Priorities (from rubric, re-ranked by actual interview weight)

| Rank | Criterion | Why it ranks here |
|------|-----------|-------------------|
| 1 | UI/UX resemblance to Fireflies | Mentioned explicitly three times. First thing evaluators see. |
| 2 | Functionality completeness | Broken features fail the "does it work" gate immediately |
| 3 | Database design | Explicitly called out as evaluated. Schema quality is easy to judge quickly |
| 4 | Code Understanding | Interview rubric item — you must explain every line |
| 5 | Backend / API design | RESTfulness, versioning, error handling |
| 6 | Code Quality + Modularity | Layer separation, naming, readability |

---

### Common Candidate Mistakes

- Storing transcript as one giant TEXT blob instead of normalized segments
- Implementing player-to-transcript sync but not transcript-to-player sync (or vice versa)
- Using Bootstrap or generic MUI theme — looks nothing like Fireflies
- Seeding only 1–2 meetings; evaluators need varied data to test search and filters
- Putting business logic directly in route handlers (no service layer)
- Using `LIKE` for search instead of FTS5
- Missing API versioning (`/meetings/` instead of `/api/v1/meetings/`)
- Writing JavaScript instead of TypeScript (or TypeScript with `as any` everywhere)
- README that says only "run npm install and uvicorn"
- Not deploying; submitting without a live link
- Django instead of FastAPI despite FastAPI being listed first and being better suited to this API-centric use case
- Missing pagination on the meetings endpoint
- Action items stored as a JSON column on the meetings table instead of a proper child table

---

### Top 5% Submission Characteristics

- Visual: pixel-accurate Fireflies recreation — dark sidebar (#1a1a2e range), correct typography weight, correct card border radius, speaker chips matching Fireflies color scheme
- Schema: fully normalized, FTS5 virtual table, triggers keeping FTS in sync, all foreign keys, proper ON DELETE CASCADE, indexes on every FK and frequently-queried column
- Search: FTS5 with porter stemming (`tokenize = 'porter ascii'`) for dashboard and transcript search
- Interactive transcript: bidirectional sync — clicking a segment seeks the player; player `timeupdate` event highlights and scrolls to the active segment
- LLM integration: real call to Anthropic or OpenAI to generate summary from transcript text, with graceful fallback to seeded summary if API key is absent
- Seed data: 5+ meetings across different topics with realistic multi-speaker transcripts (10+ participants total), varied durations, meaningful summaries, and completable action items
- README: embedded ER diagram, architecture diagram, endpoint table, local setup that works in under 3 minutes
- TypeScript: strict mode, no implicit any, proper interface/type definitions for all API responses

---

## PART 2 — EVALUATOR SIMULATION

---

### The 90-Second First Impression (What Evaluators Do First)

When an evaluator receives a submission, the first 90 seconds go like this:

1. Open the deployed link
2. Does it look like Fireflies? (5 seconds, subconscious judgment)
3. Click the first meeting in the list
4. Does the transcript render with speaker labels?
5. Click a transcript line — does the player seek?
6. Play the player — does the transcript scroll?
7. Open the Summary tab — are there action items?
8. Try to check off an action item — does it persist?
9. Search for a word in the transcript — do matches highlight?

If steps 1–4 fail or disappoint, the evaluator is in "damage control" mode for the rest of the review. If they succeed, every subsequent feature is evaluated more generously.

---

### Three-Tier Comparison

**Average submission**

The app launches to a list of meetings that looks like a CRUD app from a tutorial — white background, blue links, no sidebar. The transcript is a single text block with no speaker colors or timestamps. Clicking a transcript line does nothing. The "AI Summary" tab shows a hardcoded string. Action items are stored as comma-separated text in a column. The schema has three tables: users, meetings, transcript (as one TEXT column). Search uses LIKE. README is 10 lines. Deployed but barely functional.

What evaluators say: "It works, kind of. The schema is too flat. Nothing really resembles Fireflies."

**Good submission**

The app has a dark sidebar and a recognizable card layout for meetings. The transcript renders in segments with colored speaker chips. Clicking a segment seeks the player (but the player doesn't auto-scroll the transcript during playback). The Summary tab has real content with action items that can be checked off. The schema is mostly normalized — segments are rows — but lacks indexes and FTS. Search uses LIKE. The service layer exists but business logic leaks into routes. README is solid with a schema section. Deployed and mostly functional.

What evaluators say: "This is solid. Good schema, but I wish they used FTS. The UX is close to Fireflies. A few things are missing."

**Top 5% submission**

The app is indistinguishable from Fireflies at first glance — correct sidebar, correct card design, correct color palette. The transcript is fully synchronized bidirectionally. FTS5 powers search with highlighted results. LLM generates summaries from transcript text (with an API key in the environment). The schema has 9 tables, all properly indexed, with an FTS5 virtual table and triggers. The service/repository split is clean. The README has embedded architecture and ER diagrams. The seed data has 7 meetings across different industries with realistic conversations and summaries. Every feature works.

What evaluators say: "This person clearly studied Fireflies, thought about the data model, and knows how to build a real product. Strong yes."

---

### What Evaluators Remember

Evaluators review 30+ submissions. What they remember:

- "The one that actually looked like Fireflies" (visual fidelity)
- "The one with the really clean schema" (database design)
- "The one that had LLM-generated summaries" (AI integration)
- "The one where clicking the transcript synced with the player perfectly" (the hard feature)
- "The one with the terrible README" (negative memory)
- "The one that wasn't deployed" (immediate disqualification in practice)

---

## PART 3 — FEATURE PRIORITIZATION

---

| Feature | Priority | Evaluation Impact | Complexity | Est. Hours | ROI |
|---------|----------|------------------|------------|------------|-----|
| Meetings library page | P0 | Critical | Low | 2.0 | High |
| Meeting detail layout | P0 | Critical | Low | 1.5 | High |
| Transcript with speaker segments | P0 | Critical | Medium | 2.5 | High |
| Mock media player with seek bar | P0 | Critical | Medium | 2.0 | High |
| Bidirectional player-transcript sync | P0 | Critical | High | 3.0 | High |
| AI Summary display | P0 | Critical | Low | 1.5 | High |
| Action items (view + complete) | P0 | Critical | Low | 1.5 | High |
| Create meeting (form) | P0 | Critical | Medium | 2.0 | High |
| Edit meeting metadata | P0 | Critical | Low | 1.0 | High |
| Delete meeting | P0 | Critical | Low | 0.5 | High |
| Seed data (5+ meetings) | P0 | Critical | Low | 1.5 | High |
| Deployment | P0 | Critical | Low | 1.0 | High |
| README (full spec) | P0 | Critical | Low | 1.5 | High |
| Dashboard search/filter | P0 | High | Medium | 1.5 | High |
| In-transcript search with highlights | P1 | High | Medium | 2.0 | High |
| Topics/chapters display | P1 | High | Low | 1.0 | High |
| Toast notifications | P1 | Medium | Low | 0.5 | High |
| Upload/paste transcript on create | P1 | Medium | Medium | 2.0 | Medium |
| LLM summary generation | P1 | High | Medium | 2.0 | High |
| Loading skeleton states | P1 | Medium | Low | 1.0 | High |
| Add/edit action items manually | P1 | Medium | Low | 1.0 | High |
| FTS5 search backend | P1 | High | Medium | 1.5 | High |
| Pagination on meetings list | P1 | Medium | Low | 0.5 | High |
| Speaker color assignment | P1 | Medium | Low | 0.5 | High |
| Export transcript/summary | P2 | Medium | Medium | 2.0 | Low |
| Global search across all meetings | P2 | Medium | Medium | 2.0 | Medium |
| Dark mode | P2 | Low | Medium | 2.0 | Low |
| Comments / highlights on segments | P2 | Low | High | 3.0 | Low |
| Ask a question about the meeting (LLM chat) | P2 | Medium | High | 3.0 | Medium |
| Tags + tag filtering | P2 | Low | Medium | 1.5 | Low |

**Time allocation recommendation for a 24-hour timeline:**

- P0 features total: approximately 17 hours
- P1 features (selective): approximately 6 hours  
- Buffer and deployment polish: 1 hour

Prioritize completing every P0 to a high standard before touching any P1. A complete P0 set scores higher than a partial P0 + partial P1.

---

## PART 4 — REPOSITORY STRUCTURE

---

### Top-Level Layout

```
fireflies-clone/
├── frontend/          # Next.js 14 TypeScript application
├── backend/           # FastAPI Python application
├── docs/              # Architecture reference documents
├── .github/
│   └── workflows/     # Optional CI (bonus signal)
└── README.md          # Root README linking to component READMEs
```

---

### Frontend Structure

```
frontend/
├── src/
│   ├── app/                             # Next.js App Router root
│   │   ├── layout.tsx                   # Root layout: providers, fonts, body
│   │   ├── page.tsx                     # Root redirect → /meetings
│   │   ├── globals.css                  # CSS reset + design tokens
│   │   ├── (dashboard)/                 # Route group: authenticated layout
│   │   │   ├── layout.tsx               # Sidebar + Topbar layout wrapper
│   │   │   ├── meetings/
│   │   │   │   ├── page.tsx             # Meetings library page
│   │   │   │   ├── loading.tsx          # Skeleton loading state
│   │   │   │   ├── error.tsx            # Error boundary page
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx         # Meeting detail page
│   │   │   │       ├── loading.tsx
│   │   │   │       └── error.tsx
│   │   │   ├── search/
│   │   │   │   └── page.tsx             # Global search (P2)
│   │   │   └── settings/
│   │   │       └── page.tsx             # Settings placeholder
│   │   └── api/                         # Next.js API routes (proxy layer)
│   │       └── health/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                          # Primitive, unstyled-ish components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── Tooltip.tsx
│   │   │
│   │   ├── layout/                      # Structural layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── PageContainer.tsx
│   │   │   └── SidebarNavItem.tsx
│   │   │
│   │   ├── meetings/                    # Library page components
│   │   │   ├── MeetingCard.tsx          # Single meeting card
│   │   │   ├── MeetingList.tsx          # Mapped list of cards
│   │   │   ├── MeetingListSkeleton.tsx
│   │   │   ├── MeetingFilters.tsx       # Date/participant filters
│   │   │   ├── MeetingSearch.tsx        # Debounced search input
│   │   │   ├── MeetingSortControl.tsx
│   │   │   ├── CreateMeetingModal.tsx   # Create meeting form/modal
│   │   │   ├── EditMeetingModal.tsx
│   │   │   └── DeleteMeetingDialog.tsx  # Confirm dialog
│   │   │
│   │   ├── transcript/                  # Transcript panel components
│   │   │   ├── TranscriptPanel.tsx      # Panel container + layout
│   │   │   ├── TranscriptSegment.tsx    # Single speaker segment
│   │   │   ├── TranscriptSearch.tsx     # Search bar + result nav
│   │   │   └── SpeakerChip.tsx         # Colored speaker label
│   │   │
│   │   ├── player/                      # Media player components
│   │   │   ├── MediaPlayer.tsx          # Player container
│   │   │   ├── PlayerControls.tsx       # Play/pause/speed buttons
│   │   │   └── SeekBar.tsx             # Progress bar with timestamps
│   │   │
│   │   ├── summary/                     # Summary panel components
│   │   │   ├── SummaryPanel.tsx         # Tabbed panel container
│   │   │   ├── OverviewTab.tsx
│   │   │   ├── ActionItemList.tsx
│   │   │   ├── ActionItemCard.tsx       # Checkable action item row
│   │   │   ├── ActionItemForm.tsx       # Add/edit form
│   │   │   ├── TopicList.tsx            # Chapters/outline
│   │   │   └── KeyPointsList.tsx
│   │   │
│   │   └── shared/
│   │       ├── EmptyState.tsx
│   │       ├── ErrorMessage.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── hooks/                           # Custom React hooks
│   │   ├── useMeetings.ts               # List + filters
│   │   ├── useMeeting.ts                # Single meeting detail
│   │   ├── useTranscript.ts             # Transcript + segments
│   │   ├── useSummary.ts                # Summary + action items
│   │   ├── useActionItems.ts            # Mutations for action items
│   │   ├── useTranscriptSearch.ts       # In-transcript FTS
│   │   ├── usePlayer.ts                 # Player state + sync logic
│   │   └── useDebounce.ts              # Debounce utility hook
│   │
│   ├── lib/
│   │   ├── api/                         # API client functions
│   │   │   ├── client.ts                # Axios instance + interceptors
│   │   │   ├── meetings.ts
│   │   │   ├── transcripts.ts
│   │   │   ├── summaries.ts
│   │   │   ├── actionItems.ts
│   │   │   └── search.ts
│   │   └── utils/
│   │       ├── time.ts                  # ms → mm:ss, duration formatting
│   │       ├── speakerColors.ts         # Deterministic speaker → color map
│   │       └── constants.ts            # API base URL, etc.
│   │
│   ├── stores/                          # Zustand stores (client state only)
│   │   ├── playerStore.ts               # currentTimeMs, isPlaying, duration
│   │   └── uiStore.ts                   # activeTab, toasts, modals
│   │
│   └── types/                           # Shared TypeScript interfaces
│       ├── meeting.ts
│       ├── transcript.ts
│       ├── summary.ts
│       └── api.ts                       # PaginatedResponse<T>, ApiError
│
├── public/
│   └── sample-audio.mp3                 # Placeholder audio for player
├── package.json
├── tsconfig.json                        # strict: true
├── next.config.ts
├── tailwind.config.ts
├── .env.local.example
└── README.md
```

---

### Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                          # App factory, CORS, lifespan
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py                # Aggregates all endpoint routers
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           ├── meetings.py          # /meetings CRUD
│   │           ├── transcripts.py       # /meetings/{id}/transcript
│   │           ├── summaries.py         # /meetings/{id}/summary
│   │           ├── action_items.py      # /meetings/{id}/action-items
│   │           ├── topics.py            # /meetings/{id}/topics
│   │           ├── participants.py      # /meetings/{id}/participants
│   │           └── search.py            # /search global
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py                    # pydantic-settings BaseSettings
│   │   ├── exceptions.py                # NotFoundError, ConflictError, etc.
│   │   └── logging.py                   # Structured logging config
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py                      # SQLAlchemy DeclarativeBase
│   │   ├── session.py                   # get_db dependency
│   │   └── init_db.py                   # create_all + seed runner
│   │
│   ├── models/                          # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── meeting.py
│   │   ├── participant.py
│   │   ├── transcript.py
│   │   ├── transcript_segment.py
│   │   ├── summary.py
│   │   ├── action_item.py
│   │   ├── topic.py
│   │   └── tag.py
│   │
│   ├── schemas/                         # Pydantic V2 DTOs
│   │   ├── __init__.py
│   │   ├── meeting.py                   # MeetingCreate, MeetingUpdate, MeetingResponse, MeetingListItem
│   │   ├── transcript.py                # TranscriptResponse, SegmentResponse
│   │   ├── summary.py                   # SummaryResponse, SummaryGenerateRequest
│   │   ├── action_item.py               # ActionItemCreate, ActionItemUpdate, ActionItemResponse
│   │   ├── search.py                    # SearchParams, SearchResult
│   │   └── common.py                    # PaginatedResponse[T], ErrorResponse
│   │
│   ├── repositories/                    # Data access layer
│   │   ├── __init__.py
│   │   ├── base.py                      # BaseRepository[ModelT, CreateSchemaT, UpdateSchemaT]
│   │   ├── meeting_repo.py              # Filtered list, search queries
│   │   ├── transcript_repo.py           # Segment queries, FTS queries
│   │   ├── summary_repo.py
│   │   ├── action_item_repo.py
│   │   └── search_repo.py               # Cross-table FTS coordination
│   │
│   ├── services/                        # Business logic layer
│   │   ├── __init__.py
│   │   ├── meeting_service.py           # Orchestrates CRUD + participant logic
│   │   ├── transcript_service.py        # Parse VTT/TXT/JSON, validate segments
│   │   ├── summary_service.py           # LLM call + fallback + UPSERT
│   │   ├── search_service.py            # Coordinates FTS across tables
│   │   └── export_service.py            # Markdown/TXT export (P2)
│   │
│   └── utils/
│       ├── __init__.py
│       ├── transcript_parser.py         # .vtt, .txt, .json → segment list
│       ├── time_utils.ts                # Duration formatting
│       └── llm_client.py               # Thin wrapper around Anthropic/OpenAI SDK
│
├── seeds/
│   ├── __init__.py
│   ├── seed_data.py                     # Python seeding script
│   └── transcripts/                     # 5+ .vtt sample transcript files
│       ├── q3_review.vtt
│       ├── product_roadmap.vtt
│       ├── engineering_standup.vtt
│       ├── investor_pitch.vtt
│       └── design_review.vtt
│
├── tests/
│   ├── conftest.py                      # Test DB setup, fixtures
│   ├── test_meetings.py
│   ├── test_transcripts.py
│   └── test_search.py
│
├── alembic/
│   ├── alembic.ini
│   ├── env.py
│   └── versions/
│       └── 0001_initial_schema.py
│
├── requirements.txt
├── .env.example
└── README.md
```

---

### Naming Conventions

- Backend Python: `snake_case` everywhere — files, variables, functions, model attributes
- Frontend TypeScript: `PascalCase` for components and types; `camelCase` for hooks, utils, stores; `kebab-case` for route segment folders
- Database: `snake_case` for table names and column names
- API routes: `kebab-case` for URL segments (`/action-items`, not `/actionItems`)
- Environment variables: `SCREAMING_SNAKE_CASE`

---

## PART 5 — DATABASE ARCHITECTURE

---

### Design Principles

- Every table has an `id` (INTEGER PRIMARY KEY AUTOINCREMENT) and `created_at` / `updated_at` timestamps
- External-facing identifiers use `external_id` (UUID stored as TEXT) to prevent ID enumeration
- Cascade deletes are explicit: deleting a meeting cascades to all child records
- Enum-like columns use CHECK constraints to enforce valid values at the database level
- JSON columns (key_points, next_steps) store serialized Python lists; this is acceptable for SQLite where array types don't exist
- FTS5 virtual table with triggers keeps the full-text index in sync with `transcript_segments`

---

### Full Schema DDL

```sql
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ─────────────────────────────────────────────
-- USERS  (single default user for this assignment)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    external_id TEXT     NOT NULL UNIQUE DEFAULT (lower(hex(randomblob(16)))),
    email       TEXT     NOT NULL UNIQUE,
    name        TEXT     NOT NULL,
    avatar_url  TEXT,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- MEETINGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meetings (
    id               INTEGER  PRIMARY KEY AUTOINCREMENT,
    external_id      TEXT     NOT NULL UNIQUE DEFAULT (lower(hex(randomblob(16)))),
    title            TEXT     NOT NULL,
    host_user_id     INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at     DATETIME,
    started_at       DATETIME,
    ended_at         DATETIME,
    duration_seconds INTEGER  CHECK (duration_seconds >= 0),
    status           TEXT     NOT NULL DEFAULT 'processed'
                              CHECK (status IN ('scheduled','processing','processed','failed')),
    audio_url        TEXT,
    meeting_url      TEXT,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meetings_host        ON meetings(host_user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_started_at  ON meetings(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_status      ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at  ON meetings(created_at DESC);

-- ─────────────────────────────────────────────
-- PARTICIPANTS  (each row = one person in one meeting)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS participants (
    id            INTEGER  PRIMARY KEY AUTOINCREMENT,
    meeting_id    INTEGER  NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id       INTEGER  REFERENCES users(id) ON DELETE SET NULL,  -- NULL = external guest
    name          TEXT     NOT NULL,
    email         TEXT,
    role          TEXT     NOT NULL DEFAULT 'attendee'
                           CHECK (role IN ('host','attendee')),
    speaker_label TEXT,     -- e.g. "Speaker 1", maps to transcript segments
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_participants_meeting ON participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_participants_email   ON participants(email);

-- ─────────────────────────────────────────────
-- TRANSCRIPTS  (1-to-1 with meetings)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transcripts (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    meeting_id  INTEGER  NOT NULL UNIQUE REFERENCES meetings(id) ON DELETE CASCADE,
    raw_text    TEXT,     -- full plaintext for quick FTS seeding
    source      TEXT     NOT NULL DEFAULT 'seeded'
                         CHECK (source IN ('seeded','uploaded','generated')),
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- TRANSCRIPT_SEGMENTS  (atomic unit: one speaker utterance)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transcript_segments (
    id             INTEGER  PRIMARY KEY AUTOINCREMENT,
    transcript_id  INTEGER  NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
    speaker_id     INTEGER  REFERENCES participants(id) ON DELETE SET NULL,
    speaker_name   TEXT     NOT NULL,
    start_time_ms  INTEGER  NOT NULL CHECK (start_time_ms >= 0),
    end_time_ms    INTEGER  NOT NULL CHECK (end_time_ms > start_time_ms),
    text           TEXT     NOT NULL,
    sequence_index INTEGER  NOT NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tseg_transcript     ON transcript_segments(transcript_id);
CREATE INDEX IF NOT EXISTS idx_tseg_sequence       ON transcript_segments(transcript_id, sequence_index);
CREATE INDEX IF NOT EXISTS idx_tseg_time           ON transcript_segments(transcript_id, start_time_ms);
CREATE INDEX IF NOT EXISTS idx_tseg_speaker        ON transcript_segments(speaker_id);

-- ─────────────────────────────────────────────
-- FTS5 VIRTUAL TABLE  (full-text search on transcript segments)
-- ─────────────────────────────────────────────
CREATE VIRTUAL TABLE IF NOT EXISTS transcript_segments_fts USING fts5(
    text,
    speaker_name,
    content='transcript_segments',
    content_rowid='id',
    tokenize='porter ascii'
);

-- Triggers to keep FTS index in sync
CREATE TRIGGER IF NOT EXISTS tseg_ai AFTER INSERT ON transcript_segments BEGIN
    INSERT INTO transcript_segments_fts(rowid, text, speaker_name)
    VALUES (new.id, new.text, new.speaker_name);
END;

CREATE TRIGGER IF NOT EXISTS tseg_au AFTER UPDATE ON transcript_segments BEGIN
    UPDATE transcript_segments_fts
    SET text = new.text, speaker_name = new.speaker_name
    WHERE rowid = new.id;
END;

CREATE TRIGGER IF NOT EXISTS tseg_ad AFTER DELETE ON transcript_segments BEGIN
    DELETE FROM transcript_segments_fts WHERE rowid = old.id;
END;

-- ─────────────────────────────────────────────
-- SUMMARIES  (1-to-1 with meetings)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS summaries (
    id            INTEGER  PRIMARY KEY AUTOINCREMENT,
    meeting_id    INTEGER  NOT NULL UNIQUE REFERENCES meetings(id) ON DELETE CASCADE,
    overview      TEXT,
    key_points    TEXT,     -- JSON array of strings
    next_steps    TEXT,     -- JSON array of strings
    generated_by  TEXT     NOT NULL DEFAULT 'seeded'
                           CHECK (generated_by IN ('seeded','llm','manual')),
    generated_at  DATETIME,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- ACTION_ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS action_items (
    id             INTEGER  PRIMARY KEY AUTOINCREMENT,
    meeting_id     INTEGER  NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    assignee_id    INTEGER  REFERENCES participants(id) ON DELETE SET NULL,
    assignee_name  TEXT,
    description    TEXT     NOT NULL,
    due_date       DATE,
    status         TEXT     NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','in_progress','completed')),
    priority       TEXT     NOT NULL DEFAULT 'medium'
                            CHECK (priority IN ('low','medium','high')),
    segment_id     INTEGER  REFERENCES transcript_segments(id) ON DELETE SET NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_action_meeting   ON action_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_action_status    ON action_items(meeting_id, status);
CREATE INDEX IF NOT EXISTS idx_action_assignee  ON action_items(assignee_id);

-- ─────────────────────────────────────────────
-- TOPICS  (chapters / outline sections)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS topics (
    id             INTEGER  PRIMARY KEY AUTOINCREMENT,
    meeting_id     INTEGER  NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    title          TEXT     NOT NULL,
    start_time_ms  INTEGER  CHECK (start_time_ms >= 0),
    end_time_ms    INTEGER,
    sequence_index INTEGER  NOT NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_topics_meeting   ON topics(meeting_id);
CREATE INDEX IF NOT EXISTS idx_topics_sequence  ON topics(meeting_id, sequence_index);

-- ─────────────────────────────────────────────
-- TAGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    name       TEXT     NOT NULL UNIQUE COLLATE NOCASE,
    color      TEXT     NOT NULL DEFAULT '#6366F1',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- MEETING_TAGS  (many-to-many junction)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meeting_tags (
    meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    tag_id     INTEGER NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
    PRIMARY KEY (meeting_id, tag_id)
);
```

---

### Interview Talking Points for the Schema

**On normalization**: "I stored transcript segments as individual rows rather than a single TEXT blob because the player sync, search, and topic navigation all require addressing specific moments in time. A blob would require client-side parsing on every request, and you can't index into it."

**On FTS5**: "SQLite ships with FTS5, a full-text search engine with BM25 ranking and Porter stemming. I set up a content table pointing to `transcript_segments` and three triggers to keep the FTS index in sync. The `MATCH` query is orders of magnitude faster than `LIKE '%query%'` on large transcripts."

**On `external_id`**: "The auto-increment `id` is internal to the database. All API responses and URL paths use `external_id` (a UUID). This prevents ID enumeration attacks and makes it safe to expose the identifier publicly."

**On `ON DELETE CASCADE`**: "Every child table specifies what happens when a parent is deleted. Meetings cascade to all their children. Participant references from segments and action items use `SET NULL` so those records survive if a participant is removed without destroying transcript data."

**On CHECK constraints**: "Status and role columns use CHECK constraints to enforce valid values at the database level, not just the application level. This means data consistency is guaranteed even if someone writes directly to the database."

---

## PART 6 — SEARCH ARCHITECTURE

---

### Three Tiers of Search

**Tier 1: Dashboard Search** — Find meetings by title, participant name, or date range.

Query strategy:
```sql
SELECT m.*, COUNT(p.id) as participant_count
FROM meetings m
LEFT JOIN participants p ON p.meeting_id = m.id
WHERE (
    m.title LIKE '%' || :query || '%'
    OR p.name LIKE '%' || :query || '%'
    OR p.email LIKE '%' || :query || '%'
)
AND (:date_from IS NULL OR m.started_at >= :date_from)
AND (:date_to   IS NULL OR m.started_at <= :date_to)
GROUP BY m.id
ORDER BY m.started_at DESC
LIMIT :limit OFFSET :offset;
```

Dashboard search is metadata-only — LIKE is acceptable here because meeting titles are short strings and the cardinality is low (hundreds of meetings, not millions of segments).

API endpoint: `GET /api/v1/meetings?q=budget&date_from=2024-01-01&date_to=2024-12-31&sort=recent&page=1&page_size=20`

---

**Tier 2: Transcript Search** — Find segments within a single meeting that match a query.

Query strategy:
```sql
SELECT ts.id, ts.transcript_id, ts.speaker_name, ts.start_time_ms, ts.end_time_ms,
       ts.text, ts.sequence_index,
       snippet(transcript_segments_fts, 0, '<mark>', '</mark>', '...', 20) AS highlighted_text
FROM transcript_segments_fts
JOIN transcript_segments ts ON ts.id = transcript_segments_fts.rowid
JOIN transcripts t ON t.id = ts.transcript_id
WHERE transcript_segments_fts MATCH :query
AND t.meeting_id = :meeting_id
ORDER BY rank
LIMIT 50;
```

The FTS5 `snippet()` function returns the matching text with configurable highlight markers injected. The frontend renders `<mark>` tags as highlighted spans.

API endpoint: `GET /api/v1/meetings/{id}/transcript/search?q=budget+allocation&limit=50`

Response shape:
```json
{
  "query": "budget allocation",
  "total": 8,
  "results": [
    {
      "segment_id": 42,
      "speaker_name": "Alice Chen",
      "start_time_ms": 134000,
      "end_time_ms": 147000,
      "highlighted_text": "...the <mark>budget allocation</mark> for Q3 was approved...",
      "sequence_index": 17
    }
  ]
}
```

---

**Tier 3: Global Search** (P2 Bonus) — Search across all meetings' transcripts and titles.

Query strategy: UNION of FTS5 segment matches (with their parent meeting context) and LIKE matches on meeting titles, ranked by FTS score.

```sql
SELECT 'segment' as result_type, m.id as meeting_id, m.title as meeting_title,
       ts.id as segment_id, ts.speaker_name, ts.start_time_ms,
       snippet(transcript_segments_fts, 0, '<mark>', '</mark>', '...', 20) AS text,
       rank as score
FROM transcript_segments_fts
JOIN transcript_segments ts ON ts.id = transcript_segments_fts.rowid
JOIN transcripts t ON t.id = ts.transcript_id
JOIN meetings m ON m.id = t.meeting_id
WHERE transcript_segments_fts MATCH :query

UNION ALL

SELECT 'meeting' as result_type, m.id, m.title, NULL, NULL, NULL, m.title, 0
FROM meetings m
WHERE m.title LIKE '%' || :query || '%'

ORDER BY score
LIMIT 30;
```

API endpoint: `GET /api/v1/search?q=investor+deck&type=all`

---

### UI Behaviour

Dashboard search: debounce 300ms, updates URL query params (`?q=budget`), shareable search state.

Transcript search: dedicated search bar within the transcript panel; matching segments show highlighted text; clicking a result scrolls the transcript and seeks the player.

Search result highlighting: `highlighted_text` from the API contains `<mark>` tags; render with `dangerouslySetInnerHTML` (sanitize first) or parse the marker boundaries and render as `<span className="highlight">`.

---

## PART 7 — BACKEND ARCHITECTURE

---

### FastAPI Application Structure

`main.py` registers the router, CORS middleware, exception handlers, and lifespan context (for DB init and seed on startup). All routes are versioned under `/api/v1/`.

---

### Complete Endpoint Specification

```
── Meetings ──────────────────────────────────────────────────────
GET    /api/v1/meetings
  Query: q, date_from, date_to, participant, sort[recent|name], page, page_size
  Returns: PaginatedResponse[MeetingListItem]

POST   /api/v1/meetings
  Body: MeetingCreate { title, started_at, duration_seconds, participants[], transcript_text? }
  Returns: MeetingResponse  (201)

GET    /api/v1/meetings/{external_id}
  Returns: MeetingDetailResponse (includes participant list, counts)

PATCH  /api/v1/meetings/{external_id}
  Body: MeetingUpdate { title?, started_at?, audio_url? }
  Returns: MeetingResponse  (200)

DELETE /api/v1/meetings/{external_id}
  Returns: 204 No Content

── Participants ───────────────────────────────────────────────────
GET    /api/v1/meetings/{external_id}/participants
  Returns: List[ParticipantResponse]

── Transcripts ────────────────────────────────────────────────────
GET    /api/v1/meetings/{external_id}/transcript
  Returns: TranscriptResponse { id, meeting_id, source, segments: SegmentResponse[] }

POST   /api/v1/meetings/{external_id}/transcript
  Body: multipart/form-data { file?: UploadFile } OR JSON { raw_text: str }
  Returns: TranscriptResponse  (201)

GET    /api/v1/meetings/{external_id}/transcript/search
  Query: q (required), limit=50
  Returns: TranscriptSearchResponse { query, total, results: SearchResult[] }

── Summaries ──────────────────────────────────────────────────────
GET    /api/v1/meetings/{external_id}/summary
  Returns: SummaryResponse { overview, key_points[], next_steps[], generated_by, generated_at }

POST   /api/v1/meetings/{external_id}/summary/generate
  Body: {} (triggers LLM call on server)
  Returns: SummaryResponse  (200, replaces existing summary)

── Action Items ───────────────────────────────────────────────────
GET    /api/v1/meetings/{external_id}/action-items
  Query: status[pending|in_progress|completed|all]
  Returns: List[ActionItemResponse]

POST   /api/v1/meetings/{external_id}/action-items
  Body: ActionItemCreate { description, assignee_name?, due_date?, priority? }
  Returns: ActionItemResponse  (201)

PATCH  /api/v1/meetings/{external_id}/action-items/{item_id}
  Body: ActionItemUpdate { description?, status?, assignee_name?, due_date?, priority? }
  Returns: ActionItemResponse  (200)

DELETE /api/v1/meetings/{external_id}/action-items/{item_id}
  Returns: 204 No Content

── Topics ─────────────────────────────────────────────────────────
GET    /api/v1/meetings/{external_id}/topics
  Returns: List[TopicResponse]

── Global Search ──────────────────────────────────────────────────
GET    /api/v1/search
  Query: q (required), type[all|meetings|transcripts], limit=30
  Returns: GlobalSearchResponse { query, results: GlobalSearchResult[] }

── Health ─────────────────────────────────────────────────────────
GET    /api/v1/health
  Returns: { status: "ok", db: "connected" }
```

---

### Service Layer Responsibilities

`MeetingService`: validate meeting creation, compute duration from start/end times, coordinate participant creation alongside meeting creation, call `TranscriptService` if transcript text is provided at creation time.

`TranscriptService`: accept raw text, .vtt, or .json; parse into a list of `SegmentCreate` objects; validate that `end_time_ms > start_time_ms` on every segment; bulk-insert segments in one transaction.

`SummaryService`: call LLM API with the full transcript text and a structured prompt requesting JSON output (overview, key_points, next_steps, action_items); parse the response; UPSERT the summaries table; if the API key is absent, return the existing seeded summary without raising an error.

`SearchService`: coordinate the FTS5 query against `transcript_segments_fts`, join back to `transcript_segments` and `meetings`, format and return ranked results.

---

### Repository Layer Responsibilities

`BaseRepository[M, C, U]`: generic `get`, `get_by_external_id`, `create`, `update`, `delete`, `list` methods — all accepting a `db: Session` parameter.

`MeetingRepository`: overrides `list` to support complex filter/sort/pagination logic with participant JOIN. Exposes `search_by_query(db, q, filters)`.

`TranscriptRepository`: exposes `get_segments_by_meeting(db, meeting_id)`, `bulk_insert_segments(db, segments)`, `fts_search(db, meeting_id, query)`.

`SearchRepository`: exposes `global_fts_search(db, query, type, limit)`.

---

### Error Handling Strategy

Custom exception classes in `core/exceptions.py`:

```python
class NotFoundError(Exception): ...
class ConflictError(Exception): ...    # duplicate external_id, etc.
class TranscriptParseError(Exception): ...
class LLMServiceError(Exception): ...  # LLM API failure (non-fatal)
```

Global exception handlers in `main.py`:

```python
@app.exception_handler(NotFoundError)
async def not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"detail": str(exc), "code": "NOT_FOUND"})
```

All 4xx and 5xx responses return `{"detail": string, "code": string}` — consistent shape that the frontend can handle uniformly.

---

### Logging Strategy

```python
# Structured logging with Python stdlib
import logging
import time
from fastapi import Request

logger = logging.getLogger("fireflies")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = int((time.time() - start) * 1000)
    logger.info(
        "request",
        extra={"method": request.method, "path": request.url.path,
               "status": response.status_code, "duration_ms": duration_ms}
    )
    return response
```

Log levels: DEBUG for repository queries (dev only), INFO for request lifecycle, WARNING for LLM API degradations, ERROR for unhandled exceptions with full traceback.

---

## PART 8 — FRONTEND ARCHITECTURE

---

### Route Structure (App Router)

```
/                      → redirect to /meetings
/meetings              → MeetingsPage (library)
/meetings/[id]         → MeetingDetailPage
/settings              → SettingsPage (placeholder)
/search                → GlobalSearchPage (P2 bonus)
```

All routes inside `(dashboard)/` share the sidebar + topbar layout via a group layout component. The group folder `(dashboard)` does not appear in the URL.

---

### Component Hierarchy

```
RootLayout (app/layout.tsx)
  └── QueryClientProvider (TanStack Query)
      └── Providers (Zustand store, Toasts)
          └── DashboardLayout [(dashboard)/layout.tsx]
              ├── Sidebar
              │   └── SidebarNavItem[]
              ├── Topbar
              └── <Outlet> (page content)
                  │
                  ├── MeetingsPage [/meetings]
                  │   ├── MeetingSearch
                  │   ├── MeetingFilters
                  │   ├── MeetingSortControl
                  │   └── MeetingList
                  │       └── MeetingCard[]
                  │
                  └── MeetingDetailPage [/meetings/[id]]
                      ├── MediaPlayer
                      │   ├── SeekBar
                      │   └── PlayerControls
                      ├── TranscriptPanel
                      │   ├── TranscriptSearch
                      │   └── TranscriptSegment[]  ← scrollable list
                      └── SummaryPanel
                          ├── [tab: Overview]
                          │   ├── KeyPointsList
                          │   └── TopicList
                          └── [tab: Action Items]
                              ├── ActionItemList
                              │   └── ActionItemCard[]
                              └── ActionItemForm
```

---

### State Management Analysis

**Option A: React Context API**

Appropriate for: static global config, theme, auth. Not appropriate for: frequent updates (player `currentTime` fires 4× per second), deeply nested subscriptions. Context re-renders every consumer on any state change — using it for player state would re-render the entire transcript panel on every timeupdate event.

**Option B: Zustand**

Designed for exactly this case. Selector-based subscriptions mean `TranscriptSegment` only re-renders when the `activeSegmentId` it cares about changes. Zero boilerplate. Full TypeScript support. Devtools available. 1kb bundle.

**Option C: TanStack Query (React Query)**

Not a state manager — it manages server state (caching, background sync, invalidation, optimistic updates). It replaces `useEffect + useState` for API calls entirely. It should be used for ALL data fetching alongside, not instead of, Zustand.

**Option D: Redux Toolkit**

Mature and powerful, but significantly more boilerplate than this project warrants. Appropriate for large team projects with complex, interdependent state graphs. Overkill for a solo 24-hour assignment.

---

### Recommendation: TanStack Query (server state) + Zustand (client state)

**TanStack Query owns**: meetings list data, meeting detail, transcript segments, summary, action items. Handles caching, background refetch, optimistic updates (checking off an action item), invalidation after mutations.

**Zustand owns**: player state (`currentTimeMs`, `isPlaying`, `duration`, `activeSegmentId`), UI state (`activeTab`, `transcriptSearchQuery`, toast queue).

The player-transcript sync lives in `usePlayer.ts`:

```typescript
// Zustand playerStore
interface PlayerStore {
  currentTimeMs: number;
  isPlaying: boolean;
  duration: number;
  activeSegmentId: number | null;
  setCurrentTime: (ms: number) => void;
  seekTo: (ms: number) => void;
}

// usePlayer hook — wires the HTML audio element to the store
// and computes activeSegmentId by binary-searching segments
// for the segment whose [start_time_ms, end_time_ms] contains currentTimeMs
```

`TranscriptSegment` subscribes only to `activeSegmentId` via a Zustand selector, so only the segment that becomes active (or inactive) re-renders on each timeupdate — not the entire list of 200+ segments.

---

### Data Fetching Strategy

- Meetings library: server-side fetch via `async/await` in the Next.js page component for initial load (SSR improves perceived performance); TanStack Query `useQuery` for subsequent navigation
- Meeting detail: client-side with TanStack Query; three parallel queries for transcript, summary, and action items
- Action item completion: `useMutation` with optimistic update — toggle the status locally immediately, revert if the API call fails
- Dashboard search: debounced query string fed into TanStack Query `queryKey`; results cached per query string

---

## PART 9 — ARCHITECTURE DIAGRAMS

See rendered diagrams below this document. The three diagrams are:

1. System Architecture — container-level view of all components and their communication
2. ER Diagram — all 9 tables with relationships and cardinality
3. Data Flow — sequence diagram for the three primary flows (page load, player sync, LLM generation)

---

*Document version 1.0 — generated for Scaler SDE Fullstack Assignment (Fireflies Clone)*

====================================================
PART 10 — UI DESIGN SYSTEM
====================================================

## Design Philosophy

Fireflies.ai uses a deep navy-purple dark theme throughout. All surfaces are
opaque dark fills — no glass/blur effects. The only accent is a single purple
ramp (#7B5DE8 → #A080FA). Everything else is near-black with muted lavender
text. This is strict; don't add "personality" through color.

---

## Color Tokens (CSS custom properties in globals.css)

```css
:root {
  /* App surfaces */
  --ff-bg-base:        #0D0E1B;  /* page background */
  --ff-bg-sidebar:     #111222;  /* sidebar */
  --ff-bg-elevated:    #161728;  /* cards, inputs */
  --ff-bg-surface:     #1C1E38;  /* badge backgrounds, player bar */
  --ff-bg-active:      #28206B;  /* active nav item bg */
  --ff-bg-highlight:   #21204A;  /* active transcript segment */

  /* Borders */
  --ff-border:         #1E1F36;  /* default border */
  --ff-border-active:  #4A3DA0;  /* active filter/selection border */

  /* Accent — purple */
  --ff-accent:         #7B5DE8;  /* CTA buttons, active indicator */
  --ff-accent-light:   #A080FA;  /* active nav text, accent text */
  --ff-accent-subtle:  #2D2870;  /* playing badge bg */

  /* Text */
  --ff-text-primary:   #DDD8FF;  /* headings, titles */
  --ff-text-body:      #B0AADD;  /* body copy */
  --ff-text-secondary: #8888B8;  /* overview paragraphs */
  --ff-text-muted:     #62629A;  /* bullet previews, emoji summaries */
  --ff-text-dim:       #545480;  /* timestamps, meta labels */
  --ff-text-faint:     #363660;  /* placeholder text */

  /* Semantic */
  --ff-success:        #2DD6A4;  /* done badge, checkmark */
  --ff-success-bg:     #0F3D2A;  /* done badge background */
  --ff-warning:        #F5A623;
  --ff-error:          #EF4444;

  /* Duration badge */
  --ff-badge-bg:       #1C1E38;
  --ff-badge-text:     #6868A0;
}
```

---

## Speaker Colors (assigned round-robin by participant join order)

```typescript
// lib/speakerColors.ts
export const SPEAKER_COLORS = [
  { bg: '#5B8FF9', text: '#ffffff', label: 'blue'   },  // participant 0
  { bg: '#AA7BF5', text: '#ffffff', label: 'purple' },  // participant 1
  { bg: '#FF8C42', text: '#ffffff', label: 'orange' },  // participant 2
  { bg: '#2DD6A4', text: '#0A2820', label: 'teal'   },  // participant 3
  { bg: '#F177B5', text: '#ffffff', label: 'pink'   },  // participant 4
] as const;

export function getSpeakerColor(index: number) {
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length];
}
```

---

## Typography

| Role               | Size | Weight | Color                  |
|--------------------|------|--------|------------------------|
| Page title         | 15px | 500    | --ff-text-primary      |
| Card title         | 13px | 500    | --ff-text-primary      |
| Section label      | 12px | 500    | --ff-accent (uppercase)|
| Body / transcript  | 12px | 400    | --ff-text-secondary    |
| Meta / timestamp   | 11px | 400    | --ff-text-dim          |
| Placeholder        | 12px | 400    | --ff-text-faint        |

Font family: `Inter, -apple-system, BlinkMacSystemFont, sans-serif`
(Inter loads from Google Fonts; fallback is system sans)

---

## Spacing Scale

| Token  | Value | Usage                          |
|--------|-------|--------------------------------|
| xs     | 4px   | icon-text gap, badge padding   |
| sm     | 8px   | item internal padding          |
| md     | 12px  | card padding (vertical)        |
| lg     | 14px  | card padding (horizontal)      |
| xl     | 18px  | page content padding           |

---

## Border Radius

| Component         | Radius  |
|-------------------|---------|
| Modal, app frame  | 12px    |
| Cards             | 10px    |
| Buttons, inputs   | 7px     |
| Badges, tabs      | 5–6px   |
| Filter chips      | 6px     |
| Avatar circles    | 50%     |
| Checkboxes        | 3px     |

---

## Layout Dimensions

| Region            | Value   |
|-------------------|---------|
| Sidebar width     | 178px   |
| Topbar height     | ~45px   |
| Player bar height | ~42px   |
| Tab bar height    | ~38px   |
| Avatar (card)     | 22px    |
| Avatar (sidebar)  | 28px    |
| Speaker chip      | 26px    |

---

## Component Specs

### MeetingCard
- bg: --ff-bg-elevated (#161728), border: --ff-border
- hover: bg #1E2040, border #2E3060 (CSS transition 0.15s)
- Padding: 12px 14px
- Title: 13px/500/--ff-text-primary
- Meta row: flex, gap 8px, 11px/400/--ff-text-dim
- Duration badge: --ff-badge-bg / --ff-badge-text
- Avatar stack: 22px circles, margin-left -5px, border 2px solid card bg
- Bullet previews: 11px/--ff-text-muted, emoji + text, 2 lines max

### TranscriptSegment
- Layout: flex row, gap 10px, padding 9px 8px
- Active state: bg --ff-bg-highlight (#21204A)
- Speaker chip: 26px circle, getSpeakerColor(index)
- Speaker name: 12px/500 in speaker's text color
- Timestamp: 11px/--ff-text-faint; active = 11px/--ff-accent-light + "▶"
- Text: 12px/1.55 line-height/--ff-text-secondary; active = --ff-text-body

### ActionItem
- Container: --ff-bg-elevated, 8px radius, padding 9px 12px
- Checkbox: 15×15px, 3px radius
  - Complete: bg #1D7A52 + ti-check in #2DD6A4
  - Incomplete: border 1.5px --ff-border
- Text: 12px; complete = strikethrough + --ff-text-dim; incomplete = --ff-text-body
- Assignee + due: 11px/--ff-text-dim

### MediaPlayer
- bg: --ff-bg-sidebar (#111222)
- Play button: 28px circle, --ff-accent bg, ti-player-play 13px white
- Track: 4px tall, bg #25264A, filled portion --ff-accent
- Thumb: 10px circle, --ff-accent-light
- Time labels: 11px/--ff-text-dim
- Speed badge: --ff-bg-surface, 11px/--ff-badge-text

### SidebarNavItem
- Active: bg --ff-bg-active, text/icon --ff-accent-light, font-weight 500
- Inactive: transparent bg, text/icon --ff-text-dim
- hover (inactive): bg #1E1F38
- Height: ~31px, padding 7px 10px, border-radius 7px
- Icon: 15px ti-* outline

### Tabs (meeting detail)
- Tab bar: border-bottom 1px --ff-border, padding 0 18px, bg --ff-bg-base
- Active tab: color --ff-accent-light, border-bottom 2px --ff-accent
- Inactive tab: color --ff-text-dim, border-bottom 2px transparent
- Font: 13px/400, padding 9px 14px

---

## Tailwind Config Integration (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ff: {
          'bg-base':       '#0D0E1B',
          'bg-sidebar':    '#111222',
          'bg-elevated':   '#161728',
          'bg-surface':    '#1C1E38',
          'bg-active':     '#28206B',
          'bg-highlight':  '#21204A',
          border:          '#1E1F36',
          'border-active': '#4A3DA0',
          accent:          '#7B5DE8',
          'accent-light':  '#A080FA',
          'accent-subtle': '#2D2870',
          'text-primary':  '#DDD8FF',
          'text-body':     '#B0AADD',
          'text-secondary':'#8888B8',
          'text-muted':    '#62629A',
          'text-dim':      '#545480',
          'text-faint':    '#363660',
          success:         '#2DD6A4',
          'success-bg':    '#0F3D2A',
          'badge-bg':      '#1C1E38',
          'badge-text':    '#6868A0',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.4' }],
        xs:   ['12px', { lineHeight: '1.55' }],
        sm:   ['13px', { lineHeight: '1.5' }],
        base: ['14px', { lineHeight: '1.6' }],
        md:   ['15px', { lineHeight: '1.5' }],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Screen Inventory

| Screen            | Route                        | Priority |
|-------------------|------------------------------|----------|
| Meetings Library  | /meetings                    | P0       |
| Meeting Detail    | /meetings/[id]               | P0       |
| Create Meeting    | modal on /meetings           | P0       |
| Edit Meeting      | modal on /meetings/[id]      | P0       |

No other screens are in scope.


====================================================
PART 11 — IMPLEMENTATION TICKETS
====================================================

## Sequencing Logic

Dependencies flow strictly forward. Never start a phase until all tickets in
the prior phase are green. The critical path is:
  Schema → Seed → Backend API → Frontend Layout → Library → Detail → Player Sync → Deploy

Total estimated: 22h. Leave 2h buffer for debugging. Total sprint: 24h.

---

## PHASE 1 — Foundation (4h)

### T01 · Repo init + tooling  [0.5h]
Set up monorepo: `frontend/` (Next.js 14 + TypeScript strict + Tailwind),
`backend/` (FastAPI + uv/pip), root `README.md` placeholder, `.gitignore`,
`.env.example` files for both packages.
Acceptance:
- `cd frontend && npm run dev` serves on :3000 without errors
- `cd backend && uvicorn app.main:app --reload` serves on :8000
- `GET /api/v1/health` returns `{"status":"ok"}`

### T02 · Database setup + Alembic init  [0.5h]
Install SQLAlchemy, alembic, aiosqlite. Create `backend/app/db/base.py`
(DeclarativeBase), `session.py` (async session factory), `init_db.py`
(PRAGMA setup: foreign_keys=ON, journal_mode=WAL, synchronous=NORMAL).
Acceptance:
- `alembic init alembic` configured with `sqlalchemy.url = sqlite+aiosqlite:///./fireflies.db`
- Database file created on first startup

### T03 · Full schema migration  [1h]
Write `0001_initial_schema.py` implementing ALL 9 tables + FTS5 virtual table
+ 3 sync triggers + all indexes as specified in Part 5.
Acceptance:
- `alembic upgrade head` runs without errors
- `sqlite3 fireflies.db ".tables"` shows all 9 tables + transcript_segments_fts
- FTS triggers present in `.schema`

### T04 · Seed data — 5 meetings  [1.5h]
Write `backend/app/seeds/seed.py` that creates 5 realistic meetings with:
- Distinct participants (2–5 per meeting)
- Full transcript segments (15–30 segments per meeting, realistic timestamps)
- AI summary (overview + 3 action items + 3 topics per meeting)
- Varying durations (22–65 minutes)
Meeting titles: Q3 Product Roadmap Review, Engineering Weekly Standup,
Investor Pitch Prep, Design System Sprint Review, MEDIQA Research Sync.
Acceptance:
- `python -m app.seeds.seed` populates DB idempotently (checks exist before insert)
- Each meeting has ≥15 transcript segments
- `GET /api/v1/meetings` returns 5 meetings

### T05 · CORS + settings  [0.5h]
Configure `pydantic-settings` BaseSettings: DATABASE_URL, OPENAI_API_KEY
(optional), FRONTEND_URL, SECRET_KEY. Add CORSMiddleware allowing
FRONTEND_URL (dev: localhost:3000, prod: Vercel URL). Add global exception
handlers for HTTPException and unhandled errors.
Acceptance:
- Frontend on :3000 can fetch from :8000 without CORS errors
- Missing env vars produce clear startup error messages

---

## PHASE 2 — Backend Models + Repositories (3h)

### T06 · SQLAlchemy ORM models  [1h]
Create one file per model in `backend/app/models/`. Each mirrors the SQL
schema exactly (external_id, timestamps, CHECK constraints via `__table_args__`).
Use `Mapped[T]` annotations (SQLAlchemy 2.x style). Export all from
`models/__init__.py`.
Acceptance:
- Models reflect actual DB schema (verify via `alembic check`)
- Relationships defined: Meeting.transcript, Meeting.action_items, etc.

### T07 · Pydantic schemas  [0.75h]
Create request/response schemas:
- `MeetingCreate`, `MeetingUpdate`, `MeetingListItem`, `MeetingDetail`
- `TranscriptSegmentResponse`, `TranscriptResponse`
- `SummaryResponse`, `ActionItemCreate`, `ActionItemUpdate`, `ActionItemResponse`
- `PaginatedResponse[T]` generic
All responses include `external_id` not `id`. Use `model_config = ConfigDict(from_attributes=True)`.
Acceptance:
- `from app.schemas import MeetingCreate` imports without errors
- Nested models serialize correctly (Meeting → participants → avatar color)

### T08 · Repository layer  [0.75h]
`BaseRepository[Model, CreateSchema, UpdateSchema]` with:
`get(id)`, `get_by_external_id(uuid)`, `list(skip, limit)`, `create(schema)`,
`update(id, schema)`, `delete(id)`.
`MeetingRepository` overrides `list()` to join participants, support
`q`, `date_from`, `date_to`, `sort_by` filters. Returns `PaginatedResponse`.
`TranscriptRepository` adds `bulk_insert_segments(segments)` + `fts_search(meeting_id, q)`.
Acceptance:
- Unit test: `MeetingRepository.list(q="roadmap")` returns correct subset
- `bulk_insert_segments` inserts 30 segments faster than 1s

### T09 · Service layer  [0.5h]
`MeetingService`, `TranscriptService`, `SummaryService`:
- Thin orchestration (call repositories, validate business rules)
- `SummaryService.generate(meeting_id)`: calls LLM if OPENAI_API_KEY set;
  falls back to returning seeded summary if not
Acceptance:
- Services importable; no business logic in route handlers
- LLM fallback works when API key is absent

---

## PHASE 3 — Backend API (3h)

### T10 · Meetings CRUD endpoints  [1h]
```
GET    /api/v1/meetings           → list (filter/sort/paginate)
POST   /api/v1/meetings           → create
GET    /api/v1/meetings/{id}      → detail (with participants)
PATCH  /api/v1/meetings/{id}      → update title/duration
DELETE /api/v1/meetings/{id}      → delete (cascades)
GET    /api/v1/meetings/{id}/participants → list participants
```
All `{id}` params are `external_id` (UUID string). 404 on not found.
Acceptance:
- All 6 endpoints tested via Swagger UI (/docs)
- DELETE cascades (transcript + segments + summary + action_items gone)

### T11 · Transcript endpoints  [0.5h]
```
GET  /api/v1/meetings/{id}/transcript
→ { meeting_id, segments: [...], total_segments }
Segments ordered by sequence_index.
```
Acceptance:
- Returns segments with start_time_ms, end_time_ms, speaker_name, text, sequence_index
- Response time < 200ms for 30 segments

### T12 · Summary + action items endpoints  [0.75h]
```
GET   /api/v1/meetings/{id}/summary          → full summary object
POST  /api/v1/meetings/{id}/summary/generate → trigger LLM (or fallback)
GET   /api/v1/meetings/{id}/action-items     → list
POST  /api/v1/meetings/{id}/action-items     → create
PATCH /api/v1/meetings/{id}/action-items/{item_id}  → update (text/status)
DELETE /api/v1/meetings/{id}/action-items/{item_id} → delete
GET   /api/v1/meetings/{id}/topics           → list topics with start_time_ms
```
Acceptance:
- PATCH action item with `{"status":"completed"}` returns updated record
- Topics include `start_time_ms` for player seek

### T13 · FTS5 transcript search  [0.5h]
```
GET /api/v1/meetings/{id}/transcript/search?q=latency&limit=10
→ [{ segment_id, start_time_ms, speaker_name, snippet }]
```
Uses `transcript_segments_fts MATCH ?` + `snippet()` for highlighted text.
Filters to the given `meeting_id` via JOIN.
Acceptance:
- Query "latency" returns segments containing "latency" and stemmed variants
- Snippet contains `<mark>latency</mark>` HTML

### T14 · Dashboard search + health  [0.25h]
```
GET /api/v1/meetings?q=roadmap&date_from=2026-06-01&sort=date_desc
GET /api/v1/health → {"status":"ok","db":"connected"}
```
Acceptance:
- q= filters on meeting title + participant name (LIKE %q%)
- Health endpoint checks DB connectivity

---

## PHASE 4 — Frontend Foundation (2h)

### T15 · Next.js setup + Tailwind + design tokens  [0.5h]
Install: Tailwind CSS, Inter font (next/font/google), TanStack Query, Zustand,
Axios. Add `tailwind.config.ts` with full `ff.*` color tokens from Part 10.
Add `globals.css` with CSS custom properties. Configure `@next/font` for Inter.
Acceptance:
- `className="bg-ff-bg-base text-ff-text-primary"` renders correctly
- Inter loads with `font-display: swap`

### T16 · App layout — sidebar + topbar  [0.75h]
`components/layout/Sidebar.tsx`: 178px, nav items with active state derived
from `usePathname()`. User avatar at bottom (hardcoded for now).
`components/layout/AppShell.tsx`: wraps pages, applies sidebar + right content area.
Apply to both route groups: `(dashboard)/layout.tsx`.
Acceptance:
- Navigating to /meetings highlights "Meetings" nav item
- Sidebar renders identically to mockup (colors, dimensions, font sizes)

### T17 · API client + TanStack Query + Zustand  [0.75h]
`lib/api/client.ts`: Axios instance with baseURL from `NEXT_PUBLIC_API_URL`,
interceptors for 404→redirect, error toast.
`lib/api/meetings.ts`, `transcripts.ts`, `summaries.ts`, `actionItems.ts`:
typed fetch functions matching API spec.
`stores/playerStore.ts`: `{ currentTimeMs, isPlaying, duration, activeSegmentId, set* }`.
`stores/uiStore.ts`: `{ activeTab, transcriptQuery, toasts, addToast, removeToast }`.
Acceptance:
- `useMeetings()` hook returns typed `MeetingListItem[]`
- Zustand stores initialize without errors; devtools accessible

---

## PHASE 5 — Meetings Library (2h)

### T18 · MeetingCard component  [0.5h]
Props: `meeting: MeetingListItem`. Renders: title, date/time, duration badge,
participant avatar stack (max 3 + overflow count), 2 bullet preview lines.
Hover state via Tailwind group hover. Clicking navigates to `/meetings/${meeting.external_id}`.
Acceptance:
- Renders pixel-accurately against the Library mockup
- Avatar colors determined by `getSpeakerColor(participantIndex)`

### T19 · Meetings Library page  [1h]
`app/(dashboard)/meetings/page.tsx`: SSR initial load via `prefetchQuery`.
Topbar: search input (debounced 300ms, updates URL param `?q=`),
filter chips (All / This week / This month / Shared with me — state in URL),
sort selector, "+ New meeting" button.
Meeting list: `<MeetingCard>` per item, empty state with CTA.
Acceptance:
- URL updates on search (`?q=roadmap`) without page reload
- Filtering "This week" only shows meetings from the past 7 days
- Empty state shows "No meetings yet. Add your first one."

### T20 · Create / Edit / Delete meeting modal  [0.5h]
`<CreateMeetingModal>`: form fields (title, date, duration, participants input).
`<EditMeetingModal>`: pre-fills from meeting data.
Delete: confirmation dialog before `DELETE /api/v1/meetings/{id}`.
All use TanStack Query mutations with optimistic cache invalidation + toast on success/error.
Acceptance:
- Creating a meeting adds it to the top of the list immediately (optimistic)
- Deleting removes it immediately; toasts "Meeting deleted"

---

## PHASE 6 — Meeting Detail (5h)

### T21 · Meeting detail page skeleton + header  [0.5h]
`app/(dashboard)/meetings/[id]/page.tsx`: renders three parallel TanStack Query
fetches (transcript, summary, action-items) with Suspense boundaries.
Meeting header: title, date, duration badge, participant count, Share + Export buttons.
Acceptance:
- Page renders without waterfall (3 parallel fetches on load)
- Loading skeletons visible during initial fetch

### T22 · MediaPlayer component  [0.75h]
`components/player/MediaPlayer.tsx`: uses an `<audio>` element (hidden) seeded
with a fake blob URL so timeupdate fires. Controls: play/pause button (Zustand),
seek bar (custom div, no `<input type=range>` to preserve dark styling),
current time / duration display, speed selector (0.75×, 1×, 1.25×, 1.5×, 2×).
Clicking any segment timestamp → `audio.currentTime = segment.start_time_ms / 1000`.
Acceptance:
- Clicking play increments time display in real time
- Clicking a timestamp jumps the seek bar to that position
- Speed selector changes playback rate

### T23 · TranscriptPanel + TranscriptSegment  [1h]
`components/transcript/TranscriptPanel.tsx`: scrollable container for segments.
`components/transcript/TranscriptSegment.tsx`:
- Props: `segment`, `isActive: boolean`, `onSeek: (ms: number) => void`
- `isActive` → `bg-ff-bg-highlight` + bold speaker + "playing" badge
- Speaker chip colored via `getSpeakerColor`
- Timestamp is a `<button>` that calls `onSeek(start_time_ms)`
- Uses `React.memo` + stable `isActive` selector to prevent full list re-render
`components/transcript/TranscriptSearch.tsx`: input that calls
`GET /transcript/search`, highlights result segments in the list.
Acceptance:
- 30-segment list renders without janky re-renders at 4Hz time updates
- Active segment highlighted with correct background and "playing" label

### T24 · Bidirectional player-transcript sync ← CRITICAL  [1.5h]
This is the single most-evaluated interactive feature.

Player → Transcript (forward sync):
- `audio.addEventListener('timeupdate', ...)` fires ~4× per second
- Binary search `segments` array: find segment where `start_ms ≤ currentMs < end_ms`
- Set `activeSegmentId` in Zustand playerStore
- `useEffect` on `activeSegmentId`: `segmentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })`

Transcript → Player (reverse sync):
- Clicking a segment timestamp: `audio.currentTime = ms / 1000`
- Player seek bar updates immediately to reflect new position

Binary search implementation:
```typescript
function findActiveSegment(segments: Segment[], currentMs: number): number {
  let lo = 0, hi = segments.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (segments[mid].end_time_ms <= currentMs) lo = mid + 1;
    else if (segments[mid].start_time_ms > currentMs) hi = mid - 1;
    else return mid;
  }
  return -1;
}
```
Acceptance:
- Playing audio: active segment scrolls into view and highlights in real time
- Clicking any timestamp: player seeks AND transcript highlights new active segment
- No visible lag or jank at normal playback speed

### T25 · SummaryPanel + ActionItemList + TopicList  [0.75h]
Summary tab layout:
- `<SummaryOverview>`: overview text paragraph (--ff-text-secondary)
- `<ActionItemList>`: maps action items; each `<ActionItemCard>` has custom
  checkbox, text (strikethrough if complete), assignee+due meta.
  Checkbox click → `PATCH /action-items/{id}` with `{status: "completed"}` +
  optimistic update (no refetch needed).
- `<TopicList>`: chips with title + timestamp, clicking seeks player to `start_time_ms`
- "+ Add action item" inline form (text input → `POST /action-items`)
- "Generate AI summary" button → `POST /summary/generate` + loading state
Acceptance:
- Checking an action item marks it complete instantly (optimistic)
- Clicking a topic chip seeks the player correctly
- "Generate AI summary" button shows spinner then updates overview text

---

## PHASE 7 — UX Polish (2.5h)

### T26 · Loading skeletons  [0.5h]
`<MeetingCardSkeleton>`: matches MeetingCard layout with animated shimmer
(CSS animation or Tailwind `animate-pulse`) using --ff-bg-surface fills.
`<TranscriptSkeleton>`: 6 alternating-width fake segments.
`<SummarySkeleton>`: paragraph block + 3 action item rows.
Show during TanStack Query `isLoading` states.
Acceptance:
- First paint of both pages shows skeletons, not blank screens

### T27 · Toast notifications  [0.5h]
`components/ui/Toast.tsx` + Zustand uiStore: `addToast(msg, type)`.
Positions: top-right, stacks vertically, auto-dismisses after 3s.
Types: success (#2DD6A4 accent), error (#EF4444), info (#A080FA).
Used by: create/delete meeting, action item toggle, summary generate, API errors.
Acceptance:
- All mutations show appropriate toast on success/error
- Multiple toasts stack without overlapping

### T28 · In-transcript search with highlights  [0.75h]
`TranscriptSearch` component: input debounced 500ms → calls
`GET /meetings/{id}/transcript/search?q=`.
Results: matching segments scroll into view + text highlighted via
`dangerouslySetInnerHTML` using `<mark>` tags from API `snippet` field.
Clicking a result: seeks player to `start_time_ms`.
Clear button resets search and removes highlights.
Acceptance:
- Typing "latency" highlights all segments with that term
- Clicking a highlighted segment jumps player to that timestamp

### T29 · LLM summary generation  [0.75h]
`backend/app/utils/llm_client.py`:
```python
async def generate_summary(transcript_text: str) -> SummaryResult:
    if not settings.OPENAI_API_KEY:
        raise LLMNotConfiguredError
    # prompt: system role + transcript + JSON schema instruction
    # response parsed to { overview, action_items[], topics[] }
```
Prompt design: "You are a meeting assistant. Given the following transcript,
return a JSON object with: overview (2-3 sentence paragraph), action_items
(list of {text, assignee_name, due_date_hint}), topics (list of {title, start_time_ms})."
Graceful fallback: if LLM errors, return 503 with `{"code":"LLM_UNAVAILABLE"}`.
Frontend shows "AI summary unavailable — using cached version" toast.
Acceptance:
- With API key: generates real summary in < 8 seconds
- Without API key: returns seeded summary, frontend shows degraded toast

---

## PHASE 8 — Deploy + README (2h)

### T30 · Backend deployment (Render)  [0.5h]
Create `render.yaml`:
```yaml
services:
  - type: web
    name: fireflies-backend
    env: python
    buildCommand: pip install -r requirements.txt && alembic upgrade head && python -m app.seeds.seed
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        value: sqlite+aiosqlite:///./fireflies.db
      - key: FRONTEND_URL
        sync: false
```
Acceptance:
- `GET https://fireflies-backend.onrender.com/api/v1/health` returns 200
- `GET /api/v1/meetings` returns 5 seeded meetings

### T31 · Frontend deployment (Vercel)  [0.5h]
`frontend/vercel.json`: set `NEXT_PUBLIC_API_URL` to Render URL.
Configure `next.config.ts`: `output: 'standalone'` for static optimization.
Acceptance:
- Production URL opens Meetings Library without console errors
- Meeting detail loads transcript correctly from Render backend

### T32 · README  [1h]
Sections: Project Overview, Live Demo (links), Architecture (embed ER diagram
from spec), Tech Stack, Local Setup (step-by-step), Environment Variables,
API Overview (table of endpoints), Database Schema (key tables), Design
Decisions (5 bullet points defending choices — see interview talking points
throughout this spec), Seed Data.
Acceptance:
- A fresh clone with `npm install` + `pip install` + seed runs end-to-end
- README opens in GitHub with no broken images or links
- Architecture diagram renders as a Mermaid code block

---

## 24-Hour Sprint Schedule

| Hour    | Tickets         | Milestone                          |
|---------|-----------------|-------------------------------------|
| 0–4     | T01–T05         | DB seeded, health endpoint green    |
| 4–7     | T06–T09         | Repository + service layer done     |
| 7–10    | T10–T14         | All API endpoints tested in Swagger |
| 10–12   | T15–T17         | Frontend boots, TanStack Query live |
| 12–14   | T18–T20         | Meetings Library functional         |
| 14–19   | T21–T25         | Meeting detail + player sync live   |
| 19–21.5 | T26–T29         | Skeletons, toasts, search, LLM      |
| 21.5–24 | T30–T32         | Deployed + README done              |

## Interview Defense Cheatsheet

| Decision              | Why                                                        |
|-----------------------|------------------------------------------------------------|
| Segments as rows      | Enables player seek, FTS5, per-segment operations; blob = anti-pattern |
| FTS5 with porter      | Stemming catches "latency"→"latencies"; LIKE can't do this |
| external_id (UUID)    | Prevents ID enumeration attacks on public API              |
| TanStack Query        | Deduplication, background refetch, optimistic updates built-in |
| Zustand over Context  | timeupdate fires 4×/s — Context would re-render all consumers |
| Binary search sync    | O(log n) vs O(n) linear scan; negligible at 30 segs, critical at 300 |
| Alembic on SQLite     | Shows production mindset; reviewers notice missing migrations |
| Service/Repo split    | Enables unit testing repos independently of business logic  |


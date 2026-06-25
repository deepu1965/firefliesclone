# Fireflies Clone — Final Implementation-Readiness Audit
## Blueprint v1.0 · Synthesized Across Both Documents

> **Scope:** The attached `final-audit-report.md` already identifies 32 gaps across 10 dimensions
> with full detail. This document adds 10 additional gaps that analysis of the blueprint
> reveals were missed, then produces the four requested composite outputs.
> No architecture changes are proposed. Every fix is additive.

---

## ADDITIONAL GAPS — Not Covered by the Existing 32

These 10 gaps were identified by cross-referencing the blueprint's implementation tickets,
schema DDL, React patterns, and deployment configuration against known runtime failure modes.

---

### NB-1 — T21 Missing Participants Fetch for Speaker Color Map

**Why it matters:**  
T21 specifies three parallel fetches on the meeting detail page: transcript, summary, and
action-items. The `useSpeakerColorMap` hook (proposed as the fix for Gap 1.4) needs the
participants list to assign deterministic colors. Without a fourth fetch for
`GET /api/v1/meetings/{id}/participants`, the color map receives an empty array and every
speaker renders as the same default color.

**Evaluation impact:**  
Visual incoherence on the highest-evaluated screen. Speaker chips have mismatched or
uniform colors in the transcript panel, dropping the visual fidelity score (Rank 1 criterion).

**Smallest fix:**  
Add to T21 acceptance criteria: "Page loads with FOUR parallel TanStack Query fetches:
transcript, summary, action-items, **and participants**. Pass the participants array to
`useSpeakerColorMap(participants)`. Verify speaker chips show distinct colors for each unique
speaker across all seeded meetings."

---

### NB-2 — Meeting Creation Redirect Flow Unspecified

**Why it matters:**  
T20 calls `POST /api/v1/meetings` and invalidates the meeting list cache. It never specifies
what happens to the user after a successful creation. The 201 response contains the new
meeting's `external_id`. Without extracting it and calling `router.push('/meetings/{external_id}')`,
the user stays on the library page with no way to navigate to their newly created meeting.

**Evaluation impact:**  
The create-meeting flow ends with a toast and no navigation — the meeting exists in the list
but the user must find it manually. This fails the "create meeting" check in the 90-second
evaluator walkthrough.

**Smallest fix:**  
Add to T20 acceptance criteria: "On successful create, the mutation's `onSuccess` handler
receives the API response and calls `router.push('/meetings/' + response.external_id)`.
Verify the user lands on the new meeting's detail page immediately after modal submission."

---

### NB-3 — `useEffect` Cleanup Missing for Audio Event Listeners

**Why it matters:**  
T24 adds `audio.addEventListener('timeupdate', handler)` but never specifies a cleanup
function in the `useEffect` return. Next.js 14 enables React StrictMode by default, which
double-invokes effects in development to detect side-effect bugs. Without cleanup, the
`timeupdate` handler registers twice, causing the binary search to fire twice per tick.
This can produce competing `setActiveSegmentId` calls that flicker the highlighted segment.

**Evaluation impact:**  
The bidirectional sync — the single most-evaluated feature — appears unreliable during
development. Demo recordings taken from a dev build show flickering transcript highlights.

**Smallest fix:**  
Add to T24: "The `useEffect` in `usePlayer.ts` that adds the `timeupdate` listener MUST
return a cleanup: `return () => audio.removeEventListener('timeupdate', onTimeUpdate)`.
Verify in Chrome DevTools → Sources → Event Listeners that only one `timeupdate` handler
is registered after mount."

---

### NB-4 — TanStack Query Version Not Pinned (v4 vs v5 Breaking Changes)

**Why it matters:**  
`npm install @tanstack/react-query` as of mid-2024 installs v5 by default. TanStack Query
v5 removed `onSuccess`, `onError`, and `onSettled` as options on `useMutation` — these now
belong at the call site. The blueprint's patterns (T17) show v4-style inline callbacks.
Installing v5 with v4 patterns produces no TypeScript error but silently drops all mutation
side effects — toasts never fire, cache never invalidates, optimistic updates never roll back.

**Evaluation impact:**  
All mutations silently succeed without UI feedback. Action item toggles appear broken.
Create/delete meeting shows no toast. This affects Rank 2 (functionality completeness).

**Smallest fix:**  
Add to T15: "Pin TanStack Query explicitly: `npm install @tanstack/react-query@4.36.1`.
If upgrading to v5 is preferred, move all `onSuccess`/`onError` callbacks from `useMutation`
options to the `mutate(data, { onSuccess, onError })` call-site signature."

---

### NB-5 — `requirements.txt` Content Never Specified

**Why it matters:**  
No ticket defines the backend dependency file or pins versions. FastAPI, SQLAlchemy 2.x,
Pydantic v2, and aiosqlite all have breaking changes relative to their prior major versions.
An unpinned install at deployment time will resolve to latest, which may differ from the
version used during development.

**Evaluation impact:**  
Render deployment breaks silently if a major version change ships between development
and evaluation. The evaluator's local setup fails at `pip install`. The README acceptance
criterion ("fresh clone runs end-to-end") cannot be met without pinned versions.

**Smallest fix:**  
Add to T01: "Commit `backend/requirements.txt` with pinned major versions:
`fastapi>=0.111,<0.112`, `sqlalchemy>=2.0,<2.1`, `aiosqlite>=0.20,<0.21`,
`alembic>=1.13,<1.14`, `pydantic>=2.7,<2.8`, `pydantic-settings>=2.2,<2.3`,
`httpx>=0.27,<0.28`, `pytest>=8.0,<8.1`, `pytest-asyncio>=0.23,<0.24`.
Run `pip freeze > requirements-lock.txt` to capture exact transitive versions."

---

### NB-6 — `conftest.py` Content Never Specified

**Why it matters:**  
`backend/tests/conftest.py` is listed as "Test DB setup, fixtures" with no implementation
guidance. Async SQLAlchemy requires specific non-obvious fixtures: an `event_loop` with
session scope (to avoid `ScopeMismatch` errors), an async test engine using in-memory
SQLite, an `AsyncSession` factory, and a `db` fixture that rolls back after each test.
Without these, `pytest` fails immediately on the first import.

**Evaluation impact:**  
All backend tests fail to run. The GitHub Actions CI badge shows red. An evaluator who
runs `pytest` locally sees 0 tests collected and an import error — this drops code quality.

**Smallest fix:**  
Add to T08: "Write `conftest.py` with:
```python
import pytest, pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.db.base import Base

@pytest.fixture(scope='session')
def event_loop():
    import asyncio
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture
async def db():
    engine = create_async_engine('sqlite+aiosqlite:///:memory:')
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
```
Add `asyncio_mode = 'auto'` to `pytest.ini` or `pyproject.toml`."

---

### NB-7 — `dangerouslySetInnerHTML` Without Server-Side Sanitization

**Why it matters:**  
T28 renders transcript search snippets using `dangerouslySetInnerHTML` with the `snippet`
field returned by `GET /transcript/search`. That field contains `<mark>` tags injected by
the FTS5 `snippet()` function. If the underlying transcript text contains `<`, `>`, or `"`
characters (common in technical meeting transcripts: "latency was <200ms"),
those characters are emitted verbatim in the HTML fragment, producing broken markup or
an XSS vector. An evaluator reviewing the code will flag this immediately.

**Evaluation impact:**  
Code quality / security flag during the code review phase (Rank 6 criterion).

**Smallest fix:**  
Add to T13: "Before injecting `<mark>` tags in the `snippet()` output, HTML-escape the raw
segment text on the server:
```python
import html
safe_text = html.escape(segment.text)
# Then replace escaped match terms with <mark> wrapped version
```
Alternatively, strip HTML-unsafe characters from user-uploaded transcript text during
`TranscriptService.parse()`. Do NOT rely on the frontend to sanitize before rendering."

---

### NB-8 — Async/Sync SQLAlchemy Session Inconsistency

**Why it matters:**  
T02 specifies an "async session factory" using `aiosqlite`. But T08's `BaseRepository`
lists synchronous method signatures (`get(id)`, `create(schema)`) with a `db: Session`
parameter. FastAPI's async route handlers will deadlock or raise
`MissingGreenlet`/`greenlet_spawn` errors if a synchronous `Session` (not `AsyncSession`)
is used inside an `async def` route. This is the most common SQLAlchemy 2.x + FastAPI
setup mistake.

**Evaluation impact:**  
All API endpoints fail at runtime with a cryptic `greenlet_spawn` error. No functionality
is demonstrable. This is a critical deployment blocker.

**Smallest fix:**  
Add to T02: "All repository methods MUST be `async def` and accept `db: AsyncSession`.
The FastAPI dependency must be:
```python
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session
```
Replace every `db: Session` type annotation with `db: AsyncSession` across all repositories,
services, and endpoint files. Use `await db.execute(...)` and `await db.commit()` throughout."

---

### NB-9 — LLM Model Name and Token Budget Unspecified

**Why it matters:**  
T29's `llm_client.py` specifies a well-structured prompt but never states the model name,
`max_tokens`, or `temperature`. Using `gpt-4o` costs ~15× more per call than `gpt-3.5-turbo`
and adds 10–20 seconds of latency. The T29 acceptance criterion is "< 8 seconds" — this
requirement is only achievable with a fast model. Without specifying the model, a developer
may default to a slow/expensive one and fail both the latency and cost criteria.

**Evaluation impact:**  
LLM summary generation either exceeds the 8-second acceptance threshold or makes the
feature too expensive to demo repeatedly.

**Smallest fix:**  
Add to T29: "In `llm_client.py`, use `model='gpt-3.5-turbo-0125'` (or `claude-haiku-4-5`
for Anthropic). Set `max_tokens=800`, `temperature=0.3`. For OpenAI, add
`response_format={'type': 'json_object'}` to enforce JSON output. Expected latency: 2–4s.
Add the model name to `.env.example` as `LLM_MODEL=gpt-3.5-turbo-0125` so it can be
overridden without code changes."

---

### NB-10 — FTS5 Content Table DELETE Trigger Pattern

**Why it matters:**  
The `tseg_ad` DELETE trigger uses `DELETE FROM transcript_segments_fts WHERE rowid = old.id`.
For FTS5 **external content** tables (configured with `content='transcript_segments'`), the
SQLite documentation specifies that deletions must use the special INSERT form:
`INSERT INTO fts(fts, rowid, col) VALUES('delete', old.id, old.text)`.
A regular `DELETE` on an external content FTS5 table does not reliably remove entries from
the index in all SQLite builds. Stale FTS entries from deleted segments can cause `MATCH`
queries to return rows that no longer exist in `transcript_segments`, producing JOIN failures
and 500 errors on the search endpoint.

Similarly, the `tseg_au` UPDATE trigger uses `UPDATE transcript_segments_fts SET ... WHERE rowid`
which is not the documented update pattern for external content tables (requires delete + insert).

**Evaluation impact:**  
After an evaluator deletes a meeting, the transcript search endpoint returns 500 errors for
subsequent queries that match deleted content. This surfaces during the search demo.

**Smallest fix:**  
Rewrite both triggers in T03:
```sql
-- DELETE trigger (correct external content FTS5 pattern)
CREATE TRIGGER IF NOT EXISTS tseg_ad AFTER DELETE ON transcript_segments BEGIN
    INSERT INTO transcript_segments_fts(transcript_segments_fts, rowid, text, speaker_name)
    VALUES ('delete', old.id, old.text, old.speaker_name);
END;

-- UPDATE trigger (correct external content FTS5 pattern)
CREATE TRIGGER IF NOT EXISTS tseg_au AFTER UPDATE ON transcript_segments BEGIN
    INSERT INTO transcript_segments_fts(transcript_segments_fts, rowid, text, speaker_name)
    VALUES ('delete', old.id, old.text, old.speaker_name);
    INSERT INTO transcript_segments_fts(rowid, text, speaker_name)
    VALUES (new.id, new.text, new.speaker_name);
END;
```

---

## PART A — FINAL GAP REPORT

Combined inventory of all 42 gaps. The existing 32 are summarized for reference;
the 10 new gaps above have full detail. Severity: 🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low.

| ID    | Dimension         | Summary                                              | Sev   |
|-------|-------------------|------------------------------------------------------|-------|
| 1.1   | Assignment Req    | CreateMeetingModal missing transcript input          | 🔴    |
| 1.2   | Assignment Req    | `transcript_parser.py` has no specification          | 🔴    |
| 1.3   | Assignment Req    | Participant filter chip absent from library page     | 🟠    |
| 1.4   | Assignment Req    | Speaker label ↔ segment speaker_name mapping missing | 🟠    |
| 1.5   | Assignment Req    | In-transcript search prev/next navigation absent     | 🟠    |
| 2.1   | Eval Opportunity  | Three-panel detail page layout unspecified           | 🔴    |
| 2.2   | Eval Opportunity  | MeetingCard preview bullets have no data source      | 🟠    |
| 2.3   | Eval Opportunity  | `activeSegmentId` null on page load (no initial seg) | 🟡    |
| 2.4   | Eval Opportunity  | `sample-audio.mp3` never committed anywhere          | 🔴    |
| 3.1   | Deliverables      | `.env.example` contents never specified              | 🟠    |
| 3.2   | Deliverables      | GitHub Actions CI ticket absent                      | 🟢    |
| 3.3   | Deliverables      | `docs/` folder obsolete vs inline README diagrams    | 🟡    |
| 4.1   | Transcript UX     | No "scroll to now playing" recovery button           | 🟡    |
| 4.2   | Transcript UX     | Empty transcript state not specified                 | 🟡    |
| 4.3   | Transcript UX     | Long transcript virtualization not acknowledged      | 🟢    |
| 5.1   | Fireflies UX      | Topbar content completely unspecified                | 🟠    |
| 5.2   | Fireflies UX      | Back navigation from detail to library missing       | 🟡    |
| 5.3   | Fireflies UX      | Date/duration display formats unspecified            | 🟡    |
| 5.4   | Fireflies UX      | Active sidebar broken on nested routes               | 🟡    |
| 6.1   | Seed Data         | No date distribution across filter ranges            | 🟠    |
| 6.2   | Seed Data         | Action items all seeded as `pending`                 | 🟡    |
| 6.3   | Seed Data         | Seed idempotency mechanism unspecified               | 🟡    |
| 6.4   | Seed Data         | Transcript timestamps vs audio duration mismatch     | 🟠    |
| 6.5   | Seed Data         | `speaker_label` not linked to `speaker_name`         | 🟠    |
| 7.1   | Deployment        | SQLite not persisted on Render free tier             | 🔴    |
| 7.2   | Deployment        | CORS circular dependency Render↔Vercel               | 🟠    |
| 7.3   | Deployment        | Render cold start not mitigated (blank screen)       | 🟡    |
| 7.4   | Deployment        | `render.yaml` missing `healthCheckPath`              | 🟠    |
| 7.5   | Deployment        | Action items use internal `id` in URLs               | 🟠    |
| 8.1   | README            | Mermaid diagrams referenced but never written        | 🟠    |
| 8.2   | README            | "Assumptions" section absent                         | 🟡    |
| 8.3   | README            | Exact local setup command sequence not written       | 🟡    |
| 9.1   | Testing           | `findActiveSegment()` binary search has no tests     | 🟠    |
| 9.2   | Testing           | FTS5 trigger round-trip has no integration test      | 🟠    |
| 9.3   | Testing           | `test_action_items.py` absent                        | 🟡    |
| 9.4   | Testing           | Frontend has zero specified tests                    | 🟢    |
| 10.1  | Sequencing        | `transcript_parser.py` needed before T04             | 🔴    |
| 10.2  | Sequencing        | Alembic `--autogenerate` won't capture FTS5/triggers | 🔴    |
| 10.3  | Sequencing        | `NEXT_PUBLIC_API_URL` not verified before T17        | 🟠    |
| 10.4  | Sequencing        | T22 and T24 both implement seek logic (duplication)  | 🟠    |
| NB-1  | Eval Opportunity  | T21 missing participants fetch for color map         | 🟠    |
| NB-2  | Assignment Req    | Meeting creation redirect flow unspecified           | 🟠    |
| NB-3  | Testing           | `useEffect` cleanup missing for audio listeners      | 🟡    |
| NB-4  | Sequencing        | TanStack Query version unpinned (v4 vs v5 breaking)  | 🟠    |
| NB-5  | Deliverables      | `requirements.txt` never specified                   | 🟠    |
| NB-6  | Testing           | `conftest.py` content never specified                | 🟠    |
| NB-7  | Eval Opportunity  | `dangerouslySetInnerHTML` without server sanitization| 🟡    |
| NB-8  | Sequencing        | Async/sync SQLAlchemy session inconsistency          | 🔴    |
| NB-9  | Assignment Req    | LLM model name and token budget unspecified          | 🟡    |
| NB-10 | Sequencing        | FTS5 content table DELETE/UPDATE trigger pattern     | 🟠    |

**Severity totals:** 🔴 7 Critical · 🟠 22 High · 🟡 15 Medium · 🟢 4 Low

---

## PART B — TOP 10 RISKS

Ranked by `P(occurrence during build) × Score impact if it occurs`.

---

### Risk 1 — SQLite wiped on Render restart *(GAP 7.1)*
`P=0.95 × S=Critical`  
The build command re-seeds every restart. Evaluator visits twice; second visit shows fresh
data, breaking any created/edited state. Fix: 5-minute `render.yaml` disk addition.
**This is the most common demo failure for SQLite-on-cloud submissions.**

---

### Risk 2 — Async/sync SQLAlchemy deadlock *(NB-8)*
`P=0.80 × S=Critical`  
Using sync `Session` in async FastAPI routes raises `MissingGreenlet` on the first DB call.
Every API endpoint fails. The entire app is non-functional. Fix requires `AsyncSession`
throughout, which is a pervasive change — costs 2–3h to retrofit if not done from T02.
**Must be caught before T06 (ORM models) or the fix compounds.**

---

### Risk 3 — `sample-audio.mp3` unspecified and forgotten *(GAP 2.4)*
`P=0.75 × S=Critical`  
Broken audio src = `timeupdate` never fires = bidirectional sync is silently dead.
The single most-evaluated interactive feature fails with no error. Fix: 10-minute commit in T01.
**Forget it once and the entire player-transcript demo is dead.**

---

### Risk 4 — Alembic autogenerate missing FTS5 and triggers *(GAP 10.2)*
`P=0.80 × S=High`  
Running `--autogenerate` produces a migration file that omits the FTS5 virtual table and all
three sync triggers. Search returns zero results permanently. The transcript search demo fails.
Fix: write T03 migration manually with `op.execute()`.

---

### Risk 5 — FTS5 content table trigger pattern *(NB-10)*
`P=0.65 × S=High`  
The DELETE trigger uses an undocumented pattern for external content FTS5 tables. After an
evaluator deletes a test meeting, subsequent FTS queries match orphaned rowids, causing JOIN
failures and 500 errors on the transcript search endpoint. Fix: rewrite both triggers in T03.

---

### Risk 6 — TanStack Query v5 installed with v4 patterns *(NB-4)*
`P=0.55 × S=High`  
`npm install @tanstack/react-query` without a version pin installs v5. All `useMutation`
`onSuccess`/`onError` callbacks are silently dropped. Action item toggles complete but show
no toast and don't update the cache. Fix: pin to `@tanstack/react-query@4.36.1` in T15.

---

### Risk 7 — T22 and T24 duplicate seek logic *(GAP 10.4)*
`P=0.70 × S=Medium`  
Two independent calls to `audio.currentTime = ...` fight for control. One seeks correctly;
the other reverts it 16ms later. The seek bar jitters. Fix: T22 owns player UI only,
T24 owns all seek logic. Must be caught before T22 is merged.

---

### Risk 8 — CORS circular dependency on first deploy *(GAP 7.2)*
`P=0.65 × S=High`  
Render needs the Vercel URL for CORS before Vercel is deployed. Vercel needs the Render URL
before the backend is deployed. Without the documented deploy order (Render first with `*`,
then Vercel, then update Render), the first deploy produces CORS errors on every request.

---

### Risk 9 — Seed timestamps exceed audio duration *(GAP 6.4)*
`P=0.55 × S=Medium`  
If seeded `end_time_ms` values exceed the actual MP3 duration, the seek bar calculation
produces positions > 100%. The player shows the transcript "running past the end."
The most-evaluated interactive feature looks broken. Fix: verify audio duration before T04.

---

### Risk 10 — `NEXT_PUBLIC_API_URL` baked in before first Vercel deploy *(GAP 10.3 + 7.2)*
`P=0.60 × S=Medium`  
Next.js bakes `NEXT_PUBLIC_*` vars at build time. If the Render URL isn't set before
the first Vercel deploy, every API call hits `undefined/api/v1/...`. The frontend appears
broken with no obvious error. Fix: set the env var before triggering the Vercel build.

---

## PART C — TOP 10 HIGH-ROI IMPLEMENTATION DECISIONS

Ranked by `(evaluation score impact) ÷ (implementation time in minutes)`.

---

| Rank | Decision | Time | Score Impact | Outcome |
|------|----------|------|-------------|---------|
| **1** | Add Render Disk to `render.yaml` *(GAP 7.1)* | 5 min | Critical | Prevents data loss between evaluator sessions |
| **2** | Pin `@tanstack/react-query@4.36.1` in T15 *(NB-4)* | 5 min | High | Prevents silent mutation failures across all features |
| **3** | Commit `sample-audio.mp3` in T01 *(GAP 2.4)* | 10 min | Critical | Enables the entire player-transcript sync demo |
| **4** | Set `AsyncSession` everywhere in T02 *(NB-8)* | 10 min | Critical | Prevents all API endpoints from deadlocking |
| **5** | Fix FTS5 triggers (delete/update pattern) in T03 *(NB-10)* | 15 min | High | Prevents 500 errors on search after meeting deletion |
| **6** | Add detail page three-panel CSS grid to T21 *(GAP 2.1)* | 15 min | Critical | Matches Fireflies layout on first evaluator impression |
| **7** | Add `action_items.external_id` column in T03 *(GAP 7.5)* | 15 min | High | Eliminates API inconsistency visible in `/docs` review |
| **8** | Add participants fetch to T21 parallel queries *(NB-1)* | 20 min | High | Corrects speaker colors on highest-evaluated screen |
| **9** | Add `summary_preview` to `MeetingListItem` in T07 *(GAP 2.2)* | 20 min | High | Transforms generic CRUD cards into Fireflies-style cards |
| **10** | Distribute seed dates across ranges in T04 *(GAP 6.1)* | 5 min | Medium | Makes date filters testable during demo walkthrough |

**Honorable mentions (30-45 min each, high ROI):**  
Add `findActiveSegment()` unit tests · Write `conftest.py` fixtures · Specify Render deploy
order · Add prev/next search navigation · Write "Assumptions" README section.

---

## PART D — FINAL SUBMISSION CHECKLIST

Use this phase by phase during the sprint. Every checkbox = one acceptance criterion.
Gap fix notes are marked with `▲ FIX`.

---

### T00 — transcript_parser.py *(0.5h)* — NEW: prepend to Phase 1
- [ ] `backend/app/utils/transcript_parser.py` exists and is importable
- [ ] Parses WebVTT `.vtt` format into `list[dict]` of `{speaker_name, start_time_ms, end_time_ms, text, sequence_index}`
- [ ] Tested manually with one of the five seed `.vtt` files before proceeding to T04
- [ ] `TranscriptService` is wired to call the parser (not duplicate its logic)

### T01 — Repo Init + Tooling *(0.5h)*
- [ ] `frontend/` directory: `next dev` on `:3000` without errors
- [ ] `backend/` directory: `uvicorn app.main:app --reload` on `:8000`
- [ ] `GET /api/v1/health` returns `{"status": "ok"}`
- [ ] ▲ `sample-audio.mp3` (10–15 min, royalty-free) committed to `frontend/public/` *(NB-3 / GAP 2.4)*
- [ ] ▲ `backend/.env.example` contains all four vars: `DATABASE_URL`, `FRONTEND_URL`, `OPENAI_API_KEY=`, `SECRET_KEY` *(GAP 3.1)*
- [ ] ▲ `frontend/.env.local.example` contains `NEXT_PUBLIC_API_URL=http://localhost:8000` *(GAP 3.1)*
- [ ] ▲ `frontend/.env.local` copied and `NEXT_PUBLIC_API_URL` verified in browser console *(GAP 10.3)*
- [ ] ▲ `backend/requirements.txt` committed with pinned version ranges *(NB-5)*
- [ ] Root `.gitignore` excludes `*.db`, `*.env`, `node_modules/`, `__pycache__/`, `.next/`

### T02 — Database Setup + Alembic Init *(0.5h)*
- [ ] `alembic init alembic` configured with `sqlite+aiosqlite:///./fireflies.db`
- [ ] ▲ `session.py` uses **`AsyncSession`** factory, NOT sync `Session` *(NB-8)*
- [ ] `get_db` dependency is `async def` yielding `AsyncSession`
- [ ] PRAGMAs set on startup: `foreign_keys=ON`, `journal_mode=WAL`, `synchronous=NORMAL`
- [ ] DB file created on first startup without errors

### T03 — Full Schema Migration *(1h)*
- [ ] ▲ Migration written **manually** — do NOT run `--autogenerate` *(GAP 10.2)*
- [ ] All 9 tables present: `users`, `meetings`, `participants`, `transcripts`, `transcript_segments`, `summaries`, `action_items`, `topics`, `tags` + `meeting_tags`
- [ ] ▲ `action_items` table includes `external_id TEXT NOT NULL UNIQUE` column *(GAP 7.5)*
- [ ] FTS5 virtual table: `CREATE VIRTUAL TABLE transcript_segments_fts USING fts5(text, speaker_name, content='transcript_segments', content_rowid='id', tokenize='porter ascii')`
- [ ] ▲ INSERT trigger `tseg_ai`: standard `INSERT INTO fts(rowid, ...)` ✓
- [ ] ▲ UPDATE trigger `tseg_au`: **delete-then-insert** pattern (not `UPDATE fts SET ...`) *(NB-10)*
- [ ] ▲ DELETE trigger `tseg_ad`: **`INSERT INTO fts(fts, rowid, ...) VALUES('delete', ...)`** pattern *(NB-10)*
- [ ] All FK indexes present; all `ON DELETE CASCADE` / `SET NULL` behaviors set
- [ ] CHECK constraints on all enum columns (`status`, `role`, `source`, `priority`)
- [ ] `alembic upgrade head` completes without errors
- [ ] `sqlite3 fireflies.db ".tables"` shows all 9 tables + `transcript_segments_fts`

### T04 — Seed Data — 5 Meetings *(1.5h)*
- [ ] 5 meetings seeded with distinct titles
- [ ] ▲ Speaker roster defined first; exact same strings used in both `participants.speaker_label` AND `transcript_segments.speaker_name` *(GAP 6.5 / GAP 1.4)*
- [ ] 2–5 participants per meeting
- [ ] ≥15 transcript segments per meeting with realistic timestamps
- [ ] ▲ `started_at` distributed: 2 meetings this week, 1 last week, 1 three weeks ago, 1 six weeks ago *(GAP 6.1)*
- [ ] ▲ Action item status diversity per meeting: 1 `completed`, 1 `in_progress`, 1 `pending` *(GAP 6.2)*
- [ ] ≥3 topics per meeting with `start_time_ms` values
- [ ] ▲ All `duration_seconds` values ≤ actual duration of `sample-audio.mp3` *(GAP 6.4)*
- [ ] ▲ All transcript `end_time_ms` values ≤ `meeting.duration_seconds * 1000` *(GAP 6.4)*
- [ ] All seeded meetings reference `audio_url = '/sample-audio.mp3'`
- [ ] ▲ Seed idempotency: `if db.query(User).first(): return` guard at top of seed script *(GAP 6.3)*
- [ ] `python -m app.seeds.seed` → `GET /api/v1/meetings` returns exactly 5 meetings

### T05 — CORS + Settings *(0.5h)*
- [ ] `pydantic-settings` BaseSettings with all required fields
- [ ] `CORSMiddleware` configured with explicit `FRONTEND_URL` origin (not `*` permanently)
- [ ] Frontend on `:3000` can fetch from `:8000` without CORS errors in browser console
- [ ] Missing env vars produce clear error messages at startup (not silent defaults)

### T06 — SQLAlchemy ORM Models *(1h)*
- [ ] One file per model in `backend/app/models/`
- [ ] ▲ All models use SQLAlchemy 2.x `Mapped[T]` annotations *(NB-8 consistency)*
- [ ] `Meeting.transcript`, `Meeting.action_items`, `Meeting.participants` relationships defined
- [ ] `alembic check` confirms models match schema (no drift)
- [ ] `models/__init__.py` exports all models

### T07 — Pydantic Schemas *(0.75h)*
- [ ] `MeetingCreate`, `MeetingUpdate`, `MeetingDetail`, `MeetingListItem` defined
- [ ] ▲ `MeetingListItem` includes `summary_preview: list[str] | None` (first 2 key_points) *(GAP 2.2)*
- [ ] ▲ `ActionItemResponse` includes `external_id: str` field *(GAP 7.5)*
- [ ] `PaginatedResponse[T]` generic schema defined
- [ ] All responses use `external_id` not `id`; `model_config = ConfigDict(from_attributes=True)`
- [ ] `from app.schemas import MeetingCreate` imports without errors

### T08 — Repository Layer *(0.75h)*
- [ ] ▲ `BaseRepository` methods are ALL `async def` with `db: AsyncSession` parameter *(NB-8)*
- [ ] `MeetingRepository.list()` joins participants and supports `q`, `date_from`, `date_to`, `sort_by`, `page`, `page_size`
- [ ] ▲ `MeetingRepository.list()` does LEFT JOIN to `summaries` and returns `summary_preview` *(GAP 2.2)*
- [ ] `TranscriptRepository.fts_search()` uses `MATCH` with `snippet()` returning `<mark>` tags
- [ ] Unit test: `MeetingRepository.list(q="roadmap")` returns correct subset
- [ ] `bulk_insert_segments` inserts 30 segments in under 1s
- [ ] ▲ `conftest.py` written with `AsyncSession` fixtures, `pytest-asyncio` configured *(NB-6)*

### T09 — Service Layer *(0.5h)*
- [ ] `MeetingService`, `TranscriptService`, `SummaryService` exist with no business logic in route handlers
- [ ] `SummaryService.generate()` calls LLM if API key set; returns seeded summary if not
- [ ] ▲ `llm_client.py` stub created HERE (not in T29) with `model`, `max_tokens`, `temperature` specified *(NB-9)*
- [ ] LLM fallback confirmed working with no API key in `.env`

### T10 — Meetings CRUD Endpoints *(1h)*
- [ ] All 6 endpoints: `GET /api/v1/meetings`, `POST`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}`, `GET /{id}/participants`
- [ ] All `{id}` params accept `external_id` (UUID string); return 404 on not found
- [ ] DELETE cascades: transcript + segments + summary + action_items all gone
- [ ] All endpoints tested via Swagger UI at `/docs`
- [ ] Responses use consistent `{"detail": str, "code": str}` error shape

### T11 — Transcript Endpoints *(0.5h)*
- [ ] `GET /api/v1/meetings/{id}/transcript` returns segments ordered by `sequence_index`
- [ ] Response includes `start_time_ms`, `end_time_ms`, `speaker_name`, `text`, `sequence_index`
- [ ] Response time < 200ms for 30 segments
- [ ] `POST /api/v1/meetings/{id}/transcript` accepts multipart file OR JSON `{raw_text}`

### T12 — Summary + Action Item Endpoints *(0.75h)*
- [ ] `GET/POST /api/v1/meetings/{id}/summary` + `POST /summary/generate`
- [ ] Full action item CRUD: `GET`, `POST`, `PATCH /{item_id}`, `DELETE /{item_id}`
- [ ] ▲ All action item routes use `external_id` in URLs, not internal `id` *(GAP 7.5)*
- [ ] `PATCH` with `{"status":"completed"}` returns updated record
- [ ] `GET /api/v1/meetings/{id}/topics` returns list with `start_time_ms`

### T13 — FTS5 Transcript Search *(0.5h)*
- [ ] `GET /transcript/search?q=latency` uses `MATCH` not `LIKE`
- [ ] Response snippet contains `<mark>latency</mark>` HTML
- [ ] ▲ Snippet generated from server-side HTML-escaped text before `<mark>` injection *(NB-7)*
- [ ] Query "latency" returns segments containing "latencies" (Porter stemming)
- [ ] ▲ Integration test: insert segment → FTS populated → `MATCH` query returns it *(GAP 9.2)*

### T14 — Dashboard Search + Health *(0.25h)*
- [ ] `GET /api/v1/meetings?q=` filters on title + participant name
- [ ] `GET /api/v1/health` checks DB connectivity
- [ ] Date range params `date_from`/`date_to` filter correctly

### T15 — Next.js Setup + Tailwind + Design Tokens *(0.5h)*
- [ ] Tailwind config includes full `ff.*` color token set from Part 10
- [ ] Inter font loaded via `next/font/google`
- [ ] `globals.css` contains all CSS custom properties
- [ ] `className="bg-ff-bg-base text-ff-text-primary"` renders correctly
- [ ] ▲ `@tanstack/react-query@4.36.1` pinned in `package.json` *(NB-4)*
- [ ] `tsconfig.json` has `"strict": true`

### T16 — App Layout — Sidebar + Topbar *(0.75h)*
- [ ] Sidebar: 178px wide, dark `--ff-bg-sidebar`, nav items with active state
- [ ] ▲ `SidebarNavItem` active check: `pathname === href || pathname.startsWith(href + '/')` *(GAP 5.4)*
- [ ] ▲ Topbar on `/meetings`: shows `<MeetingSearch />` in the topbar *(GAP 5.1)*
- [ ] ▲ Topbar on `/meetings/[id]`: shows meeting title (truncated) + date badge + Share/Export buttons *(GAP 5.1)*
- [ ] Dashboard group layout `(dashboard)/layout.tsx` applies to all routes correctly
- [ ] Sidebar renders with correct dimensions and colors matching Part 10 spec

### T17 — API Client + TanStack Query + Zustand *(0.75h)*
- [ ] `lib/api/client.ts`: Axios instance with `NEXT_PUBLIC_API_URL` base URL
- [ ] Interceptors handle 404→redirect and error→toast
- [ ] `stores/playerStore.ts`: `{currentTimeMs, isPlaying, duration, activeSegmentId, set*}` types strict
- [ ] `stores/uiStore.ts`: toast queue, active tab, transcript search query
- [ ] `QueryClientProvider` wraps root layout
- [ ] Zustand devtools accessible in browser
- [ ] `useMeetings()` hook returns typed `MeetingListItem[]`

### T18 — MeetingCard Component *(0.5h)*
- [ ] Title, date, duration badge, participant avatar stack (max 3 + overflow)
- [ ] ▲ Bullet previews render from `summary_preview` field (2 lines max) *(GAP 2.2)*
- [ ] Speaker avatar colors use `getSpeakerColor(participantIndex)`
- [ ] Hover state: `bg #1E2040`, `border #2E3060`, `transition 0.15s`
- [ ] Clicking card navigates to `/meetings/${meeting.external_id}`
- [ ] Renders pixel-accurately against Part 10 `MeetingCard` spec

### T19 — Meetings Library Page *(1h)*
- [ ] SSR initial load via `prefetchQuery`
- [ ] Topbar search input (debounced 300ms, updates `?q=` URL param)
- [ ] ▲ Filter chip replaces "Shared with me" with participant name search (`?participant=`) *(GAP 1.3)*
- [ ] Date filters: All / This week / This month work with distributed seed data
- [ ] Sort selector (recency, alphabetical)
- [ ] Empty state: "No meetings yet. Add your first one."
- [ ] URL updates on filter change without page reload
- [ ] Pagination visible if > 20 meetings

### T20 — Create / Edit / Delete Modals *(0.5h)*
- [ ] `<CreateMeetingModal>`: title, date, duration, participants input
- [ ] ▲ `<CreateMeetingModal>` includes textarea (paste) + file input (upload) for transcript *(GAP 1.1)*
- [ ] ▲ On successful creation, `router.push('/meetings/' + response.external_id)` *(NB-2)*
- [ ] If transcript provided, calls `POST /transcript` immediately after meeting creation
- [ ] `<EditMeetingModal>`: pre-fills from meeting data; PATCH on submit
- [ ] Delete: confirmation dialog; optimistic removal from list; "Meeting deleted" toast
- [ ] All mutations use `onSuccess`/`onError` at the call-site (v4 pattern)

### T21 — Meeting Detail Page *(0.5h)*
- [ ] ▲ Four parallel TanStack Query fetches on page load: transcript, summary, action-items, **participants** *(NB-1)*
- [ ] ▲ Detail page CSS layout: `<PlayerBar>` full-width (42px) at top; CSS grid `grid-cols-[55fr_45fr]` below *(GAP 2.1)*
- [ ] Left column: `<TranscriptPanel>` with internal scroll; right column: `<SummaryPanel>` with tabs
- [ ] ▲ Header includes `← Back to Meetings` link in `--ff-text-dim` *(GAP 5.2)*
- [ ] Loading skeletons visible during initial fetch (all 4 queries)
- [ ] Suspense error boundaries on each panel

### T22 — MediaPlayer Component *(0.75h)*
- [ ] `<audio>` element hidden; `src` set to `/sample-audio.mp3` (NOT a blob URL)
- [ ] Play/pause button (Zustand toggle), seek bar (custom div, not `<input type=range>`), time display
- [ ] Speed selector: 0.75×, 1×, 1.25×, 1.5×, 2× (sets `audio.playbackRate`)
- [ ] ▲ T22 does NOT implement segment-click seeking — that belongs entirely to T24 *(GAP 10.4)*
- [ ] Clicking play increments time display in real time
- [ ] Seek bar drag updates `audio.currentTime`
- [ ] Matches Part 10 `MediaPlayer` spec (colors, dimensions)

### T23 — TranscriptPanel + TranscriptSegment *(1h)*
- [ ] `TranscriptPanel`: scrollable container, correct layout dimensions
- [ ] `TranscriptSegment`: `isActive` → `bg-ff-bg-highlight` + bold speaker name
- [ ] ▲ `useSpeakerColorMap(participants)` hook built; returns `Map<speaker_name, color_index>` *(GAP 1.4 / NB-1)*
- [ ] Speaker chips colored deterministically via color map
- [ ] Timestamp `<button>` calls `onSeek(start_time_ms)` (passed from T24)
- [ ] `React.memo` on `TranscriptSegment` prevents full list re-render at 4Hz
- [ ] ▲ On mount, if `activeSegmentId === null` and segments exist, highlight `segments[0]` *(GAP 2.3)*
- [ ] ▲ If `segments.length === 0`, render `<EmptyState>` with transcript upload CTA *(GAP 4.2)*

### T24 — Bidirectional Player-Transcript Sync *(1.5h)*
- [ ] `usePlayer.ts` wires `<audio>` element to Zustand `playerStore`
- [ ] `timeupdate` handler binary-searches segments for active segment
- [ ] ▲ `useEffect` returns cleanup: `return () => audio.removeEventListener('timeupdate', handler)` *(NB-3)*
- [ ] `activeSegmentId` Zustand update triggers `scrollIntoView({behavior: 'smooth', block: 'center'})`
- [ ] Transcript→Player: clicking timestamp calls `audio.currentTime = ms / 1000` seek bar updates
- [ ] ▲ "→ Now playing" pill button appears via `IntersectionObserver` when active segment is off-screen *(GAP 4.1)*
- [ ] ▲ `findActiveSegment()` unit tests: empty array, before first, after last, on boundary, mid-segment *(GAP 9.1)*
- [ ] No visible jank at 4Hz timeupdate on 30-segment list

### T25 — SummaryPanel + ActionItemList + TopicList *(0.75h)*
- [ ] Overview tab: summary text in `--ff-text-secondary`
- [ ] `<ActionItemList>`: checkbox, strikethrough for completed, assignee+due meta
- [ ] Checkbox click → `PATCH /action-items/{external_id}` + optimistic update *(uses external_id)*
- [ ] `<TopicList>`: chips with title + timestamp; clicking seeks player
- [ ] "+ Add action item" inline form → `POST /action-items`
- [ ] "Generate AI summary" button → `POST /summary/generate` + spinner + toast

### T26 — Loading Skeletons *(0.5h)*
- [ ] `<MeetingCardSkeleton>` matches MeetingCard layout with `animate-pulse`
- [ ] `<TranscriptSkeleton>`: 6 alternating-width fake segments
- [ ] `<SummarySkeleton>`: paragraph block + 3 action item rows
- [ ] First paint of both pages shows skeletons (no blank flash)
- [ ] Skeletons use `--ff-bg-surface` fill color

### T27 — Toast Notifications *(0.5h)*
- [ ] `Toast.tsx` + Zustand `uiStore.addToast(msg, type)` implemented
- [ ] Top-right, stacks vertically, auto-dismisses after 3s
- [ ] Colors: success `#2DD6A4`, error `#EF4444`, info `#A080FA`
- [ ] Fires on: meeting create/delete, action item toggle, summary generate, API errors
- [ ] Multiple toasts stack without overlapping

### T28 — In-Transcript Search with Highlights *(0.75h)*
- [ ] `TranscriptSearch`: input debounced 500ms → `GET /transcript/search?q=`
- [ ] Matching segments scroll into view; text highlighted via `<mark>` tags
- [ ] ▲ Renders via `dangerouslySetInnerHTML` only after server-side HTML-escaping is confirmed *(NB-7)*
- [ ] Clicking a result seeks player to `start_time_ms`
- [ ] ▲ Prev/next navigation buttons with `currentResultIndex` state and result count display *(GAP 1.5)*
- [ ] Clear button resets search and removes all highlights

### T29 — LLM Summary Generation *(0.75h)*
- [ ] `llm_client.py` already stubbed in T09; complete it here
- [ ] ▲ Model specified as `gpt-3.5-turbo-0125` or `claude-haiku-4-5`; `max_tokens=800`, `temperature=0.3` *(NB-9)*
- [ ] Prompt instructs JSON output: `{overview, action_items[], topics[]}`
- [ ] Graceful fallback: if LLM errors → return seeded summary + `LLM_UNAVAILABLE` toast
- [ ] With API key: generates real summary in < 8 seconds ✓
- [ ] Without API key: returns seeded summary; frontend shows degraded toast ✓

### T30 — Backend Deployment (Render) *(0.5h)*
- [ ] ▲ `render.yaml` includes `disk: {name: fireflies-data, mountPath: /var/data, sizeGB: 1}` *(GAP 7.1)*
- [ ] ▲ `DATABASE_URL` updated to `sqlite+aiosqlite:////var/data/fireflies.db` *(GAP 7.1)*
- [ ] ▲ `healthCheckPath: /api/v1/health` added to service definition *(GAP 7.4)*
- [ ] ▲ First deploy: set `FRONTEND_URL=*` temporarily; get Render URL before Vercel deploy *(GAP 7.2)*
- [ ] `GET https://{render-url}/api/v1/health` returns 200
- [ ] `GET /api/v1/meetings` returns 5 seeded meetings

### T31 — Frontend Deployment (Vercel) *(0.5h)*
- [ ] `NEXT_PUBLIC_API_URL` set to Render URL before triggering build
- [ ] ▲ After Vercel deploys: update Render `FRONTEND_URL` to Vercel URL and redeploy *(GAP 7.2)*
- [ ] ▲ "Connecting to server..." overlay shown when first API call takes > 3s *(GAP 7.3)*
- [ ] Production URL opens Meetings Library without console errors
- [ ] Meeting detail loads transcript from Render backend correctly
- [ ] CORS test: open browser console on Vercel URL, verify no CORS errors

### T32 — README *(1h)*
- [ ] Sections: Project Overview, Live Demo (both links), Architecture, Tech Stack, Local Setup, Env Vars, API Overview, Database Schema, Design Decisions, Seed Data
- [ ] ▲ Mermaid ER diagram embedded as code block (relations between all 9 tables) *(GAP 8.1)*
- [ ] ▲ Mermaid architecture diagram: Browser → Vercel → Render → SQLite → LLM *(GAP 8.1)*
- [ ] ▲ Diagrams placed directly in README.md (not in `docs/` folder) *(GAP 3.3)*
- [ ] ▲ "Assumptions" section: no auth, no real audio, shared MP3, optional LLM key *(GAP 8.2)*
- [ ] ▲ Exact setup commands as numbered bash snippet (copy-paste ready) *(GAP 8.3)*
- [ ] API endpoint table lists all routes with method, path, description
- [ ] Fresh clone `npm install` + `pip install` + seed + servers runs end-to-end
- [ ] No broken images or links; GitHub Mermaid renders on first load

### T33 — GitHub Actions CI *(1h, bonus)*
- [ ] `.github/workflows/ci.yml` runs `pytest backend/tests/` on push
- [ ] `tsc --noEmit` runs on frontend on push
- [ ] CI badge added to root README.md
- [ ] `test_action_items.py` added: create → PATCH completed → verify → DELETE → verify 404 *(GAP 9.3)*
- [ ] `TranscriptSegment.test.tsx`: render with `isActive=true`, verify `bg-ff-bg-highlight` class *(GAP 9.4)*

---

### Pre-Submission Final QA Pass

- [ ] Open deployed URL in incognito — library loads with 5 meetings
- [ ] Click meeting → detail page opens with player, transcript, summary panels
- [ ] Click transcript timestamp → player seek bar moves ✓
- [ ] Click play → transcript scrolls and highlights active segment ✓
- [ ] Check off an action item → strikethrough appears instantly ✓
- [ ] Search "budget" in transcript → highlights appear; prev/next navigation works ✓
- [ ] Delete a meeting → transcript search on remaining meetings returns no 500 errors ✓
- [ ] Date filter "This week" → shows 2 meetings; "This month" → shows 3 meetings ✓
- [ ] Create a new meeting with pasted transcript → redirects to detail page ✓
- [ ] Close browser, wait 2 min, reopen → all data still present ✓
- [ ] Clone repo on a fresh machine, follow README → app runs in < 5 minutes ✓
- [ ] README Mermaid diagrams render on GitHub ✓
- [ ] CI badge shows green ✓

---

*Total gaps identified: 42 (32 pre-existing + 10 new)*  
*Critical blockers: 7 · High: 22 · Medium: 15 · Low: 4*  
*Estimated fix time for all Critical + High gaps: ~5h additional across the 25h sprint*  
*All fixes are additive patches — no architecture changes.*

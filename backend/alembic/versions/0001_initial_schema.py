"""Initial schema: all 9 tables + FTS5 virtual table + sync triggers + indexes.

Revision ID: 0001
Revises:
Create Date: 2026-06-25

NOTE: Do NOT use --autogenerate for this migration.
FTS5 virtual tables and triggers are not detected by Alembic autogenerate.
All DDL here is written manually with op.execute().
"""

from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── PRAGMAs ──────────────────────────────────────────────────────────────
    op.execute("PRAGMA foreign_keys = ON")
    op.execute("PRAGMA journal_mode = WAL")

    # ── USERS ────────────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER  PRIMARY KEY AUTOINCREMENT,
            external_id TEXT     NOT NULL UNIQUE,
            email       TEXT     NOT NULL UNIQUE,
            name        TEXT     NOT NULL,
            avatar_url  TEXT,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ── MEETINGS ─────────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS meetings (
            id               INTEGER  PRIMARY KEY AUTOINCREMENT,
            external_id      TEXT     NOT NULL UNIQUE,
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
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_meetings_host       ON meetings(host_user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_meetings_started_at ON meetings(started_at DESC)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_meetings_status     ON meetings(status)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at DESC)")

    # ── PARTICIPANTS ──────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS participants (
            id            INTEGER  PRIMARY KEY AUTOINCREMENT,
            meeting_id    INTEGER  NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
            user_id       INTEGER  REFERENCES users(id) ON DELETE SET NULL,
            name          TEXT     NOT NULL,
            email         TEXT,
            role          TEXT     NOT NULL DEFAULT 'attendee'
                                   CHECK (role IN ('host','attendee')),
            speaker_label TEXT,
            created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_participants_meeting ON participants(meeting_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_participants_email   ON participants(email)")

    # ── TRANSCRIPTS ───────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS transcripts (
            id          INTEGER  PRIMARY KEY AUTOINCREMENT,
            meeting_id  INTEGER  NOT NULL UNIQUE REFERENCES meetings(id) ON DELETE CASCADE,
            raw_text    TEXT,
            source      TEXT     NOT NULL DEFAULT 'seeded'
                                 CHECK (source IN ('seeded','uploaded','generated')),
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ── TRANSCRIPT_SEGMENTS ───────────────────────────────────────────────────
    op.execute("""
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
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_tseg_transcript ON transcript_segments(transcript_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_tseg_sequence   ON transcript_segments(transcript_id, sequence_index)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_tseg_time       ON transcript_segments(transcript_id, start_time_ms)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_tseg_speaker    ON transcript_segments(speaker_id)")

    # ── FTS5 VIRTUAL TABLE (external content, porter stemming) ───────────────
    op.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS transcript_segments_fts USING fts5(
            text,
            speaker_name,
            content='transcript_segments',
            content_rowid='id',
            tokenize='porter ascii'
        )
    """)

    # ── FTS5 SYNC TRIGGERS ────────────────────────────────────────────────────
    # INSERT: standard insert into FTS
    op.execute("""
        CREATE TRIGGER IF NOT EXISTS tseg_ai AFTER INSERT ON transcript_segments BEGIN
            INSERT INTO transcript_segments_fts(rowid, text, speaker_name)
            VALUES (new.id, new.text, new.speaker_name);
        END
    """)

    # UPDATE: external-content pattern requires delete-then-insert
    op.execute("""
        CREATE TRIGGER IF NOT EXISTS tseg_au AFTER UPDATE ON transcript_segments BEGIN
            INSERT INTO transcript_segments_fts(transcript_segments_fts, rowid, text, speaker_name)
            VALUES ('delete', old.id, old.text, old.speaker_name);
            INSERT INTO transcript_segments_fts(rowid, text, speaker_name)
            VALUES (new.id, new.text, new.speaker_name);
        END
    """)

    # DELETE: external-content requires the special 'delete' command row
    op.execute("""
        CREATE TRIGGER IF NOT EXISTS tseg_ad AFTER DELETE ON transcript_segments BEGIN
            INSERT INTO transcript_segments_fts(transcript_segments_fts, rowid, text, speaker_name)
            VALUES ('delete', old.id, old.text, old.speaker_name);
        END
    """)

    # ── SUMMARIES ─────────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS summaries (
            id            INTEGER  PRIMARY KEY AUTOINCREMENT,
            meeting_id    INTEGER  NOT NULL UNIQUE REFERENCES meetings(id) ON DELETE CASCADE,
            overview      TEXT,
            key_points    TEXT,
            next_steps    TEXT,
            generated_by  TEXT     NOT NULL DEFAULT 'seeded'
                                   CHECK (generated_by IN ('seeded','llm','manual')),
            generated_at  DATETIME,
            created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ── ACTION_ITEMS ──────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS action_items (
            id             INTEGER  PRIMARY KEY AUTOINCREMENT,
            external_id    TEXT     NOT NULL UNIQUE,
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
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_action_meeting  ON action_items(meeting_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_action_status   ON action_items(meeting_id, status)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_action_assignee ON action_items(assignee_id)")

    # ── TOPICS ────────────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS topics (
            id             INTEGER  PRIMARY KEY AUTOINCREMENT,
            meeting_id     INTEGER  NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
            title          TEXT     NOT NULL,
            start_time_ms  INTEGER  CHECK (start_time_ms >= 0),
            end_time_ms    INTEGER,
            sequence_index INTEGER  NOT NULL,
            created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS idx_topics_meeting  ON topics(meeting_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_topics_sequence ON topics(meeting_id, sequence_index)")

    # ── TAGS ──────────────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS tags (
            id         INTEGER  PRIMARY KEY AUTOINCREMENT,
            name       TEXT     NOT NULL UNIQUE COLLATE NOCASE,
            color      TEXT     NOT NULL DEFAULT '#6366F1',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ── MEETING_TAGS ──────────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS meeting_tags (
            meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
            tag_id     INTEGER NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
            PRIMARY KEY (meeting_id, tag_id)
        )
    """)


def downgrade() -> None:
    # Drop in reverse FK dependency order
    op.execute("DROP TABLE IF EXISTS meeting_tags")
    op.execute("DROP TABLE IF EXISTS tags")
    op.execute("DROP TABLE IF EXISTS topics")
    op.execute("DROP TABLE IF EXISTS action_items")
    op.execute("DROP TABLE IF EXISTS summaries")
    op.execute("DROP TRIGGER IF EXISTS tseg_ad")
    op.execute("DROP TRIGGER IF EXISTS tseg_au")
    op.execute("DROP TRIGGER IF EXISTS tseg_ai")
    op.execute("DROP TABLE IF EXISTS transcript_segments_fts")
    op.execute("DROP TABLE IF EXISTS transcript_segments")
    op.execute("DROP TABLE IF EXISTS transcripts")
    op.execute("DROP TABLE IF EXISTS participants")
    op.execute("DROP TABLE IF EXISTS meetings")
    op.execute("DROP TABLE IF EXISTS users")

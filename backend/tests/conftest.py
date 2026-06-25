"""
Async test fixtures for the Fireflies Clone backend.

Uses in-memory SQLite so tests are isolated and fast.
Requires pytest-asyncio >= 0.23 with asyncio_mode = 'auto' (see pytest.ini).
"""
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.sql import text

from app.db.base import Base

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

_FTS5_STATEMENTS = [
    """
    CREATE VIRTUAL TABLE IF NOT EXISTS transcript_segments_fts USING fts5(
        text,
        speaker_name,
        content='transcript_segments',
        content_rowid='id',
        tokenize='porter ascii'
    )
    """,
    """
    CREATE TRIGGER IF NOT EXISTS tseg_ai AFTER INSERT ON transcript_segments BEGIN
        INSERT INTO transcript_segments_fts(rowid, text, speaker_name)
        VALUES (new.id, new.text, new.speaker_name);
    END
    """,
    """
    CREATE TRIGGER IF NOT EXISTS tseg_au AFTER UPDATE ON transcript_segments BEGIN
        INSERT INTO transcript_segments_fts(transcript_segments_fts, rowid, text, speaker_name)
        VALUES ('delete', old.id, old.text, old.speaker_name);
        INSERT INTO transcript_segments_fts(rowid, text, speaker_name)
        VALUES (new.id, new.text, new.speaker_name);
    END
    """,
    """
    CREATE TRIGGER IF NOT EXISTS tseg_ad AFTER DELETE ON transcript_segments BEGIN
        INSERT INTO transcript_segments_fts(transcript_segments_fts, rowid, text, speaker_name)
        VALUES ('delete', old.id, old.text, old.speaker_name);
    END
    """,
]


@pytest_asyncio.fixture
async def db() -> AsyncSession:
    """Per-test async database session with a fresh in-memory schema."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        for stmt in _FTS5_STATEMENTS:
            await conn.execute(text(stmt.strip()))

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()

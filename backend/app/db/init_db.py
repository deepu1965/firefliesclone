import logging

from sqlalchemy import text

from app.db.session import async_session_factory, engine

logger = logging.getLogger("fireflies")


async def _set_pragmas(session) -> None:
    """Apply SQLite pragmas for FK enforcement, WAL mode, and safer writes."""
    pragmas = [
        "PRAGMA foreign_keys = ON",
        "PRAGMA journal_mode = WAL",
        "PRAGMA synchronous = NORMAL",
    ]
    for pragma in pragmas:
        await session.execute(text(pragma))


async def init_db() -> None:
    """Run on startup: apply pragmas. Schema is managed by Alembic."""
    try:
        async with async_session_factory() as session:
            await _set_pragmas(session)
            await session.commit()
        logger.info("Database initialized (pragmas applied)")
    except Exception:
        logger.exception("Failed to initialize database")
        raise

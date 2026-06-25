import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.exceptions import ConflictError, NotFoundError, TranscriptParseError
from app.core.logging import RequestLoggingMiddleware, configure_logging
from app.db.init_db import init_db
from app.db.session import async_session_factory

logger = logging.getLogger("fireflies")


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    await init_db()
    yield


app = FastAPI(
    title="Fireflies Clone API",
    version="1.0.0",
    lifespan=lifespan,
)

_cors_origins = list(settings.CORS_ORIGINS)
if settings.FRONTEND_URL not in _cors_origins:
    _cors_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestLoggingMiddleware)

app.include_router(v1_router, prefix="/api/v1")


# ── Global exception handlers ───────────────────────────────────────────────

@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError):
    return JSONResponse(status_code=404, content={"detail": str(exc), "code": "NOT_FOUND"})


@app.exception_handler(ConflictError)
async def conflict_handler(request: Request, exc: ConflictError):
    return JSONResponse(status_code=409, content={"detail": str(exc), "code": "CONFLICT"})


@app.exception_handler(TranscriptParseError)
async def parse_error_handler(request: Request, exc: TranscriptParseError):
    return JSONResponse(status_code=422, content={"detail": str(exc), "code": "PARSE_ERROR"})


@app.exception_handler(Exception)
async def unhandled_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "code": "INTERNAL_ERROR"},
    )


# ── Health ──────────────────────────────────────────────────────────────────

@app.get("/api/v1/health")
async def health():
    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "error"
    return {"status": "ok", "db": db_status}

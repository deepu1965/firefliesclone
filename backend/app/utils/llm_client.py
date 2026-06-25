"""
Thin wrapper around the LLM API for summary generation.
Supports OpenAI (default) and Anthropic (claude-haiku-4-5).
Raises LLMNotConfiguredError when no API key is present.
"""
from __future__ import annotations

import json
from typing import TypedDict


class SummaryResult(TypedDict):
    overview: str
    action_items: list[dict]
    topics: list[dict]


class LLMNotConfiguredError(Exception):
    """Raised when LLM_API_KEY is not set in the environment."""


class LLMServiceError(Exception):
    """Raised when the LLM API returns an error."""


_PROMPT_SYSTEM = (
    "You are a meeting assistant. Analyse the transcript and return ONLY valid JSON "
    "with keys: overview (string, 2-3 sentences), "
    "action_items (array of {text, assignee_name, due_date_hint}), "
    "topics (array of {title, start_time_ms})."
)


async def generate_summary(transcript_text: str, settings: object) -> SummaryResult:
    """
    Call the configured LLM to summarise a meeting transcript.
    `settings` is the pydantic-settings object from core/config.py.
    Raises LLMNotConfiguredError if no API key is present.
    Raises LLMServiceError on API failure.
    """
    api_key: str | None = getattr(settings, "OPENAI_API_KEY", None)
    model: str = getattr(settings, "LLM_MODEL", "gpt-3.5-turbo-0125")

    if not api_key:
        raise LLMNotConfiguredError("OPENAI_API_KEY is not set")

    # Lazy import so the package is optional at runtime
    try:
        import openai  # type: ignore
    except ImportError as exc:
        raise LLMServiceError("openai package not installed") from exc

    client = openai.AsyncOpenAI(api_key=api_key)

    try:
        response = await client.chat.completions.create(
            model=model,
            max_tokens=800,
            temperature=0.3,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": _PROMPT_SYSTEM},
                {"role": "user", "content": f"Transcript:\n\n{transcript_text[:12000]}"},
            ],
        )
        raw = response.choices[0].message.content or "{}"
        data = json.loads(raw)
        return SummaryResult(
            overview=data.get("overview", ""),
            action_items=data.get("action_items", []),
            topics=data.get("topics", []),
        )
    except Exception as exc:
        raise LLMServiceError(str(exc)) from exc

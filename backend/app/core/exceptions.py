class NotFoundError(Exception):
    """Resource not found."""


class ConflictError(Exception):
    """Duplicate or conflicting resource."""


class TranscriptParseError(Exception):
    """Failed to parse a transcript file."""


class LLMServiceError(Exception):
    """LLM API call failed (non-fatal, has fallback)."""


class LLMNotConfiguredError(LLMServiceError):
    """LLM API key is absent."""

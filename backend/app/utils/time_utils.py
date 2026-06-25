"""Formatting helpers for durations and timestamps."""


def ms_to_mmss(ms: int) -> str:
    """Convert milliseconds to MM:SS string."""
    total_s = ms // 1000
    m, s = divmod(total_s, 60)
    return f"{m:02d}:{s:02d}"


def seconds_to_display(seconds: int) -> str:
    """Return '45 min' for < 1 hr, '1h 12m' for >= 1 hr."""
    if seconds < 3600:
        return f"{seconds // 60} min"
    h, remainder = divmod(seconds, 3600)
    m = remainder // 60
    return f"{h}h {m}m" if m else f"{h}h"

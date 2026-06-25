"""
Parses .vtt (WebVTT) transcript files into a list of segment dicts.

Supported formats:
  - WebVTT (.vtt): WEBVTT header, cue blocks with optional speaker labels
  - Plain text (.txt): each line treated as a segment
  - JSON (.json): list of {speaker_name, start_time_ms, end_time_ms, text}
"""
import json
import re
from typing import TypedDict


class SegmentDict(TypedDict):
    speaker_name: str
    start_time_ms: int
    end_time_ms: int
    text: str
    sequence_index: int


# ──────────────────────────────────────────────
# Timestamp helpers
# ──────────────────────────────────────────────

_TIMESTAMP_RE = re.compile(
    r"(\d{1,2}):(\d{2}):(\d{2})[.,](\d{3})"  # HH:MM:SS.mmm or HH:MM:SS,mmm
    r"|(\d{1,2}):(\d{2})[.,](\d{3})"          # MM:SS.mmm
)


def _ts_to_ms(ts: str) -> int:
    m = _TIMESTAMP_RE.match(ts.strip())
    if not m:
        raise ValueError(f"Cannot parse timestamp: {ts!r}")
    if m.group(1) is not None:
        h, mn, s, ms = int(m.group(1)), int(m.group(2)), int(m.group(3)), int(m.group(4))
    else:
        h, mn, s, ms = 0, int(m.group(5)), int(m.group(6)), int(m.group(7))
    return (h * 3600 + mn * 60 + s) * 1000 + ms


# ──────────────────────────────────────────────
# VTT parser
# ──────────────────────────────────────────────

_CUE_TIMING_RE = re.compile(r"(\S+)\s+-->\s+(\S+)")
_SPEAKER_RE = re.compile(r"^<v\s+([^>]+)>(.*)$", re.DOTALL)


def _parse_vtt(content: str) -> list[SegmentDict]:
    segments: list[SegmentDict] = []
    seq = 0

    lines = content.splitlines()
    i = 0

    # Skip WEBVTT header line
    if lines and lines[0].startswith("WEBVTT"):
        i = 1

    while i < len(lines):
        line = lines[i].strip()

        # Skip blank lines and NOTE / STYLE / REGION blocks
        if not line or line.startswith("NOTE") or line.startswith("STYLE") or line.startswith("REGION"):
            i += 1
            continue

        # Check if this line is a cue identifier (optional) or a timing line
        timing_match = _CUE_TIMING_RE.match(line)
        if not timing_match:
            # Might be a cue ID — peek ahead
            if i + 1 < len(lines):
                timing_match = _CUE_TIMING_RE.match(lines[i + 1].strip())
                if timing_match:
                    i += 1  # skip cue ID line
                else:
                    i += 1
                    continue
            else:
                i += 1
                continue

        start_ms = _ts_to_ms(timing_match.group(1))
        end_ms = _ts_to_ms(timing_match.group(2))
        i += 1

        # Collect payload lines until next blank line
        payload_lines: list[str] = []
        while i < len(lines) and lines[i].strip():
            payload_lines.append(lines[i].strip())
            i += 1

        if not payload_lines:
            continue

        payload = " ".join(payload_lines)

        # Detect <v Speaker> tag
        sm = _SPEAKER_RE.match(payload)
        if sm:
            speaker_name = sm.group(1).strip()
            text = sm.group(2).strip()
        else:
            # Try "Speaker Name: text" pattern
            colon_idx = payload.find(":")
            if 0 < colon_idx < 40:
                speaker_name = payload[:colon_idx].strip()
                text = payload[colon_idx + 1:].strip()
            else:
                speaker_name = "Speaker 1"
                text = payload

        # Strip any remaining VTT tags like <00:01:02.000> or <c>
        text = re.sub(r"<[^>]+>", "", text).strip()

        if not text:
            continue

        # Guard: end_ms must be > start_ms
        if end_ms <= start_ms:
            end_ms = start_ms + 1000

        segments.append(
            SegmentDict(
                speaker_name=speaker_name,
                start_time_ms=start_ms,
                end_time_ms=end_ms,
                text=text,
                sequence_index=seq,
            )
        )
        seq += 1

    return segments


# ──────────────────────────────────────────────
# Plain text parser
# ──────────────────────────────────────────────

def _parse_txt(content: str) -> list[SegmentDict]:
    segments: list[SegmentDict] = []
    seq = 0
    chunk_ms = 30_000  # 30 s per line

    for line in content.splitlines():
        line = line.strip()
        if not line:
            continue
        start_ms = seq * chunk_ms
        end_ms = start_ms + chunk_ms
        segments.append(
            SegmentDict(
                speaker_name="Speaker 1",
                start_time_ms=start_ms,
                end_time_ms=end_ms,
                text=line,
                sequence_index=seq,
            )
        )
        seq += 1
    return segments


# ──────────────────────────────────────────────
# JSON parser
# ──────────────────────────────────────────────

def _parse_json(content: str) -> list[SegmentDict]:
    data = json.loads(content)
    if not isinstance(data, list):
        raise ValueError("JSON transcript must be a top-level array")
    segments: list[SegmentDict] = []
    for idx, item in enumerate(data):
        start_ms = int(item["start_time_ms"])
        end_ms = int(item["end_time_ms"])
        if end_ms <= start_ms:
            end_ms = start_ms + 1000
        segments.append(
            SegmentDict(
                speaker_name=str(item.get("speaker_name", "Speaker 1")),
                start_time_ms=start_ms,
                end_time_ms=end_ms,
                text=str(item["text"]),
                sequence_index=idx,
            )
        )
    return segments


# ──────────────────────────────────────────────
# Public entry point
# ──────────────────────────────────────────────

def parse_transcript(content: str, fmt: str = "vtt") -> list[SegmentDict]:
    """
    Parse raw transcript text into a list of SegmentDict.

    Args:
        content: Raw file content as a string.
        fmt:     One of "vtt", "txt", "json". Defaults to "vtt".

    Returns:
        Ordered list of SegmentDict ready for bulk DB insertion.
    """
    fmt = fmt.lower().lstrip(".")
    if fmt == "vtt":
        return _parse_vtt(content)
    if fmt == "txt":
        return _parse_txt(content)
    if fmt == "json":
        return _parse_json(content)
    raise ValueError(f"Unsupported transcript format: {fmt!r}. Use 'vtt', 'txt', or 'json'.")

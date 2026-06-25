"use client";

import { memo } from "react";
import { TranscriptSegment as SegmentType } from "@/types/transcript";
import { SpeakerChip } from "./SpeakerChip";
import { msToMmss } from "@/lib/utils/time";
import { getSpeakerColor } from "@/lib/utils/speakerColors";

interface TranscriptSegmentProps {
  segment: SegmentType;
  isActive: boolean;
  colorIndex: number;
  onSeek: (ms: number) => void;
  highlightedText?: string;
}

function TranscriptSegmentComponent({
  segment,
  isActive,
  colorIndex,
  onSeek,
  highlightedText,
}: TranscriptSegmentProps) {
  const color = getSpeakerColor(colorIndex);

  return (
    <div
      className={`flex gap-3 px-4 py-3 group cursor-pointer transition-colors duration-75 ${
        isActive
          ? "bg-ff-bg-highlight border-l-2 border-ff-accent"
          : "hover:bg-ff-bg-surface border-l-2 border-transparent"
      }`}
      onClick={() => onSeek(segment.start_time_ms)}
    >
      {/* Speaker chip */}
      <div className="shrink-0 pt-0.5">
        <SpeakerChip name={segment.speaker_name} colorIndex={colorIndex} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Speaker name + timestamp row */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[12px] font-semibold leading-tight"
            style={{ color: color.bg }}
          >
            {segment.speaker_name}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSeek(segment.start_time_ms);
            }}
            className={`text-[11px] transition-colors shrink-0 flex items-center gap-0.5 ${
              isActive
                ? "text-ff-accent-light"
                : "text-ff-text-faint hover:text-ff-text-dim"
            }`}
          >
            {isActive && (
              <svg width="7" height="7" viewBox="0 0 7 7" fill="currentColor" className="shrink-0">
                <path d="M1 1l5 2.5L1 6z" />
              </svg>
            )}
            {msToMmss(segment.start_time_ms)}
          </button>
          {isActive && (
            <span className="text-[10px] bg-ff-accent-subtle text-ff-accent-light px-1.5 py-0.5 rounded-[4px] font-medium">
              playing
            </span>
          )}
        </div>

        {/* Transcript text */}
        {highlightedText ? (
          <p
            className={`text-[12px] leading-relaxed ${
              isActive ? "text-ff-text-body" : "text-ff-text-secondary"
            }`}
            dangerouslySetInnerHTML={{ __html: highlightedText }}
          />
        ) : (
          <p
            className={`text-[12px] leading-relaxed ${
              isActive ? "text-ff-text-body" : "text-ff-text-secondary"
            }`}
          >
            {segment.text}
          </p>
        )}
      </div>
    </div>
  );
}

export const TranscriptSegment = memo(TranscriptSegmentComponent);

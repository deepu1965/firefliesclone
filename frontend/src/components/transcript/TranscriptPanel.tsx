"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import { useTranscript } from "@/hooks/useTranscript";
import { buildSpeakerColorMap } from "@/lib/utils/speakerColors";
import { ParticipantSummary } from "@/types/meeting";
import { TranscriptSearchResult } from "@/types/transcript";
import { TranscriptSegment } from "./TranscriptSegment";
import { TranscriptSearch } from "./TranscriptSearch";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

interface TranscriptPanelProps {
  meetingId: string;
  participants: ParticipantSummary[];
}

function TranscriptSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {[80, 60, 90, 55, 75, 65].map((w, i) => (
        <div key={i} className="flex gap-2.5">
          <Skeleton className="w-[26px] h-[26px] rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 rounded" style={{ width: "30%" }} />
            <Skeleton className="h-3 rounded" style={{ width: `${w}%` }} />
            <Skeleton className="h-3 rounded" style={{ width: `${w - 15}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TranscriptPanel({ meetingId, participants }: TranscriptPanelProps) {
  const { data: transcript, isLoading, isError } = useTranscript(meetingId);
  const { activeSegmentId, seekTo } = usePlayerStore();
  const segmentRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isActiveVisible, setIsActiveVisible] = useState(true);
  const [searchResults, setSearchResults] = useState<TranscriptSearchResult[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const colorMap = buildSpeakerColorMap(participants);

  const segments = transcript?.segments ?? [];

  // Build a map of segment_id → highlighted text for search
  const highlightMap = new Map<number, string>(
    searchResults.map((r) => [r.segment_id, r.highlighted_text])
  );

  // Auto-scroll active segment into view
  useEffect(() => {
    if (activeSegmentId === null) return;
    const el = segmentRefs.current.get(activeSegmentId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeSegmentId]);

  // Track whether active segment is visible (for "scroll to now playing" button)
  useEffect(() => {
    if (activeSegmentId === null) return;
    const el = segmentRefs.current.get(activeSegmentId);
    if (!el || !scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsActiveVisible(entry.isIntersecting),
      { root: scrollContainerRef.current, threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeSegmentId]);

  const handleSeek = useCallback(
    (ms: number) => seekTo(ms),
    [seekTo]
  );

  const handleSearchResults = useCallback((results: TranscriptSearchResult[]) => {
    setSearchResults(results);
    setIsSearchActive(true);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchResults([]);
    setIsSearchActive(false);
  }, []);

  const scrollToActive = useCallback(() => {
    if (activeSegmentId === null) return;
    const el = segmentRefs.current.get(activeSegmentId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSegmentId]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full md:border-r border-ff-border">
        <div className="px-4 py-2.5 border-b border-ff-border">
          <Skeleton className="h-7 w-full rounded-md" />
        </div>
        <TranscriptSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-full md:border-r border-ff-border items-center justify-center">
        <EmptyState
          icon="microphone"
          title="Transcript unavailable"
          description="Could not load transcript data."
        />
      </div>
    );
  }

  if (!segments.length) {
    return (
      <div className="flex flex-col h-full md:border-r border-ff-border">
        <TranscriptSearch
          meetingId={meetingId}
          onResults={handleSearchResults}
          onClear={handleSearchClear}
        />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon="microphone"
            title="No transcript available"
            description="No transcript segments found for this meeting."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full md:border-r border-ff-border relative">
      {/* Search bar */}
      <TranscriptSearch
        meetingId={meetingId}
        onResults={handleSearchResults}
        onClear={handleSearchClear}
      />

      {/* Segment list */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {segments.map((seg) => {
          const colorIndex = colorMap.get(seg.speaker_name) ?? 0;
          const isActive = seg.id === activeSegmentId;
          const highlighted = highlightMap.get(seg.id);

          return (
            <div
              key={seg.id}
              ref={(el) => {
                if (el) segmentRefs.current.set(seg.id, el);
                else segmentRefs.current.delete(seg.id);
              }}
            >
              <TranscriptSegment
                segment={seg}
                isActive={isActive}
                colorIndex={colorIndex}
                onSeek={handleSeek}
                highlightedText={isSearchActive ? highlighted : undefined}
              />
            </div>
          );
        })}
      </div>

      {/* "Now playing" recovery pill */}
      {!isActiveVisible && activeSegmentId !== null && (
        <button
          onClick={scrollToActive}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-ff-accent text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg hover:bg-ff-accent-light transition-colors z-10"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
            <path d="M1.5 1l5 3.5-5 3z" />
          </svg>
          Now playing
        </button>
      )}
    </div>
  );
}

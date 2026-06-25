"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchTranscript } from "@/lib/api/transcripts";
import { TranscriptSearchResult } from "@/types/transcript";
import { useDebounce } from "@/hooks/useDebounce";
import { usePlayerStore } from "@/stores/playerStore";

interface TranscriptSearchProps {
  meetingId: string;
  onResults: (results: TranscriptSearchResult[]) => void;
  onClear: () => void;
}

export function TranscriptSearch({ meetingId, onResults, onClear }: TranscriptSearchProps) {
  const [query, setQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 500);
  const { seekTo } = usePlayerStore();

  const { data, isFetching } = useQuery({
    queryKey: ["transcript-search", meetingId, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null;
      const result = await searchTranscript(meetingId, debouncedQuery);
      onResults(result.results);
      setCurrentIndex(0);
      return result;
    },
    enabled: !!debouncedQuery.trim(),
    staleTime: 30_000,
  });

  const results = data?.results ?? [];
  const total = data?.total ?? 0;

  const handleClear = useCallback(() => {
    setQuery("");
    setCurrentIndex(0);
    onClear();
  }, [onClear]);

  const navigateTo = useCallback(
    (index: number) => {
      const result = results[index];
      if (!result) return;
      seekTo(result.start_time_ms);
      setCurrentIndex(index);
    },
    [results, seekTo]
  );

  const handlePrev = useCallback(() => {
    const newIdx = currentIndex > 0 ? currentIndex - 1 : total - 1;
    navigateTo(newIdx);
  }, [currentIndex, total, navigateTo]);

  const handleNext = useCallback(() => {
    const newIdx = currentIndex < total - 1 ? currentIndex + 1 : 0;
    navigateTo(newIdx);
  }, [currentIndex, total, navigateTo]);

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-ff-border bg-ff-bg-base">
      {/* Search icon */}
      <svg
        width="13"
        height="13"
        viewBox="0 0 13 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        className="text-ff-text-dim shrink-0"
      >
        <circle cx="5.5" cy="5.5" r="4" />
        <path d="M9 9l3 3" strokeLinecap="round" />
      </svg>

      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search transcript..."
        className="flex-1 bg-transparent text-xs text-ff-text-body placeholder:text-ff-text-faint outline-none"
      />

      {/* Result count + nav */}
      {query.trim() && (
        <div className="flex items-center gap-1.5 shrink-0">
          {isFetching ? (
            <span className="text-[11px] text-ff-text-dim">...</span>
          ) : total > 0 ? (
            <>
              <span className="text-[11px] text-ff-text-dim tabular-nums">
                {currentIndex + 1} / {total}
              </span>
              <button
                onClick={handlePrev}
                className="w-5 h-5 flex items-center justify-center text-ff-text-dim hover:text-ff-text-body transition-colors"
                aria-label="Previous result"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M5 1L2 4l3 3" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="w-5 h-5 flex items-center justify-center text-ff-text-dim hover:text-ff-text-body transition-colors"
                aria-label="Next result"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 1l3 3-3 3" />
                </svg>
              </button>
            </>
          ) : (
            <span className="text-[11px] text-ff-text-dim">No results</span>
          )}

          {/* Clear */}
          <button
            onClick={handleClear}
            className="w-4 h-4 flex items-center justify-center text-ff-text-dim hover:text-ff-text-body transition-colors ml-1"
            aria-label="Clear search"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1l6 6M7 1L1 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

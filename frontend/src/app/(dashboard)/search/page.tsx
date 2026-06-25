"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { useSearch } from "@/hooks/useSearch";
import { useDebounce } from "@/hooks/useDebounce";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounced = useDebounce(query, 400);
  const { data, isLoading } = useSearch(debounced);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  return (
    <div className="flex-1 overflow-auto flex flex-col px-5 py-5">
      {debounced.length >= 2 && (
        <h1 className="text-[15px] font-semibold text-ff-text-primary mb-4">Search Results</h1>
      )}

      {debounced.length < 2 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-ff-accent-subtle flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B5DE8" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <p className="text-[14px] font-medium text-ff-text-primary mb-1">Search your meetings</p>
          <p className="text-[12px] text-ff-text-secondary">Use the search bar above or type at least 2 characters.</p>
        </div>
      )}

      {isLoading && debounced.length >= 2 && (
        <p className="text-xs text-ff-text-dim animate-pulse">Searching...</p>
      )}

      {data && data.results.length === 0 && (
        <EmptyState
          icon="search"
          title={`No results for "${debounced}"`}
          description="Try a different keyword or check the meeting title."
        />
      )}

      {data && data.results.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] text-ff-text-dim mb-2">
            {data.results.length} result{data.results.length !== 1 ? "s" : ""} for &ldquo;{debounced}&rdquo;
          </p>
          {data.results.map((result, i) => (
            <Link
              key={i}
              href={`/meetings/${result.meeting_external_id}`}
              className="bg-white border border-[#EBEBEB] rounded-[10px] px-4 py-3 hover:border-[#D0C8F8] hover:shadow-[0_4px_16px_rgba(123,93,232,0.10)] transition-all duration-150 block"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#7B5DE8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="1.5" width="7" height="6" rx="1" />
                  <path d="M8 4l3-1.5v5L8 6" />
                </svg>
                <p className="text-[12px] font-semibold text-ff-text-primary">{result.meeting_title}</p>
              </div>
              {result.speaker_name && (
                <span className="inline-flex items-center text-[10px] font-medium bg-ff-accent-subtle text-ff-accent px-2 py-0.5 rounded-full mb-1.5">
                  {result.speaker_name}
                </span>
              )}
              <p
                className="text-[11px] text-ff-text-secondary leading-relaxed"
                dangerouslySetInnerHTML={{ __html: result.text }}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar>
        <span className="text-[13px] font-semibold text-ff-text-primary">Search</span>
      </Topbar>
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p className="text-xs text-ff-text-dim animate-pulse">Loading...</p></div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}

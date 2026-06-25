"use client";

import { SummaryResponse } from "@/types/summary";
import { Skeleton } from "@/components/ui/Skeleton";

interface OverviewTabProps {
  summary: SummaryResponse | null | undefined;
  isLoading: boolean;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

function SummarySkeleton() {
  return (
    <div className="p-4 space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-2.5 rounded w-20 mb-3" />
        <Skeleton className="h-3 rounded w-full" />
        <Skeleton className="h-3 rounded w-11/12" />
        <Skeleton className="h-3 rounded w-4/5" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-2.5 rounded w-24 mb-3" />
        <div className="space-y-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2 items-start">
              <Skeleton className="w-3 h-3 rounded-full shrink-0 mt-0.5" />
              <Skeleton className="h-3 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OverviewTab({ summary, isLoading, onGenerate, isGenerating }: OverviewTabProps) {
  if (isLoading) return <SummarySkeleton />;

  if (!summary?.overview && !summary?.key_points?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-5 gap-4">
        <div className="w-10 h-10 rounded-full bg-ff-bg-surface flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-ff-text-muted" strokeLinecap="round">
            <circle cx="9" cy="9" r="7" />
            <path d="M9 6v3.5M9 12v.5" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-ff-text-body mb-1">No summary yet</p>
          <p className="text-xs text-ff-text-muted">Generate an AI summary from the transcript</p>
        </div>
        {onGenerate && (
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-ff-accent text-white text-xs font-medium rounded-[7px] hover:bg-ff-accent-light transition-colors disabled:opacity-50"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M5.5 1v2M5.5 8v2M1 5.5h2M8 5.5h2M2.4 2.4l1.4 1.4M7.2 7.2l1.4 1.4M2.4 8.6l1.4-1.4M7.2 3.8l1.4-1.4" />
            </svg>
            {isGenerating ? "Generating..." : "Generate AI Summary"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      {/* Overview */}
      {summary?.overview && (
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-[10px] font-semibold text-ff-accent uppercase tracking-widest">Overview</span>
          </div>
          <p className="text-[12px] text-ff-text-secondary leading-relaxed">{summary.overview}</p>
        </div>
      )}

      {/* Key points */}
      {summary?.key_points && summary.key_points.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-[10px] font-semibold text-ff-accent uppercase tracking-widest">Key Points</span>
          </div>
          <ul className="space-y-2">
            {summary.key_points.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-ff-accent-light shrink-0 mt-1.5" />
                <span className="text-[12px] text-ff-text-secondary leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next steps */}
      {summary?.next_steps && summary.next_steps.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-[10px] font-semibold text-ff-accent uppercase tracking-widest">Next Steps</span>
          </div>
          <ul className="space-y-2">
            {summary.next_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-ff-success shrink-0 mt-0.5">
                  <path d="M2 6l3 3 5-5" />
                </svg>
                <span className="text-[12px] text-ff-text-secondary leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Regenerate button */}
      {summary && onGenerate && (
        <div className="pt-1 border-t border-ff-border">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 text-[11px] text-ff-text-dim hover:text-ff-accent-light transition-colors disabled:opacity-50 py-1"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M5 1v2M5 7v2M1 5h2M7 5h2M2.2 2.2l1.4 1.4M6.4 6.4l1.4 1.4M2.2 7.8l1.4-1.4M6.4 3.6l1.4-1.4" />
            </svg>
            {isGenerating ? "Generating..." : "Regenerate summary"}
          </button>
        </div>
      )}
    </div>
  );
}

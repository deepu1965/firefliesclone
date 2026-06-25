"use client";

import { Topic } from "@/types/summary";
import { usePlayerStore } from "@/stores/playerStore";
import { msToMmss } from "@/lib/utils/time";
import { Skeleton } from "@/components/ui/Skeleton";

interface TopicListProps {
  topics: Topic[] | null | undefined;
  isLoading: boolean;
}

function TopicsSkeleton() {
  return (
    <div className="p-4 flex flex-wrap gap-2">
      {[70, 90, 60, 80, 55].map((w, i) => (
        <Skeleton key={i} className="h-7 rounded-full" style={{ width: `${w}px` }} />
      ))}
    </div>
  );
}

export function TopicList({ topics, isLoading }: TopicListProps) {
  const { seekTo } = usePlayerStore();

  if (isLoading) return <TopicsSkeleton />;

  if (!topics || topics.length === 0) {
    return (
      <div className="p-4 text-xs text-ff-text-muted text-center py-8">
        No topics available for this meeting.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => {
              if (topic.start_time_ms !== null) {
                seekTo(topic.start_time_ms);
              }
            }}
            disabled={topic.start_time_ms === null}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors ${
              topic.start_time_ms !== null
                ? "bg-ff-bg-elevated border-ff-border text-ff-text-body hover:border-ff-border-active hover:text-ff-accent-light cursor-pointer"
                : "bg-ff-bg-elevated border-ff-border text-ff-text-dim cursor-default"
            }`}
          >
            <span>{topic.title}</span>
            {topic.start_time_ms !== null && (
              <span className="text-ff-text-faint text-[10px]">
                {msToMmss(topic.start_time_ms)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Timeline view */}
      <div className="space-y-2">
        <p className="text-[11px] font-medium text-ff-text-dim uppercase tracking-wider">
          Timeline
        </p>
        {topics.map((topic, idx) => (
          <div
            key={topic.id}
            className="flex items-start gap-3 group cursor-pointer"
            onClick={() => {
              if (topic.start_time_ms !== null) seekTo(topic.start_time_ms);
            }}
          >
            <div className="flex flex-col items-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-ff-accent-light mt-1" />
              {idx < topics.length - 1 && (
                <div className="w-px flex-1 bg-ff-border mt-1 min-h-[16px]" />
              )}
            </div>
            <div className="pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-ff-text-body group-hover:text-ff-accent-light transition-colors">
                  {topic.title}
                </span>
                {topic.start_time_ms !== null && (
                  <span className="text-[11px] text-ff-text-faint">
                    {msToMmss(topic.start_time_ms)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

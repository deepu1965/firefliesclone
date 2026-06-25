"use client";

import { Skeleton } from "@/components/ui/Skeleton";

function MeetingCardSkeleton() {
  return (
    <div className="bg-ff-bg-elevated border border-ff-border rounded-[10px] px-[14px] py-[12px]">
      {/* Title row */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <Skeleton className="h-[14px] rounded w-2/3" />
        <Skeleton className="h-5 w-12 rounded" />
      </div>
      {/* Meta row */}
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-[11px] w-20 rounded" />
        <Skeleton className="h-[11px] w-2 rounded-full" />
        <Skeleton className="h-[11px] w-24 rounded" />
      </div>
      {/* Bullet previews */}
      <div className="space-y-1.5 mb-3">
        <Skeleton className="h-[11px] rounded w-full" />
        <Skeleton className="h-[11px] rounded w-4/5" />
      </div>
      {/* Avatar stack */}
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="w-[22px] h-[22px] rounded-full" style={{ marginLeft: i > 0 ? "-5px" : 0 }} />
          ))}
        </div>
        <Skeleton className="h-[11px] w-24 rounded" />
      </div>
    </div>
  );
}

interface MeetingListSkeletonProps {
  count?: number;
}

export function MeetingListSkeleton({ count = 6 }: MeetingListSkeletonProps) {
  return (
    <div className="flex flex-col gap-2 animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <MeetingCardSkeleton key={i} />
      ))}
    </div>
  );
}

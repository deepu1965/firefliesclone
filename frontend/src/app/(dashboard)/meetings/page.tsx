"use client";

import { useState, useCallback } from "react";
import { useMeetings } from "@/hooks/useMeetings";
import { useDebounce } from "@/hooks/useDebounce";
import { MeetingList } from "@/components/meetings/MeetingList";
import { MeetingListSkeleton } from "@/components/meetings/MeetingListSkeleton";
import { MeetingFilters, DateFilter, SortOption, MeetingOwnerFilter } from "@/components/meetings/MeetingFilters";
import { CreateMeetingModal } from "@/components/meetings/CreateMeetingModal";
import { Topbar } from "@/components/layout/Topbar";
import { ErrorMessage } from "@/components/shared/ErrorMessage";

function getDateRange(filter: DateFilter): { date_from?: string; date_to?: string } {
  if (filter === "all") return {};
  const now = new Date();
  if (filter === "this-week") {
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return { date_from: from.toISOString().split("T")[0] };
  }
  if (filter === "this-month") {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return { date_from: from.toISOString().split("T")[0] };
  }
  return {};
}

export default function MeetingsPage() {
  const [participant, setParticipant] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [ownerFilter, setOwnerFilter] = useState<MeetingOwnerFilter>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const participantDebounced = useDebounce(participant, 300);
  const dateRange = getDateRange(dateFilter);

  const { data, isLoading, isError, refetch } = useMeetings({
    participant: participantDebounced || undefined,
    sort: sortOption,
    page: 1,
    page_size: 50,
    ...dateRange,
  });

  const handleParticipantChange = useCallback((val: string) => setParticipant(val), []);

  return (
    <div className="flex flex-col h-full">
      {/* Topbar — search handled globally in Topbar */}
      <Topbar>
        <span className="text-[13px] font-semibold text-ff-text-primary">Meetings</span>
      </Topbar>

      {/* Page content */}
      <div className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {data && (
              <p className="text-[11px] text-ff-text-dim">
                {data.total} {data.total === 1 ? "meeting" : "meetings"}
              </p>
            )}
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ff-accent text-white text-[12px] font-medium rounded-[7px] hover:bg-ff-accent-light transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M5.5 1v9M1 5.5h9" />
            </svg>
            New Meeting
          </button>
        </div>

        {/* Filters row */}
        <div className="mb-4">
          <MeetingFilters
            dateFilter={dateFilter}
            sortOption={sortOption}
            ownerFilter={ownerFilter}
            participant={participant}
            onDateFilterChange={setDateFilter}
            onSortChange={setSortOption}
            onOwnerFilterChange={setOwnerFilter}
            onParticipantChange={handleParticipantChange}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <MeetingListSkeleton count={6} />
        ) : isError ? (
          <ErrorMessage
            message="Failed to load meetings. Is the backend running?"
            onRetry={() => refetch()}
          />
        ) : (
          <MeetingList
            meetings={data?.items ?? []}
            searchQuery=""
            onNewMeeting={() => setIsCreateOpen(true)}
          />
        )}
      </div>

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}

"use client";

import { MeetingListItem } from "@/types/meeting";
import { MeetingCard } from "./MeetingCard";
import { EmptyState } from "@/components/shared/EmptyState";

interface MeetingListProps {
  meetings: MeetingListItem[];
  searchQuery?: string;
  onNewMeeting?: () => void;
}

export function MeetingList({ meetings, searchQuery, onNewMeeting }: MeetingListProps) {
  if (meetings.length === 0) {
    if (searchQuery) {
      return (
        <EmptyState
          icon="search"
          title={`No meetings found for "${searchQuery}"`}
          description="Try a different search term or clear your filters."
        />
      );
    }
    return (
      <EmptyState
        icon="meeting"
        title="No meetings yet"
        description="Add your first meeting to get started."
        action={
          onNewMeeting ? (
            <button
              onClick={onNewMeeting}
              className="text-xs text-ff-accent hover:text-ff-accent-light transition-colors"
            >
              + New meeting
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {meetings.map((meeting) => (
        <MeetingCard key={meeting.external_id} meeting={meeting} />
      ))}
    </div>
  );
}

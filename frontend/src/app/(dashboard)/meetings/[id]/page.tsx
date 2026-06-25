"use client";

import { useState } from "react";
import Link from "next/link";
import { useMeeting } from "@/hooks/useMeeting";
import { Topbar } from "@/components/layout/Topbar";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { formatDuration, formatMeetingDate } from "@/lib/utils/time";
import { MediaPlayer } from "@/components/player/MediaPlayer";
import { TranscriptPanel } from "@/components/transcript/TranscriptPanel";
import { SummaryPanel } from "@/components/summary/SummaryPanel";
import { useTranscript } from "@/hooks/useTranscript";
import { EditMeetingModal } from "@/components/meetings/EditMeetingModal";
import { DeleteMeetingDialog } from "@/components/meetings/DeleteMeetingDialog";

interface PageProps {
  params: { id: string };
}

export default function MeetingDetailPage({ params }: PageProps) {
  const { id } = params;
  const { data: meeting, isLoading, isError, refetch } = useMeeting(id);
  const { data: transcript } = useTranscript(id);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const audioSrc = meeting?.audio_url ?? "/sample-audio.mp3";
  const segments = transcript?.segments ?? [];
  const participants = meeting?.participants ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Topbar>
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-48 rounded" />
        </Topbar>
        <DetailSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-full">
        <Topbar>
          <BackLink />
        </Topbar>
        <div className="flex-1 flex items-center justify-center">
          <ErrorMessage message="Failed to load meeting." onRetry={() => refetch()} />
        </div>
      </div>
    );
  }

  if (!meeting) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Topbar */}
      <Topbar>
        <BackLink />
        <span className="text-ff-text-faint text-xs">/</span>
        <span className="text-sm font-medium text-ff-text-primary truncate max-w-[140px] sm:max-w-[220px] md:max-w-[280px]">
          {meeting.title}
        </span>
        <div className="ml-auto flex items-center gap-3">
          {meeting.started_at && (
            <span className="text-[11px] text-ff-text-dim hidden sm:inline">
              {formatMeetingDate(meeting.started_at)}
            </span>
          )}
          {meeting.duration_seconds != null && (
            <span className="text-[11px] bg-ff-badge-bg text-ff-badge-text rounded-[5px] px-2 py-0.5">
              {formatDuration(meeting.duration_seconds)}
            </span>
          )}
          <span className="text-[11px] text-ff-text-dim hidden md:inline">
            {meeting.participant_count}{" "}
            {meeting.participant_count === 1 ? "participant" : "participants"}
          </span>

          {/* Edit button */}
          <button
            onClick={() => setIsEditOpen(true)}
            title="Edit meeting"
            className="w-7 h-7 flex items-center justify-center rounded-md text-ff-text-dim hover:text-ff-text-body hover:bg-ff-bg-elevated transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 1.5a1.414 1.414 0 012 2L4 11H1.5V8.5l7-7z" />
            </svg>
          </button>

          {/* Delete button */}
          <button
            onClick={() => setIsDeleteOpen(true)}
            title="Delete meeting"
            className="w-7 h-7 flex items-center justify-center rounded-md text-ff-text-dim hover:text-ff-error hover:bg-red-50 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3.5h9M4.5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4M7.5 6v4M3 3.5l.75 7a.5.5 0 00.5.5h5.5a.5.5 0 00.5-.5L11 3.5" />
            </svg>
          </button>
        </div>
      </Topbar>

      {/* Player bar — full width, below topbar */}
      <MediaPlayer audioSrc={audioSrc} segments={segments} />

      {/* Three-panel body */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[55fr_45fr] overflow-hidden">
        {/* Left: Transcript */}
        <TranscriptPanel meetingId={id} participants={participants} />

        {/* Right: Summary / Action Items / Topics */}
        <SummaryPanel meetingId={id} />
      </div>

      {/* Modals */}
      {isEditOpen && (
        <EditMeetingModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          meeting={meeting}
        />
      )}
      <DeleteMeetingDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        meetingId={meeting.external_id}
        meetingTitle={meeting.title}
        redirectAfter
      />
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/meetings"
      className="flex items-center gap-1 text-ff-text-dim hover:text-ff-text-body transition-colors text-xs shrink-0"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 1L3 6l5 5" />
      </svg>
      Meetings
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <>
      {/* Player skeleton */}
      <div className="h-[42px] bg-ff-bg-sidebar border-b border-ff-border px-4 flex items-center gap-3 shrink-0">
        <Skeleton className="w-7 h-7 rounded-full" />
        <Skeleton className="w-10 h-3 rounded" />
        <Skeleton className="flex-1 h-1 rounded-full" />
        <Skeleton className="w-10 h-3 rounded" />
        <Skeleton className="w-8 h-5 rounded" />
      </div>

      {/* Panels skeleton */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[55fr_45fr] overflow-hidden">
        {/* Transcript skeleton */}
        <div className="flex flex-col md:border-r border-ff-border">
          <div className="h-9 border-b border-ff-border px-3 flex items-center">
            <Skeleton className="h-4 flex-1 rounded" />
          </div>
          <div className="flex-1 overflow-hidden p-4 space-y-4">
            {[75, 60, 85, 50, 70, 65].map((w, i) => (
              <div key={i} className="flex gap-2.5">
                <Skeleton className="w-[26px] h-[26px] rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex gap-2">
                    <Skeleton className="h-3 rounded w-20" />
                    <Skeleton className="h-3 rounded w-10" />
                  </div>
                  <Skeleton className="h-3 rounded" style={{ width: `${w}%` }} />
                  <Skeleton className="h-3 rounded" style={{ width: `${w - 15}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary skeleton */}
        <div className="flex flex-col">
          <div className="h-[38px] border-b border-ff-border flex items-center gap-1 px-4 shrink-0">
            {["Summary", "Action Items", "Topics"].map((tab) => (
              <Skeleton key={tab} className="h-4 rounded w-16 mr-2" />
            ))}
          </div>
          <div className="p-4 space-y-4">
            <Skeleton className="h-3 rounded w-full" />
            <Skeleton className="h-3 rounded w-10/12" />
            <Skeleton className="h-3 rounded w-4/5" />
            <div className="space-y-2 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Skeleton className="w-4 h-4 rounded shrink-0" />
                  <Skeleton className="h-3 rounded flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

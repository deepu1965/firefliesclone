"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMeeting } from "@/lib/api/meetings";
import { useUiStore } from "@/stores/uiStore";
import { MeetingDetail, MeetingUpdatePayload } from "@/types/meeting";

interface EditMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingDetail;
}

export function EditMeetingModal({ isOpen, onClose, meeting }: EditMeetingModalProps) {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);

  const [title, setTitle] = useState(meeting.title);
  const [date, setDate] = useState(
    meeting.started_at
      ? new Date(meeting.started_at).toISOString().slice(0, 16)
      : ""
  );

  useEffect(() => {
    if (isOpen) {
      setTitle(meeting.title);
      setDate(meeting.started_at ? new Date(meeting.started_at).toISOString().slice(0, 16) : "");
    }
  }, [isOpen, meeting]);

  const mutation = useMutation({
    mutationFn: (payload: MeetingUpdatePayload) => updateMeeting(meeting.external_id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", meeting.external_id] });
      addToast("Meeting updated", "success");
      onClose();
    },
    onError: () => {
      addToast("Failed to update meeting", "error");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const payload: MeetingUpdatePayload = {
      title: title.trim(),
      started_at: date ? new Date(date).toISOString() : undefined,
    };
    mutation.mutate(payload);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-ff-bg-elevated border border-ff-border rounded-[12px] w-full max-w-[440px] mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ff-border">
          <h2 className="text-sm font-semibold text-ff-text-primary">Edit Meeting</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-ff-text-dim hover:text-ff-text-body hover:bg-ff-bg-surface transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-ff-text-dim uppercase tracking-wider mb-1.5">
              Meeting Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full bg-ff-bg-surface border border-ff-border rounded-[7px] px-3 py-2 text-sm text-ff-text-body placeholder:text-ff-text-faint focus:outline-none focus:border-ff-border-active transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-ff-text-dim uppercase tracking-wider mb-1.5">
              Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-ff-bg-surface border border-ff-border rounded-[7px] px-3 py-2 text-sm text-ff-text-body focus:outline-none focus:border-ff-border-active transition-colors [color-scheme:light]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-ff-text-dim hover:text-ff-text-body hover:bg-ff-bg-surface rounded-[7px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || mutation.isLoading}
              className="px-4 py-2 text-xs bg-ff-accent text-white rounded-[7px] hover:bg-ff-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {mutation.isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

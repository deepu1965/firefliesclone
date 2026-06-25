"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createMeeting } from "@/lib/api/meetings";
import { useUiStore } from "@/stores/uiStore";
import { MeetingCreatePayload } from "@/types/meeting";

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMeetingModal({ isOpen, onClose }: CreateMeetingModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [durationHours, setDurationHours] = useState("0");
  const [durationMins, setDurationMins] = useState("30");
  const [participantsRaw, setParticipantsRaw] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [transcriptMode, setTranscriptMode] = useState<"none" | "paste">("none");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (payload: MeetingCreatePayload) => createMeeting(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      addToast("Meeting created successfully", "success");
      onClose();
      resetForm();
      router.push(`/meetings/${data.external_id}`);
    },
    onError: () => {
      addToast("Failed to create meeting", "error");
    },
  });

  function resetForm() {
    setTitle("");
    setDate(new Date().toISOString().slice(0, 16));
    setDurationHours("0");
    setDurationMins("30");
    setParticipantsRaw("");
    setTranscriptText("");
    setTranscriptMode("none");
  }

  function handleClose() {
    onClose();
    resetForm();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const hours = parseInt(durationHours) || 0;
    const mins = parseInt(durationMins) || 0;
    const duration_seconds = hours * 3600 + mins * 60;

    const participants = participantsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, role: "attendee" as const }));

    const payload: MeetingCreatePayload = {
      title: title.trim(),
      started_at: date ? new Date(date).toISOString() : undefined,
      duration_seconds: duration_seconds > 0 ? duration_seconds : undefined,
      participants: participants.length > 0 ? participants : undefined,
      transcript_text: transcriptMode === "paste" && transcriptText.trim() ? transcriptText.trim() : undefined,
    };

    mutation.mutate(payload);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-ff-bg-elevated border border-ff-border rounded-[12px] w-full max-w-[520px] mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ff-border">
          <h2 className="text-sm font-semibold text-ff-text-primary">New Meeting</h2>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-ff-text-dim hover:text-ff-text-body hover:bg-ff-bg-surface transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-medium text-ff-text-dim uppercase tracking-wider mb-1.5">
              Meeting Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Product Roadmap Review"
              required
              autoFocus
              className="w-full bg-ff-bg-surface border border-ff-border rounded-[7px] px-3 py-2 text-sm text-ff-text-body placeholder:text-ff-text-faint focus:outline-none focus:border-ff-border-active transition-colors"
            />
          </div>

          {/* Date + Time */}
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

          {/* Duration */}
          <div>
            <label className="block text-[11px] font-medium text-ff-text-dim uppercase tracking-wider mb-1.5">
              Duration
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  min="0"
                  max="23"
                  className="w-16 bg-ff-bg-surface border border-ff-border rounded-[7px] px-3 py-2 text-sm text-ff-text-body focus:outline-none focus:border-ff-border-active transition-colors text-center"
                />
                <span className="text-[11px] text-ff-text-dim">hrs</span>
              </div>
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="number"
                  value={durationMins}
                  onChange={(e) => setDurationMins(e.target.value)}
                  min="0"
                  max="59"
                  className="w-16 bg-ff-bg-surface border border-ff-border rounded-[7px] px-3 py-2 text-sm text-ff-text-body focus:outline-none focus:border-ff-border-active transition-colors text-center"
                />
                <span className="text-[11px] text-ff-text-dim">mins</span>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-[11px] font-medium text-ff-text-dim uppercase tracking-wider mb-1.5">
              Participants
              <span className="normal-case text-ff-text-faint ml-1">(comma-separated names)</span>
            </label>
            <input
              type="text"
              value={participantsRaw}
              onChange={(e) => setParticipantsRaw(e.target.value)}
              placeholder="Alice Chen, Bob Smith, Carol Wang"
              className="w-full bg-ff-bg-surface border border-ff-border rounded-[7px] px-3 py-2 text-sm text-ff-text-body placeholder:text-ff-text-faint focus:outline-none focus:border-ff-border-active transition-colors"
            />
          </div>

          {/* Transcript */}
          <div>
            <label className="block text-[11px] font-medium text-ff-text-dim uppercase tracking-wider mb-1.5">
              Transcript
              <span className="normal-case text-ff-text-faint ml-1">(optional)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setTranscriptMode("none")}
                className={`flex-1 py-1.5 text-xs rounded-[6px] border transition-colors ${
                  transcriptMode === "none"
                    ? "bg-ff-bg-active border-ff-border-active text-ff-accent-light"
                    : "bg-ff-bg-surface border-ff-border text-ff-text-dim hover:text-ff-text-body"
                }`}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => setTranscriptMode("paste")}
                className={`flex-1 py-1.5 text-xs rounded-[6px] border transition-colors ${
                  transcriptMode === "paste"
                    ? "bg-ff-bg-active border-ff-border-active text-ff-accent-light"
                    : "bg-ff-bg-surface border-ff-border text-ff-text-dim hover:text-ff-text-body"
                }`}
              >
                Paste text
              </button>
            </div>

            {transcriptMode === "paste" && (
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder={`[00:00] Speaker 1: Welcome everyone to today's meeting...\n[00:15] Speaker 2: Thanks for having us. Let's start with...`}
                rows={5}
                className="w-full bg-ff-bg-surface border border-ff-border rounded-[7px] px-3 py-2 text-xs text-ff-text-body placeholder:text-ff-text-faint focus:outline-none focus:border-ff-border-active transition-colors resize-none font-mono"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs text-ff-text-dim hover:text-ff-text-body hover:bg-ff-bg-surface rounded-[7px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || mutation.isLoading}
              className="px-4 py-2 text-xs bg-ff-accent text-white rounded-[7px] hover:bg-ff-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {mutation.isLoading ? "Creating..." : "Create Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { deleteMeeting } from "@/lib/api/meetings";
import { useUiStore } from "@/stores/uiStore";

interface DeleteMeetingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  meetingTitle: string;
  redirectAfter?: boolean;
}

export function DeleteMeetingDialog({
  isOpen,
  onClose,
  meetingId,
  meetingTitle,
  redirectAfter = false,
}: DeleteMeetingDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);

  const mutation = useMutation({
    mutationFn: () => deleteMeeting(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.removeQueries({ queryKey: ["meeting", meetingId] });
      addToast("Meeting deleted", "success");
      onClose();
      if (redirectAfter) {
        router.push("/meetings");
      }
    },
    onError: () => {
      addToast("Failed to delete meeting", "error");
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-ff-bg-elevated border border-ff-border rounded-[12px] w-full max-w-[400px] mx-4 shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-ff-border">
          <h2 className="text-sm font-semibold text-ff-text-primary">Delete Meeting</h2>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-ff-text-secondary leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="text-ff-text-body font-medium">&quot;{meetingTitle}&quot;</span>?
            This will permanently remove the transcript, summary, and all action items.
          </p>
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-[7px] px-3 py-2">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-ff-error shrink-0">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M6 3.5v3M6 8v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="text-[11px] text-ff-error">This action cannot be undone.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-5 pb-4">
          <button
            onClick={onClose}
            disabled={mutation.isLoading}
            className="px-4 py-2 text-xs text-ff-text-dim hover:text-ff-text-body hover:bg-ff-bg-surface rounded-[7px] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isLoading}
            className="px-4 py-2 text-xs bg-ff-error text-white rounded-[7px] hover:bg-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {mutation.isLoading ? "Deleting..." : "Delete Meeting"}
          </button>
        </div>
      </div>
    </div>
  );
}

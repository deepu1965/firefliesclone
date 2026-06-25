"use client";

import { useState, useCallback } from "react";
import { ActionItemCreatePayload } from "@/types/summary";

interface ActionItemFormProps {
  onSubmit: (payload: ActionItemCreatePayload) => void;
  isSubmitting?: boolean;
}

export function ActionItemForm({ onSubmit, isSubmitting }: ActionItemFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!description.trim()) return;
      onSubmit({
        description: description.trim(),
        assignee_name: assignee.trim() || undefined,
      });
      setDescription("");
      setAssignee("");
      setIsOpen(false);
    },
    [description, assignee, onSubmit]
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-[12px] text-ff-text-dim hover:text-ff-accent-light transition-colors mt-1 py-2 w-full group"
      >
        <div className="w-[15px] h-[15px] rounded-[3px] border border-ff-border group-hover:border-ff-accent flex items-center justify-center transition-colors shrink-0">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M4 1v6M1 4h6" />
          </svg>
        </div>
        Add action item
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2 animate-fade-in">
      <input
        autoFocus
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Escape") { setIsOpen(false); setDescription(""); setAssignee(""); } }}
        placeholder="Describe the action item..."
        className="w-full bg-ff-bg-surface border border-ff-border rounded-[7px] px-3 py-2 text-[12px] text-ff-text-body placeholder:text-ff-text-faint outline-none focus:border-ff-border-active transition-colors"
      />
      <input
        type="text"
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
        placeholder="Assignee (optional)"
        className="w-full bg-ff-bg-surface border border-ff-border rounded-[7px] px-3 py-2 text-[12px] text-ff-text-body placeholder:text-ff-text-faint outline-none focus:border-ff-border-active transition-colors"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!description.trim() || isSubmitting}
          className="flex-1 bg-ff-accent text-white text-[12px] font-medium rounded-[7px] py-1.5 hover:bg-ff-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
        <button
          type="button"
          onClick={() => { setIsOpen(false); setDescription(""); setAssignee(""); }}
          className="px-3 text-[12px] text-ff-text-dim hover:text-ff-text-body bg-ff-bg-elevated border border-ff-border rounded-[7px] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

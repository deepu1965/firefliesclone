"use client";

import { ActionItem } from "@/types/summary";

interface ActionItemCardProps {
  item: ActionItem;
  onToggle: (item: ActionItem) => void;
  onDelete?: (itemId: string) => void;
  isUpdating?: boolean;
}

const PRIORITY_COLORS: Record<string, { dot: string; label: string }> = {
  high:   { dot: "bg-ff-error",   label: "text-ff-error" },
  medium: { dot: "bg-ff-warning", label: "text-ff-warning" },
  low:    { dot: "bg-ff-text-dim", label: "text-ff-text-dim" },
};

export function ActionItemCard({ item, onToggle, onDelete, isUpdating }: ActionItemCardProps) {
  const isCompleted = item.status === "completed";
  const priority = PRIORITY_COLORS[item.priority] ?? PRIORITY_COLORS.medium;

  return (
    <div
      className={`group flex items-start gap-3 bg-ff-bg-elevated border border-ff-border rounded-[8px] px-3 py-2.5 transition-all duration-100 hover:border-[#D0C8F8] hover:shadow-[0_2px_8px_rgba(123,93,232,0.08)] ${
        isUpdating ? "opacity-60" : ""
      } ${isCompleted ? "opacity-75" : ""}`}
    >
      {/* Custom checkbox */}
      <button
        onClick={() => onToggle(item)}
        disabled={isUpdating}
        aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
        className={`mt-0.5 shrink-0 w-[15px] h-[15px] rounded-[3px] border flex items-center justify-center transition-all duration-150 ${
          isCompleted
            ? "bg-[#1D7A52] border-[#1D7A52]"
            : "border-ff-border hover:border-ff-accent"
        }`}
      >
        {isCompleted && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none" stroke="#2DD6A4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 3.5l2.5 2.5 5-5" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-[12px] leading-relaxed ${
            isCompleted ? "line-through text-ff-text-dim" : "text-ff-text-body"
          }`}
        >
          {item.description}
        </p>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {item.assignee_name && (
            <span className="flex items-center gap-1 text-[11px] text-ff-text-dim">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="shrink-0">
                <circle cx="4.5" cy="3" r="1.5" />
                <path d="M1.5 8c0-1.657 1.343-3 3-3s3 1.343 3 3" />
              </svg>
              {item.assignee_name}
            </span>
          )}
          {item.due_date && (
            <span className="flex items-center gap-1 text-[11px] text-ff-text-dim">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                <rect x="0.5" y="1" width="8" height="7.5" rx="1" />
                <path d="M2.5 0.5v1M6.5 0.5v1M0.5 3.5h8" />
              </svg>
              {item.due_date}
            </span>
          )}
          {item.priority !== "medium" && (
            <span className={`flex items-center gap-1 text-[11px] ${priority.label}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {item.priority}
            </span>
          )}
          {!isCompleted && item.status === "in_progress" && (
            <span className="text-[11px] text-ff-accent-light bg-ff-accent-subtle px-1.5 py-0.5 rounded-[4px] font-medium">
              In Progress
            </span>
          )}
        </div>
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={() => onDelete(item.external_id)}
          disabled={isUpdating}
          className="shrink-0 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-ff-text-dim hover:text-ff-error transition-all rounded"
          aria-label="Delete action item"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

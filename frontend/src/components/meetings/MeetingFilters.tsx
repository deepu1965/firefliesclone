"use client";

import { useState } from "react";

export type DateFilter = "all" | "this-week" | "this-month";
export type SortOption = "recent" | "name";
export type MeetingOwnerFilter = "all" | "hosted" | "shared";

interface MeetingFiltersProps {
  dateFilter: DateFilter;
  sortOption: SortOption;
  ownerFilter: MeetingOwnerFilter;
  participant: string;
  onDateFilterChange: (f: DateFilter) => void;
  onSortChange: (s: SortOption) => void;
  onOwnerFilterChange: (o: MeetingOwnerFilter) => void;
  onParticipantChange: (p: string) => void;
}

export function MeetingFilters({
  dateFilter,
  sortOption,
  ownerFilter,
  participant,
  onDateFilterChange,
  onSortChange,
  onOwnerFilterChange,
  onParticipantChange,
}: MeetingFiltersProps) {
  const [showFilterPopover, setShowFilterPopover] = useState(false);

  const hasActiveFilters = dateFilter !== "all" || participant;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Owner filter tabs — Hosted by me / Shared with me */}
      <div className="flex items-center gap-0.5 bg-[#F5F4F9] border border-[#EBEBEB] rounded-[8px] p-0.5">
        {([
          { label: "All", value: "all" as MeetingOwnerFilter },
          { label: "Hosted by me", value: "hosted" as MeetingOwnerFilter },
          { label: "Shared with me", value: "shared" as MeetingOwnerFilter },
        ] as const).map((tab) => (
          <button
            key={tab.value}
            onClick={() => onOwnerFilterChange(tab.value)}
            className={`
              text-[11px] px-2.5 py-[5px] rounded-[6px] transition-all duration-100 font-medium whitespace-nowrap
              ${ownerFilter === tab.value
                ? "bg-white text-ff-accent shadow-sm border border-[#EBEBEB]"
                : "text-ff-text-dim hover:text-ff-text-body"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-[#EBEBEB]" />

      {/* Filters button (opens popover with date + participant filters) */}
      <div className="relative">
        <button
          onClick={() => setShowFilterPopover(!showFilterPopover)}
          className={`
            flex items-center gap-1.5 text-[11px] px-2.5 py-[5px] rounded-[7px] border transition-all font-medium
            ${hasActiveFilters
              ? "bg-ff-accent-subtle border-ff-border-active text-ff-accent"
              : "bg-white border-[#EBEBEB] text-ff-text-dim hover:border-ff-accent hover:text-ff-accent"
            }
          `}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <path d="M1 3h10M3 6h6M5 9h2" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-ff-accent" />
          )}
        </button>

        {/* Filter popover */}
        {showFilterPopover && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowFilterPopover(false)}
            />
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-[#EBEBEB] rounded-[10px] shadow-lg z-20 p-3 animate-scale-in">
              {/* Date filter */}
              <p className="text-[10px] font-semibold text-ff-text-muted uppercase tracking-widest mb-2">Date</p>
              <div className="flex flex-col gap-1 mb-3">
                {([
                  { label: "All time", value: "all" as DateFilter },
                  { label: "This week", value: "this-week" as DateFilter },
                  { label: "This month", value: "this-month" as DateFilter },
                ] as const).map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => onDateFilterChange(chip.value)}
                    className={`
                      text-left text-[12px] px-2.5 py-1.5 rounded-[6px] transition-colors
                      ${dateFilter === chip.value
                        ? "bg-ff-bg-active text-ff-accent font-medium"
                        : "text-ff-text-body hover:bg-ff-bg-surface"
                      }
                    `}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Participant search */}
              <p className="text-[10px] font-semibold text-ff-text-muted uppercase tracking-widest mb-2">Participant</p>
              <div className="relative mb-3">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ff-text-dim pointer-events-none">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <circle cx="4.5" cy="4.5" r="3.5" />
                    <path d="M7.5 7.5l2.5 2.5" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={participant}
                  onChange={(e) => onParticipantChange(e.target.value)}
                  placeholder="Filter by name..."
                  className="w-full bg-[#F5F4F9] border border-[#EBEBEB] rounded-[7px] pl-7 pr-3 py-[6px] text-[12px] text-ff-text-body placeholder:text-ff-text-dim focus:outline-none focus:border-ff-border-active transition-colors"
                />
              </div>

              {/* Sort */}
              <p className="text-[10px] font-semibold text-ff-text-muted uppercase tracking-widest mb-2">Sort</p>
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="w-full bg-[#F5F4F9] border border-[#EBEBEB] rounded-[7px] px-2.5 py-[6px] text-[12px] text-ff-text-body focus:outline-none focus:border-ff-border-active transition-colors cursor-pointer appearance-none"
              >
                <option value="recent">Newest first</option>
                <option value="name">A → Z</option>
              </select>

              {/* Clear */}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    onDateFilterChange("all");
                    onParticipantChange("");
                    setShowFilterPopover(false);
                  }}
                  className="mt-3 w-full text-[11px] text-ff-text-dim hover:text-ff-accent transition-colors py-1"
                >
                  Clear filters
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

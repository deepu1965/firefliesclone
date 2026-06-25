"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface MeetingSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MeetingSearch({ value, onChange, placeholder = "Search meetings..." }: MeetingSearchProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounced = useDebounce(localValue, 300);

  useEffect(() => {
    onChange(debounced);
  }, [debounced, onChange]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="relative flex-1 max-w-sm">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ff-text-dim pointer-events-none">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <circle cx="5.5" cy="5.5" r="4" />
          <path d="M9 9l3 3" />
        </svg>
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-ff-bg-elevated border border-ff-border rounded-[7px] pl-8 pr-8 py-[7px] text-xs text-ff-text-body placeholder:text-ff-text-faint focus:outline-none focus:border-ff-border-active transition-colors"
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue("");
            onChange("");
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ff-text-dim hover:text-ff-text-body transition-colors"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

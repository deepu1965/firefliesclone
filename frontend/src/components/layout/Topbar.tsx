"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface TopbarProps {
  children?: React.ReactNode;
}

export function Topbar({ children }: TopbarProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <header className="h-[48px] shrink-0 bg-white border-b border-[#EBEBEB] flex items-center px-4 gap-3 z-10">
      {/* Left: page-specific content */}
      {children && (
        <div className="flex items-center gap-2 shrink-0">
          {children}
        </div>
      )}

      {/* Center: Search bar */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-[380px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ff-text-dim pointer-events-none">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="5.5" cy="5.5" r="4" />
              <path d="M9 9l3 3" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search by title or keyword"
            className="w-full bg-[#F5F4F9] border border-[#EBEBEB] rounded-[8px] pl-8 pr-16 py-[7px] text-[13px] text-ff-text-primary placeholder:text-ff-text-dim focus:outline-none focus:border-ff-accent focus:bg-white transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            <kbd className="text-[10px] text-ff-text-muted bg-white border border-[#EBEBEB] rounded px-1 py-0.5 font-mono">
              Ctrl
            </kbd>
            <kbd className="text-[10px] text-ff-text-muted bg-white border border-[#EBEBEB] rounded px-1 py-0.5 font-mono">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Fireflies plan + actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Plan label */}
        <span className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-[#6050C8] bg-ff-accent-subtle px-2 py-1 rounded-full">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5 0l1.12 3.45h3.63l-2.94 2.13 1.12 3.45L5 7 2.07 9.03l1.12-3.45L.18 3.45h3.63L5 0Z" />
          </svg>
          Unlimited Meetings
        </span>

        {/* Upgrade button */}
        <button className="hidden md:flex items-center gap-1 px-2.5 py-[5px] text-[11px] font-semibold bg-gradient-to-r from-[#7B5DE8] to-[#A855F7] text-white rounded-[6px] hover:opacity-90 transition-opacity">
          Upgrade
        </button>

        {/* Capture button */}
        <button className="flex items-center gap-1 px-2.5 py-[5px] text-[11px] font-medium border border-[#EBEBEB] bg-white text-ff-text-body rounded-[6px] hover:border-ff-accent hover:text-ff-accent transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1.5" y="1.5" width="9" height="9" rx="2.5" />
            <circle cx="6" cy="6" r="1.8" fill="currentColor" stroke="none" />
          </svg>
          Capture
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1.5 3l2.5 2.5L6.5 3" />
          </svg>
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-[#EBEBEB]" />

        {/* Mic icon */}
        <button
          title="Start recording"
          className="w-7 h-7 flex items-center justify-center rounded-[6px] text-ff-text-dim hover:bg-ff-bg-surface hover:text-ff-accent transition-colors"
        >
          <svg width="13" height="15" viewBox="0 0 13 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="1" width="5" height="8" rx="2.5" />
            <path d="M1 7.5c0 3.04 2.46 5.5 5.5 5.5S12 10.54 12 7.5" />
            <path d="M6.5 13v1.5" />
          </svg>
        </button>

        {/* Notification bell */}
        <button
          title="Notifications"
          className="relative w-7 h-7 flex items-center justify-center rounded-[6px] text-ff-text-dim hover:bg-ff-bg-surface hover:text-ff-accent transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 1a4.5 4.5 0 014.5 4.5c0 2.21.54 3.44 1.08 4.07.27.32.42.55.42.93H1c0-.38.15-.61.42-.93C2 9.94 2.5 8.71 2.5 5.5A4.5 4.5 0 017 1Z" />
            <path d="M5.5 12.5a1.5 1.5 0 003 0" />
          </svg>
          {/* Red dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>

        {/* User avatar */}
        <button
          title="Profile"
          className="w-7 h-7 rounded-full bg-ff-accent flex items-center justify-center text-[11px] font-semibold text-white hover:opacity-90 transition-opacity"
        >
          JD
        </button>
      </div>
    </header>
  );
}

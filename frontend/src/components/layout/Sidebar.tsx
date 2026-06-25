"use client";

import { useState } from "react";
import { SidebarNavItem } from "./SidebarNavItem";
import { CreateMeetingModal } from "@/components/meetings/CreateMeetingModal";

// ─── SVG icons ───────────────────────────────────────────────────────────────

const HomeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 6.5L7.5 1.5L13.5 6.5V13H9.5V9.5H5.5V13H1.5V6.5Z" />
  </svg>
);

const AskFredIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.5 1C3.91 1 1 3.69 1 7c0 1.27.39 2.45 1.05 3.42L1 14l3.74-1.03A6.47 6.47 0 007.5 13C11.09 13 14 10.31 14 7S11.09 1 7.5 1Z" />
    <path d="M5.5 6c0-.83.67-1.5 1.5-1.5h.5c.83 0 1.5.67 1.5 1.5 0 .6-.35 1.12-.86 1.37L7.5 8.5V9" />
    <circle cx="7.5" cy="11" r=".5" fill="currentColor" />
  </svg>
);

const MeetingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="2" width="9" height="8" rx="1.5" />
    <path d="M10 5l4-2v7l-4-2" />
  </svg>
);

const MeetingStatusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="7.5" r="6" />
    <path d="M7.5 4v4l2.5 1.5" />
  </svg>
);

const UploadsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.5 1v8M4 4.5L7.5 1 11 4.5" />
    <path d="M2 10v2.5A1.5 1.5 0 003.5 14h8A1.5 1.5 0 0013 12.5V10" />
  </svg>
);

const IntegrationsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="1" width="5" height="5" rx="1" />
    <rect x="9" y="1" width="5" height="5" rx="1" />
    <rect x="1" y="9" width="5" height="5" rx="1" />
    <path d="M9 11.5h5M11.5 9v5" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 13L5 8l3 3 3-5 3 3" />
    <path d="M1 13h13" />
  </svg>
);

const VoiceAgentsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="1" width="5" height="8" rx="2.5" />
    <path d="M2 7.5c0 3.04 2.46 5.5 5.5 5.5S13 10.54 13 7.5" />
    <path d="M7.5 13v1.5" />
  </svg>
);

const AISkillsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.5 1L9 5h4l-3.5 2.5L11 12l-3.5-2.5L4 12l1.5-4.5L2 5h4L7.5 1Z" />
  </svg>
);

const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="9" height="7" rx="1" />
    <path d="M5 7V5a2.5 2.5 0 015 0v2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <circle cx="6.5" cy="6.5" r="4.5" />
    <path d="M10 10l3.5 3.5" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="7.5" r="2" />
    <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.9 2.9l1.1 1.1M11 11l1.1 1.1M2.9 12.1l1.1-1.1M11 4l1.1-1.1" />
  </svg>
);

// ─── Nav structure ────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    items: [
      { href: "/home", label: "Home", icon: <HomeIcon /> },
      { href: "/ask-fred", label: "AskFred", icon: <AskFredIcon /> },
    ],
  },
  {
    label: "MEETINGS",
    items: [
      { href: "/meetings", label: "Meetings", icon: <MeetingsIcon /> },
      { href: "/meeting-status", label: "Meeting Status", icon: <MeetingStatusIcon /> },
      { href: "/uploads", label: "Uploads", icon: <UploadsIcon /> },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { href: "/integrations", label: "Integrations", icon: <IntegrationsIcon /> },
      { href: "/analytics", label: "Analytics", icon: <AnalyticsIcon /> },
      {
        href: "/voice-agents",
        label: "Voice Agents",
        icon: <VoiceAgentsIcon />,
        badge: "NEW",
      },
      { href: "/ai-skills", label: "AI Skills", icon: <AISkillsIcon /> },
    ],
  },
  {
    items: [
      { href: "/search", label: "Search", icon: <SearchIcon /> },
      { href: "/settings", label: "Settings", icon: <SettingsIcon /> },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <aside className="w-[200px] shrink-0 h-full bg-white border-r border-[#EBEBEB] flex flex-col">
        {/* ── Logo / Brand ── */}
        <div className="px-4 py-3.5 border-b border-[#EBEBEB]">
          <div className="flex items-center gap-2">
            {/* Fireflies-inspired gradient "F" mark */}
            <div className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #FF6B6B 0%, #EE5A9A 50%, #C640C1 100%)" }}>
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                <path d="M3 2h8M3 7h5M3 12h3" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[14px] font-semibold text-[#1A1A2E] tracking-tight">fireflies.ai</span>
          </div>
        </div>

        {/* ── New Recording CTA ── */}
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 bg-ff-accent hover:bg-ff-accent-light text-white text-[12px] font-medium py-1.5 rounded-[7px] transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 1v8M1 5h8" />
            </svg>
            New Meeting
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-2 py-1 overflow-y-auto flex flex-col gap-0.5 sidebar-nav">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} className={si > 0 ? "mt-2" : ""}>
              {section.label && (
                <p className="px-2.5 pb-1 pt-1 text-[10px] font-semibold text-ff-text-muted tracking-widest uppercase">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  badge={"badge" in item ? (item as { badge?: string }).badge : undefined}
                />
              ))}
              {si < NAV_SECTIONS.length - 1 && section.label === undefined && si > 0 && (
                <div className="my-1.5 border-t border-[#EBEBEB]" />
              )}
            </div>
          ))}
        </nav>

        {/* ── User Profile ── */}
        <div className="px-2 pt-3 pb-1 border-t border-[#EBEBEB]">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-[7px] hover:bg-ff-bg-surface transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-ff-accent flex items-center justify-center shrink-0 text-[11px] font-semibold text-white">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-ff-text-primary truncate leading-tight">John Doe</p>
              <p className="text-[10px] text-ff-text-dim truncate leading-tight">john@example.com</p>
            </div>
          </div>
        </div>

        {/* ── Privacy Choices ── */}
        <div className="px-2 pb-2">
          <div className="flex items-center gap-2.5 px-2.5 py-[6px] rounded-[7px] cursor-pointer">
            <span className="w-[15px] h-[15px] shrink-0 flex items-center justify-center text-ff-text-dim">
              <LockIcon />
            </span>
            <span className="text-[12px] leading-none text-ff-text-dim">Your Privacy Choices</span>
          </div>
        </div>
      </aside>

      <CreateMeetingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}

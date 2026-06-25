"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [trialDismissed, setTrialDismissed] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-ff-bg-base overflow-hidden">
      {/* Trial Banner */}
      {!trialDismissed && (
        <div className="trial-banner shrink-0 flex items-center justify-center gap-3 px-4 py-2 text-white text-[12px] font-medium relative">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" className="shrink-0 opacity-90">
            <path d="M6.5 0l1.45 4.47h4.7L8.9 7.23l1.45 4.47L6.5 9.04l-3.85 2.66 1.45-4.47L.35 4.47h4.7L6.5 0Z" />
          </svg>
          <span>You are eligible for 7 days business plan free trial</span>
          <button className="text-[11px] font-semibold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity ml-1" style={{ background: 'white', color: '#534AB7', border: 'none' }}>
            Start free trial →
          </button>
          <button
            onClick={() => setTrialDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-auto flex flex-col min-w-0 bg-ff-bg-base">
          {children}
        </main>
      </div>
    </div>
  );
}

import { Topbar } from "@/components/layout/Topbar";

export default function HomePage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar>
        <span className="text-[13px] font-semibold text-ff-text-primary">Home</span>
      </Topbar>
      <div className="flex-1 overflow-auto flex items-center justify-center px-8 py-12">
        <div className="text-center max-w-sm animate-fade-in">
          {/* Illustration */}
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-ff-accent-subtle flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M6 18L20 6L34 18V34H26V24H14V34H6V18Z" fill="#7B5DE8" opacity="0.2" />
              <path d="M6 18L20 6L34 18V34H26V24H14V34H6V18Z" stroke="#7B5DE8" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="20" cy="18" r="4" fill="#7B5DE8" opacity="0.6" />
            </svg>
          </div>
          <h2 className="text-[18px] font-semibold text-ff-text-primary mb-2">Welcome back, John!</h2>
          <p className="text-[13px] text-ff-text-secondary leading-relaxed mb-6">
            Your personal meeting dashboard. See recent activity, quick stats, and upcoming meetings — all in one place.
          </p>
          <a
            href="/meetings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-ff-accent text-white text-[13px] font-medium rounded-[8px] hover:bg-ff-accent-light transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="1.5" width="7.5" height="6.5" rx="1.2" />
              <path d="M8.5 4.5L12 2.5v6l-3.5-2" />
            </svg>
            View Meetings
          </a>
        </div>
      </div>
    </div>
  );
}

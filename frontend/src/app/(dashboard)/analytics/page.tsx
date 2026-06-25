import { Topbar } from "@/components/layout/Topbar";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar>
        <span className="text-[13px] font-semibold text-ff-text-primary">Analytics</span>
      </Topbar>
      <div className="flex-1 overflow-auto flex items-center justify-center px-8 py-12">
        <div className="text-center max-w-sm animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-ff-accent-subtle flex items-center justify-center">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <rect x="6" y="24" width="6" height="12" rx="2" fill="#7B5DE8" opacity="0.3" />
              <rect x="15" y="16" width="6" height="20" rx="2" fill="#7B5DE8" opacity="0.55" />
              <rect x="24" y="10" width="6" height="26" rx="2" fill="#7B5DE8" opacity="0.8" />
              <rect x="33" y="18" width="6" height="18" rx="2" fill="#7B5DE8" opacity="0.5" />
              <path d="M4 36h34" stroke="#7B5DE8" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M9 24L18 16L27 10L36 18" stroke="#A855F7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2" />
            </svg>
          </div>
          <h2 className="text-[18px] font-semibold text-ff-text-primary mb-2">Meeting Analytics</h2>
          <p className="text-[13px] text-ff-text-secondary leading-relaxed mb-6">
            Gain insights into your meeting patterns, talk time, topic trends, and team productivity — all visualized in beautiful charts.
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="px-4 py-3 bg-ff-accent-subtle rounded-[10px] text-center">
              <p className="text-[22px] font-bold text-ff-accent">5</p>
              <p className="text-[11px] text-ff-text-dim mt-0.5">Meetings</p>
            </div>
            <div className="px-4 py-3 bg-[#FFF7ED] rounded-[10px] text-center">
              <p className="text-[22px] font-bold text-[#F59E0B]">3h</p>
              <p className="text-[11px] text-ff-text-dim mt-0.5">Total Time</p>
            </div>
            <div className="px-4 py-3 bg-[#F0FDF4] rounded-[10px] text-center">
              <p className="text-[22px] font-bold text-[#10B981]">12</p>
              <p className="text-[11px] text-ff-text-dim mt-0.5">Action Items</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

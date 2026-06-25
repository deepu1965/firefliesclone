import { Topbar } from "@/components/layout/Topbar";

export default function VoiceAgentsPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-ff-text-primary">Voice Agents</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-ff-accent text-white">NEW</span>
        </div>
      </Topbar>
      <div className="flex-1 overflow-auto flex items-center justify-center px-8 py-12">
        <div className="text-center max-w-md animate-fade-in">
          {/* Glowing mic illustration */}
          <div className="w-24 h-24 mx-auto mb-5 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #EDE9FC 0%, #F5F0FF 100%)", boxShadow: "0 0 40px rgba(123,93,232,0.15)" }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="16" y="4" width="16" height="26" rx="8" fill="#7B5DE8" opacity="0.2" />
              <rect x="16" y="4" width="16" height="26" rx="8" stroke="#7B5DE8" strokeWidth="2" />
              <path d="M8 24c0 8.84 7.16 16 16 16s16-7.16 16-16" stroke="#7B5DE8" strokeWidth="2" strokeLinecap="round" />
              <path d="M24 40v4" stroke="#7B5DE8" strokeWidth="2" strokeLinecap="round" />
              <circle cx="32" cy="14" r="8" fill="#A855F7" opacity="0.15" />
              <path d="M30 14h4M32 12v4" stroke="#7B5DE8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <h2 className="text-[18px] font-semibold text-ff-text-primary">Voice Agents</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-ff-accent to-[#A855F7] text-white">NEW</span>
          </div>
          <p className="text-[13px] text-ff-text-secondary leading-relaxed mb-6">
            Deploy intelligent AI voice agents that can join your calls, answer questions, take notes, and execute tasks — all hands-free during your meetings.
          </p>
          <div className="flex flex-col gap-2 mb-6 text-left">
            {["Auto-join scheduled calls", "Real-time Q&A during meetings", "Instant action item capture", "Voice-activated commands"].map((feat) => (
              <div key={feat} className="flex items-center gap-2 text-[12px] text-ff-text-body">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="7" fill="#7B5DE8" opacity="0.15" />
                  <path d="M4 7l2 2 4-4" stroke="#7B5DE8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {feat}
              </div>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-ff-accent text-white text-[13px] font-medium rounded-[8px] hover:bg-ff-accent-light transition-colors">
            Get Early Access
          </button>
        </div>
      </div>
    </div>
  );
}

import { Topbar } from "@/components/layout/Topbar";

export default function MeetingStatusPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar>
        <span className="text-[13px] font-semibold text-ff-text-primary">Meeting Status</span>
      </Topbar>
      <div className="flex-1 overflow-auto flex items-center justify-center px-8 py-12">
        <div className="text-center max-w-sm animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-ff-accent-subtle flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="13" stroke="#7B5DE8" strokeWidth="2" opacity="0.3" />
              <circle cx="20" cy="20" r="13" stroke="#7B5DE8" strokeWidth="2" strokeDasharray="50 32" strokeLinecap="round" />
              <path d="M20 13v8l4 2.5" stroke="#7B5DE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-[18px] font-semibold text-ff-text-primary mb-2">Track Meeting Progress</h2>
          <p className="text-[13px] text-ff-text-secondary leading-relaxed mb-6">
            Monitor the recording and transcription status of your meetings in real time. See which meetings are processing, completed, or failed.
          </p>
          <a
            href="/meetings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-ff-accent text-white text-[13px] font-medium rounded-[8px] hover:bg-ff-accent-light transition-colors"
          >
            Go to Meetings
          </a>
        </div>
      </div>
    </div>
  );
}

import { Topbar } from "@/components/layout/Topbar";

export default function UploadsPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar>
        <span className="text-[13px] font-semibold text-ff-text-primary">Uploads</span>
      </Topbar>
      <div className="flex-1 overflow-auto flex items-center justify-center px-8 py-12">
        <div className="text-center max-w-sm animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-ff-accent-subtle flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="8" y="14" width="24" height="20" rx="3" stroke="#7B5DE8" strokeWidth="2" opacity="0.3" />
              <path d="M20 28V16M14 22l6-6 6 6" stroke="#7B5DE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13 10h14" stroke="#7B5DE8" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <path d="M16 6h8" stroke="#7B5DE8" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            </svg>
          </div>
          <h2 className="text-[18px] font-semibold text-ff-text-primary mb-2">Upload Recordings</h2>
          <p className="text-[13px] text-ff-text-secondary leading-relaxed mb-6">
            Upload audio or video recordings of your meetings. Fireflies will automatically transcribe them and generate AI summaries and action items.
          </p>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-ff-accent text-white text-[13px] font-medium rounded-[8px] hover:bg-ff-accent-light transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 1v8M3 4.5L6.5 1 10 4.5" />
              <path d="M1.5 9.5v1.5A1.5 1.5 0 003 12.5h7a1.5 1.5 0 001.5-1.5V9.5" />
            </svg>
            Upload a File
          </button>
        </div>
      </div>
    </div>
  );
}

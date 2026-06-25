import { Topbar } from "@/components/layout/Topbar";

const INTEGRATIONS = [
  { name: "Zoom", icon: "🎥", desc: "Auto-join and transcribe Zoom meetings", color: "#2D8CFF" },
  { name: "Google Meet", icon: "📹", desc: "Record and summarize Google Meet calls", color: "#34A853" },
  { name: "Microsoft Teams", icon: "💼", desc: "Capture Teams meetings automatically", color: "#6264A7" },
  { name: "Salesforce", icon: "☁️", desc: "Sync action items and notes to CRM", color: "#00A1E0" },
  { name: "Slack", icon: "💬", desc: "Get meeting summaries in Slack channels", color: "#4A154B" },
  { name: "Notion", icon: "📓", desc: "Export transcripts and notes to Notion", color: "#000000" },
];

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar>
        <span className="text-[13px] font-semibold text-ff-text-primary">Integrations</span>
      </Topbar>
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-2xl">
          <div className="mb-6">
            <h1 className="text-[18px] font-semibold text-ff-text-primary mb-1">Connect Your Tools</h1>
            <p className="text-[13px] text-ff-text-secondary">
              Integrate Fireflies with your favorite apps to supercharge your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {INTEGRATIONS.map((item) => (
              <div
                key={item.name}
                className="bg-white border border-[#EBEBEB] rounded-[10px] p-4 flex items-center gap-3 hover:border-ff-accent hover:shadow-card-hover transition-all cursor-pointer group"
              >
                <div
                  className="w-10 h-10 rounded-[8px] flex items-center justify-center text-xl shrink-0 opacity-90"
                  style={{ backgroundColor: item.color + "18" }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ff-text-primary">{item.name}</p>
                  <p className="text-[11px] text-ff-text-secondary mt-0.5 truncate">{item.desc}</p>
                </div>
                <button className="shrink-0 text-[11px] font-medium px-3 py-1 rounded-[6px] border border-[#EBEBEB] text-ff-text-dim group-hover:border-ff-accent group-hover:text-ff-accent transition-colors">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

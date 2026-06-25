import { Topbar } from "@/components/layout/Topbar";

const SAMPLE_SKILLS = [
  { name: "Meeting Summary", desc: "Auto-generate concise summaries", icon: "📝", active: true },
  { name: "Action Items", desc: "Extract tasks and assign owners", icon: "✅", active: true },
  { name: "Sentiment Analysis", desc: "Understand meeting tone and energy", icon: "😊", active: false },
  { name: "Competitor Mentions", desc: "Track mentions of competitors", icon: "🎯", active: false },
  { name: "Follow-up Emails", desc: "Draft follow-up emails from notes", icon: "📧", active: false },
  { name: "CRM Update", desc: "Sync key info to your CRM", icon: "🔗", active: false },
];

export default function AISkillsPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar>
        <span className="text-[13px] font-semibold text-ff-text-primary">AI Skills</span>
      </Topbar>
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-2xl">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-[18px] font-semibold text-ff-text-primary mb-1">AI Skills</h1>
              <p className="text-[13px] text-ff-text-secondary">
                Customize what Fireflies AI does for every meeting you record.
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-ff-accent text-white text-[12px] font-medium rounded-[7px] hover:bg-ff-accent-light transition-colors">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5.5 1v9M1 5.5h9" />
              </svg>
              Custom Skill
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {SAMPLE_SKILLS.map((skill) => (
              <div
                key={skill.name}
                className="bg-white border border-[#EBEBEB] rounded-[10px] p-4 flex items-center gap-3 hover:shadow-card-hover transition-all"
              >
                <div className="w-10 h-10 rounded-[8px] bg-ff-accent-subtle flex items-center justify-center text-xl shrink-0">
                  {skill.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-ff-text-primary">{skill.name}</p>
                  <p className="text-[11px] text-ff-text-secondary mt-0.5">{skill.desc}</p>
                </div>
                {/* Toggle */}
                <button
                  className={`relative shrink-0 w-9 h-5 rounded-full transition-colors ${skill.active ? "bg-ff-accent" : "bg-[#E5E7EB]"}`}
                  aria-label={skill.active ? "Disable" : "Enable"}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${skill.active ? "left-4" : "left-0.5"}`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Type / hint */}
          <p className="mt-5 text-[11px] text-ff-text-dim text-center">
            Type <kbd className="bg-white border border-[#EBEBEB] rounded px-1 py-0.5 text-[10px] font-mono">/</kbd> in AskFred to run any skill manually
          </p>
        </div>
      </div>
    </div>
  );
}

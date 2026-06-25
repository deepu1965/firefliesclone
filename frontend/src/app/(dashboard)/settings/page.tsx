import { Topbar } from "@/components/layout/Topbar";

const SETTINGS_SECTIONS = [
  {
    title: "Account",
    items: [
      { label: "Profile", desc: "Update your name, email, and avatar", icon: "👤" },
      { label: "Password", desc: "Change your password or enable SSO", icon: "🔒" },
      { label: "Notifications", desc: "Configure email and in-app alerts", icon: "🔔" },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Team", desc: "Manage team members and roles", icon: "👥" },
      { label: "Billing", desc: "Upgrade plan and manage invoices", icon: "💳" },
      { label: "API Keys", desc: "Generate and revoke API access tokens", icon: "🔑" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { label: "Language", desc: "Transcription and UI language", icon: "🌐" },
      { label: "Privacy", desc: "Data retention and deletion policies", icon: "🛡️" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar>
        <span className="text-[13px] font-semibold text-ff-text-primary">Settings</span>
      </Topbar>
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-xl">
          <div className="mb-6">
            <h1 className="text-[18px] font-semibold text-ff-text-primary mb-1">Settings</h1>
            <p className="text-[13px] text-ff-text-secondary">Manage your account and workspace preferences.</p>
          </div>

          {SETTINGS_SECTIONS.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="text-[11px] font-semibold text-ff-text-muted tracking-widest uppercase mb-2">
                {section.title}
              </p>
              <div className="bg-white border border-[#EBEBEB] rounded-[10px] divide-y divide-[#EBEBEB] overflow-hidden">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-ff-bg-surface transition-colors text-left"
                  >
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-ff-text-primary">{item.label}</p>
                      <p className="text-[11px] text-ff-text-secondary mt-0.5">{item.desc}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-ff-text-dim shrink-0">
                      <path d="M5 3l4 4-4 4" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

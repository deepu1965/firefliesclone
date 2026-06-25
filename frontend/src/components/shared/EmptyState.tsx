"use client";

interface EmptyStateProps {
  icon?: "meeting" | "search" | "microphone";
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const ICONS = {
  meeting: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-ff-text-faint">
      <rect x="3" y="7" width="22" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M25 13l8-4v18l-8-4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 14h8M10 18h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-ff-text-faint">
      <circle cx="15" cy="15" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 22l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  microphone: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-ff-text-faint">
      <rect x="12" y="3" width="12" height="18" rx="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 20c0 6.075 4.925 11 11 11s11-4.925 11-11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="31" x2="18" y2="35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export function EmptyState({ icon = "meeting", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-full bg-ff-bg-surface flex items-center justify-center mb-1">
        {ICONS[icon]}
      </div>
      <div>
        <p className="text-[13px] font-medium text-ff-text-body">{title}</p>
        {description && (
          <p className="text-[12px] text-ff-text-muted mt-1 leading-relaxed max-w-[280px]">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

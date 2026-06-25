"use client";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium bg-ff-badge-bg text-ff-badge-text ${className}`}
    >
      {children}
    </span>
  );
}

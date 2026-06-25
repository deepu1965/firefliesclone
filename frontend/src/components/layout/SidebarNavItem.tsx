"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export function SidebarNavItem({ href, label, icon, badge }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2.5 px-2.5 py-[7px] rounded-[7px] text-sm transition-all duration-150
        ${isActive
          ? "bg-ff-bg-active text-ff-accent font-semibold"
          : "text-ff-text-dim hover:bg-ff-bg-surface hover:text-ff-text-body"
        }
      `}
    >
      <span className="w-[15px] h-[15px] shrink-0 flex items-center justify-center">
        {icon}
      </span>
      <span className="text-[13px] leading-none flex-1">{label}</span>
      {badge && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 text-white leading-none" style={{ background: '#1a3a5c', borderRadius: '4px' }}>
          {badge}
        </span>
      )}
    </Link>
  );
}

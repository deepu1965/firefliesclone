"use client";

import Link from "next/link";
import { MeetingListItem } from "@/types/meeting";
import { getSpeakerColor } from "@/lib/utils/speakerColors";
import { formatDuration, formatMeetingDate } from "@/lib/utils/time";

interface MeetingCardProps {
  meeting: MeetingListItem;
}

const BULLET_EMOJIS = ["📋", "✅", "💡", "🎯", "📌", "🔑", "📊", "⚡"];

function getBulletEmoji(text: string, idx: number): string {
  const lower = text.toLowerCase();
  if (lower.includes("action") || lower.includes("task") || lower.includes("todo")) return "✅";
  if (lower.includes("decision") || lower.includes("decided")) return "🎯";
  if (lower.includes("budget") || lower.includes("cost") || lower.includes("revenue")) return "📊";
  if (lower.includes("issue") || lower.includes("problem") || lower.includes("risk")) return "⚠️";
  if (lower.includes("plan") || lower.includes("roadmap") || lower.includes("timeline")) return "📋";
  if (lower.includes("review") || lower.includes("discuss")) return "💬";
  return BULLET_EMOJIS[idx % BULLET_EMOJIS.length];
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const displayParticipants = meeting.participants.slice(0, 3);
  const overflow = meeting.participants.length - 3;
  const bullets = (meeting.summary_preview ?? []).slice(0, 2);

  return (
    <Link href={`/meetings/${meeting.external_id}`}>
      <div className="group bg-white border border-[#EBEBEB] rounded-[10px] px-3 py-2.5 md:px-[14px] md:py-[12px] cursor-pointer transition-all duration-150 hover:border-[#D0C8F8] hover:shadow-[0_4px_16px_rgba(123,93,232,0.10)]">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-[13px] font-semibold text-ff-text-primary leading-snug line-clamp-1 flex-1 group-hover:text-ff-accent transition-colors">
            {meeting.title}
          </h3>
          {meeting.duration_seconds != null && (
            <span className="shrink-0 text-[11px] bg-ff-badge-bg text-ff-badge-text rounded-[5px] px-1.5 py-0.5 font-medium tabular-nums">
              {formatDuration(meeting.duration_seconds)}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-ff-text-muted shrink-0" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="1.5" width="8" height="7" rx="1" />
            <path d="M3 1v1M7 1v1M1 4h8" />
          </svg>
          <span className="text-[11px] text-ff-text-dim">
            {meeting.started_at ? formatMeetingDate(meeting.started_at) : formatMeetingDate(meeting.created_at)}
          </span>
          {meeting.participant_count > 0 && (
            <>
              <span className="text-ff-text-faint text-[11px]">·</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-ff-text-muted shrink-0" strokeLinecap="round">
                <circle cx="5" cy="3.5" r="1.8" />
                <path d="M1.5 9c0-1.93 1.57-3.5 3.5-3.5S8.5 7.07 8.5 9" />
              </svg>
              <span className="text-[11px] text-ff-text-dim">
                {meeting.participant_count} {meeting.participant_count === 1 ? "person" : "people"}
              </span>
            </>
          )}
        </div>

        {/* Bullet previews */}
        {bullets.length > 0 && (
          <div className="space-y-0.5 mb-3 pl-0.5">
            {bullets.map((bullet, idx) => (
              <p key={idx} className="text-[11px] text-ff-text-secondary line-clamp-1 leading-relaxed flex items-start gap-1.5">
                <span className="shrink-0 text-[10px] leading-relaxed">{getBulletEmoji(bullet, idx)}</span>
                <span className="flex-1 min-w-0 truncate">{bullet}</span>
              </p>
            ))}
          </div>
        )}

        {/* Participants avatar stack */}
        {displayParticipants.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {displayParticipants.map((p, idx) => {
                const color = getSpeakerColor(idx);
                const initials = p.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div
                    key={idx}
                    className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-semibold border-2 border-white shrink-0"
                    style={{ backgroundColor: color.bg, color: color.text, marginLeft: idx > 0 ? "-5px" : 0 }}
                    title={p.name}
                  >
                    {initials}
                  </div>
                );
              })}
              {overflow > 0 && (
                <div
                  className="w-[22px] h-[22px] rounded-full bg-ff-bg-surface border-2 border-white flex items-center justify-center text-[9px] text-ff-text-dim font-medium shrink-0"
                  style={{ marginLeft: "-5px" }}
                >
                  +{overflow}
                </div>
              )}
            </div>
            {displayParticipants.length > 0 && (
              <span className="text-[11px] text-ff-text-muted truncate">
                {displayParticipants.slice(0, 2).map(p => p.name.split(" ")[0]).join(", ")}
                {(displayParticipants.length > 2 || overflow > 0) && "..."}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

"use client";

import { getSpeakerColor } from "@/lib/utils/speakerColors";

interface SpeakerChipProps {
  name: string;
  colorIndex: number;
  size?: "sm" | "md";
}

export function SpeakerChip({ name, colorIndex, size = "md" }: SpeakerChipProps) {
  const color = getSpeakerColor(colorIndex);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClass = size === "sm" ? "w-5 h-5 text-[8px]" : "w-[26px] h-[26px] text-[9px]";

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold shrink-0`}
      style={{ backgroundColor: color.bg, color: color.text }}
      title={name}
    >
      {initials}
    </div>
  );
}

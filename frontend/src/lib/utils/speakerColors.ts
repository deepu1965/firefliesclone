export const SPEAKER_COLORS = [
  { bg: "#5B8FF9", text: "#ffffff", label: "blue" },    // participant 0
  { bg: "#AA7BF5", text: "#ffffff", label: "purple" },  // participant 1
  { bg: "#FF8C42", text: "#ffffff", label: "orange" },  // participant 2
  { bg: "#2DD6A4", text: "#0A2820", label: "teal" },    // participant 3
  { bg: "#F177B5", text: "#ffffff", label: "pink" },    // participant 4
] as const;

export function getSpeakerColor(index: number) {
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length];
}

export function buildSpeakerColorMap(
  participants: { name: string; speaker_label: string | null }[]
): Map<string, number> {
  const map = new Map<string, number>();
  participants.forEach((p, idx) => {
    const key = p.speaker_label ?? p.name;
    if (!map.has(key)) {
      map.set(key, idx);
    }
  });
  return map;
}

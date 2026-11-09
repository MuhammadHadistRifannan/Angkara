import type { Level } from "../../supabase/functions/_shared/safety/rules";

export function roundCoord(n: number): number {
  return Math.round(n * 10) / 10;
}

export function severityToColor(score: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  if (clamped <= 33) {
    if (clamped === 0) return "#10b981";
    // Interpolasi halus dalam pita hijau (0-33)
    const factor = clamped / 33;
    const r = Math.round(16 + factor * (34 - 16));
    const g = Math.round(185 + factor * (197 - 185));
    const b = Math.round(129 + factor * (94 - 129));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } else if (clamped <= 66) {
    // Interpolasi halus dalam pita kuning (34-66)
    const factor = (clamped - 34) / (66 - 34);
    const r = Math.round(245 + factor * (249 - 245));
    const g = Math.round(158 + factor * (115 - 158));
    const b = Math.round(11 + factor * (22 - 11));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } else {
    if (clamped === 100) return "#ef4444";
    // Interpolasi halus dalam pita merah (67-100)
    const factor = (clamped - 67) / (100 - 67);
    const r = Math.round(220 + factor * (239 - 220));
    const g = Math.round(38 + factor * (68 - 38));
    const b = Math.round(38 + factor * (68 - 38));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
}

export function levelToColor(level: Level): string {
  switch (level) {
    case "aman":
      return severityToColor(0);
    case "waspada":
      return severityToColor(50);
    case "tunda":
      return severityToColor(100);
  }
}

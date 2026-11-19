export type SuarCardColor = "teal" | "seafoam" | "coral" | "sun" | "sand" | "navy";

export interface SuarCardContrastTheme {
  bgClass: string;
  textColor: string;
  subtextColor: string;
  chipClass: string;
  borderClass: string;
  accentBtnClass: string;
  isDark: boolean;
}

/**
 * Menghitung pasangan warna berdasar palet SUAR dengan jaminan kontras AA (WCAG).
 * - Kartu gelap (teal, coral, navy): teks putih murni.
 * - Kartu terang (seafoam, sun, sand): teks tinta laut (slate-900 / ink dark).
 */
export function getContrastThemeForColor(color: SuarCardColor = "teal"): SuarCardContrastTheme {
  switch (color) {
    case "teal":
      return {
        bgClass: "bg-[#0D9488]", // Deep Saturated Teal
        textColor: "text-white",
        subtextColor: "text-teal-100",
        chipClass: "bg-white/20 text-white border-white/30",
        borderClass: "border-teal-700/40",
        accentBtnClass: "bg-white text-teal-950 hover:bg-teal-50",
        isDark: true,
      };
    case "seafoam":
      return {
        bgClass: "bg-[#6EE7B7]", // Saturated Fresh Seafoam
        textColor: "text-slate-900",
        subtextColor: "text-slate-800",
        chipClass: "bg-slate-900/10 text-slate-900 border-slate-900/20",
        borderClass: "border-emerald-600/30",
        accentBtnClass: "bg-[#0B1528] text-white hover:bg-slate-900",
        isDark: false,
      };
    case "coral":
      return {
        bgClass: "bg-[#EA580C]", // Saturated Warm Coral
        textColor: "text-white",
        subtextColor: "text-orange-100",
        chipClass: "bg-white/20 text-white border-white/30",
        borderClass: "border-orange-700/40",
        accentBtnClass: "bg-white text-orange-950 hover:bg-orange-50",
        isDark: true,
      };
    case "sun":
      return {
        bgClass: "bg-[#FBBF24]", // Saturated Warm Sunlight
        textColor: "text-slate-900",
        subtextColor: "text-slate-800",
        chipClass: "bg-slate-900/10 text-slate-900 border-slate-900/20",
        borderClass: "border-amber-600/30",
        accentBtnClass: "bg-[#0B1528] text-white hover:bg-slate-900",
        isDark: false,
      };
    case "navy":
      return {
        bgClass: "bg-[#0B1528]", // Deep Maritime Ink
        textColor: "text-white",
        subtextColor: "text-slate-200",
        chipClass: "bg-white/15 text-white border-white/20",
        borderClass: "border-slate-800",
        accentBtnClass: "bg-white text-slate-950 hover:bg-slate-100",
        isDark: true,
      };
    case "sand":
    default:
      return {
        bgClass: "bg-[#F4EDE2]", // Warm Sand
        textColor: "text-slate-900",
        subtextColor: "text-slate-700",
        chipClass: "bg-slate-900/10 text-slate-900 border-slate-900/20",
        borderClass: "border-amber-200/50",
        accentBtnClass: "bg-[#0B1528] text-white hover:bg-slate-900",
        isDark: false,
      };
  }
}

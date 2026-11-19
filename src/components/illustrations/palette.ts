/**
 * Palet Warna Resmi Ilustrasi & Maskot SUAR ("Si Suar")
 * Diturunkan langsung dari token desain maritim SUAR di index.css
 */

export const SUAR_PALETTE = {
  // Nada Pasir Hangat
  sand: {
    light: "#FAF7F2",
    base: "#F4EDE2",
    dark: "#E5DAC7",
    deep: "#C8B79B",
  },
  // Teal Laut & Aquamarine
  teal: {
    light: "#CCFBF1",
    base: "#14B8A6",
    deep: "#0D9488",
    dark: "#115E59",
  },
  // Seafoam Lembut
  seafoam: {
    light: "#ECFDF5",
    base: "#6EE7B7",
    dark: "#10B981",
  },
  // Koral & Pelampung Hangat
  coral: {
    light: "#FFEDD5",
    base: "#FB923C",
    deep: "#E76F51",
    dark: "#C2410C",
  },
  // Kuning Sinar Matahari & Lentera Suar
  sun: {
    light: "#FEF3C7",
    base: "#FBBF24",
    deep: "#F59E0B",
    glow: "#FDE68A",
  },
  // Tinta Laut (Garis Kontur & Mata)
  ink: {
    light: "#334155",
    base: "#1E293B",
    dark: "#0F172A",
    deep: "#0B132B",
  },
  // Langit & Ombak Pesisir
  water: {
    foam: "#F0F9FF",
    light: "#BAE6FD",
    base: "#38BDF8",
    deep: "#0284C7",
  },
  // Pipi Merona & Kehangatan
  blush: "#FDA4AF",
  white: "#FFFFFF",
} as const;

export type SuarColorKey = keyof typeof SUAR_PALETTE;

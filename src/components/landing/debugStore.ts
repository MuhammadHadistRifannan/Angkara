export interface SectionDebugInfo {
  step: number;
  scrollProgress: number;
  typingStatus: "idle" | "typing" | "done" | "cancelled";
  modelIndex?: number;
  modelActiveId?: string;
  targetPos?: { x: number; y: number; scale?: number };
}

export interface FullDebugState {
  hero: SectionDebugInfo;
  features: SectionDebugInfo;
  viewport: { width: number; height: number };
}

type Listener = (section: "hero" | "features", info: Partial<SectionDebugInfo>) => void;
let globalListener: Listener | null = null;

export const setDebugListener = (listener: Listener | null) => {
  globalListener = listener;
};

export const updateDebugOverlay = (
  section: "hero" | "features",
  info: Partial<SectionDebugInfo>
) => {
  if (globalListener) {
    globalListener(section, info);
  }
};

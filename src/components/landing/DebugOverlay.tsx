import React, { useState, useEffect } from "react";
import { FullDebugState, setDebugListener } from "./debugStore";

export const DebugOverlay: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [state, setState] = useState<FullDebugState>({
    hero: { step: 0, scrollProgress: 0, typingStatus: "idle" },
    features: {
      step: 0,
      scrollProgress: 0,
      typingStatus: "idle",
      modelIndex: 0,
      modelActiveId: "shield",
    },
    viewport: {
      width: typeof window !== "undefined" ? window.innerWidth : 1440,
      height: typeof window !== "undefined" ? window.innerHeight : 900,
    },
  });

  useEffect(() => {
    const hasDebugParam =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("debug") === "1";

    if (hasDebugParam || import.meta.env.DEV) {
      setIsEnabled(hasDebugParam);
    }

    setDebugListener((section, info) => {
      setState((prev) => {
        const next = {
          ...prev,
          [section]: { ...prev[section], ...info },
        };
        if (info.step !== undefined && info.step !== prev[section].step) {
          console.log(`[DebugOverlay] ${section.toUpperCase()} Step -> ${info.step}`);
        }
        return next;
      });
    });

    const handleResize = () => {
      setState((prev) => ({
        ...prev,
        viewport: { width: window.innerWidth, height: window.innerHeight },
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      setDebugListener(null);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <aside
      aria-label="Panel Debug Stabilisasi"
      className="fixed bottom-4 left-4 z-[9999] bg-black/85 text-emerald-400 font-mono text-[11px] p-3 rounded-lg border border-emerald-500/40 shadow-2xl backdrop-blur-md pointer-events-none select-none max-w-xs space-y-2"
    >
      <div className="font-bold text-white border-b border-emerald-500/20 pb-1 flex justify-between">
        <span>DEBUG OVERLAY (?debug=1)</span>
        <span className="text-slate-400 text-[10px]">
          {state.viewport.width}x{state.viewport.height}
        </span>
      </div>

      {/* HERO SECTION */}
      <div className="border-b border-slate-700/60 pb-1">
        <div className="font-semibold text-cyan-300">HERO</div>
        <div className="flex justify-between">
          <span>Step: {state.hero.step}</span>
          <span>Scroll: {(state.hero.scrollProgress * 100).toFixed(0)}%</span>
          <span>Typing: {state.hero.typingStatus}</span>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div>
        <div className="font-semibold text-cyan-300">FITUR 3D</div>
        <div className="flex justify-between">
          <span>Step: {state.features.step}</span>
          <span>Scroll: {(state.features.scrollProgress * 100).toFixed(0)}%</span>
        </div>
        <div>
          Model: idx {state.features.modelIndex} ({state.features.modelActiveId})
        </div>
        {state.features.targetPos && (
          <div>
            Target: [{state.features.targetPos.x.toFixed(2)},{" "}
            {state.features.targetPos.y.toFixed(2)}]
          </div>
        )}
      </div>
    </aside>
  );
};

import React from "react";
import type { Feature3DItem } from "./types";

interface FeatureDescriptionPanelProps {
  feature: Feature3DItem;
  index?: number;
  total?: number;
  isActive: boolean; // true ketika step 1..5
  isMobile: boolean;
  isReducedMotion: boolean;
}

// Teks langsung tampil (tanpa efek mengetik) agar pengunjung tidak menunggu.
// Panel di-mount ulang per fitur (key di FeaturesStage), jadi transisi masuk
// singkat ini berjalan setiap kali fitur berganti.
export const FeatureDescriptionPanel: React.FC<FeatureDescriptionPanelProps> = ({
  feature,
  index,
  total,
  isActive,
  isMobile,
  isReducedMotion,
}) => {
  const enter = isReducedMotion
    ? ""
    : "animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both";

  return (
    <div
      className={`relative z-20 w-full transition-opacity duration-200 ease-out ${
        isMobile ? "text-center px-4 max-w-md mx-auto" : "text-left max-w-[480px]"
      } ${isActive ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div className={isActive ? enter : ""}>
        <div
          className={`flex items-center gap-3 mb-4 text-xs text-white/55 ${
            isMobile ? "justify-center" : ""
          }`}
        >
          {index !== undefined && total !== undefined && (
            <span className="font-mono tracking-widest" aria-hidden="true">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          )}
          {feature.audience && (
            <span className="rounded-full border border-white/20 px-2.5 py-0.5 font-medium text-white/70">
              {feature.audience}
            </span>
          )}
        </div>

        <h3 className="font-display font-semibold tracking-[-0.025em] leading-[1.1] text-[clamp(1.75rem,3.2vw,2.75rem)] text-white mb-4">
          {feature.title}
        </h3>

        {feature.description && (
          <p
            className={`font-display leading-[1.65] text-[clamp(0.95rem,1.2vw,1.1rem)] text-white/75 ${
              isMobile ? "" : "border-l-2 border-white/20 pl-4"
            }`}
          >
            {feature.description}
          </p>
        )}
      </div>
    </div>
  );
};

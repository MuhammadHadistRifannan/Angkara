import React from "react";
import { motion } from "framer-motion";
import type { Feature3DItem } from "./types";

interface FeatureDescriptionPanelProps {
  feature: Feature3DItem;
  index?: number;
  total?: number;
  isActive: boolean; // true ketika step 1..5
  isMobile: boolean;
  isReducedMotion: boolean;
}

// Teks langsung tampil dengan animasi bounce pada icon fitur saat berganti.
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

  const Icon = feature.icon;

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
            <span className="rounded-full border border-teal-400/30 bg-teal-500/10 px-2.5 py-0.5 font-medium text-teal-300 flex items-center gap-1.5">
              {Icon && <Icon className="w-3.5 h-3.5 text-teal-300" />}
              {feature.audience}
            </span>
          )}
        </div>

        <div className={`flex items-center gap-3.5 mb-4 ${isMobile ? "justify-center" : ""}`}>
          {Icon && (
            <motion.div
              initial={isReducedMotion ? {} : { scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={
                isReducedMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 420, damping: 14 }
              }
              className="p-2 sm:p-2.5 rounded-2xl bg-teal-500/15 border border-teal-400/30 text-teal-300 shadow-[0_4px_20px_rgba(20,184,166,0.3)] shrink-0"
              aria-hidden="true"
            >
              <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
            </motion.div>
          )}

          <h3 className="font-display font-semibold tracking-[-0.025em] leading-[1.1] text-[clamp(1.75rem,3.2vw,2.75rem)] text-white">
            {feature.title}
          </h3>
        </div>

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

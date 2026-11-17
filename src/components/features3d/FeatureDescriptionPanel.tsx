import { useEffect, useState, useRef } from "react";
import type { Feature3DItem } from "./types";
import { createTypingController, type TypingState } from "./typingController";

interface FeatureDescriptionPanelProps {
  feature: Feature3DItem;
  isActive: boolean; // true ketika step 1..5 dan sedang aktif
  step: number;
  isMobile: boolean;
  isReducedMotion: boolean;
}

export const FeatureDescriptionPanel = ({
  feature,
  isActive,
  step,
  isMobile,
  isReducedMotion,
}: FeatureDescriptionPanelProps) => {
  const [typingState, setTypingState] = useState<TypingState>({
    typedTitle: isReducedMotion ? feature.title : "",
    typedDesc: isReducedMotion ? feature.description : "",
    isTitleDone: isReducedMotion,
    isDescDone: isReducedMotion,
    showCursor: false,
    cursorTarget: "none",
  });

  const [isExiting, setIsExiting] = useState(false);
  const activeStepRef = useRef(step);
  const typingControllerRef = useRef<ReturnType<typeof createTypingController> | null>(null);

  useEffect(() => {
    // Jika tidak aktif (misal intro step 0), cancel typing dan sembunyikan
    if (!isActive) {
      typingControllerRef.current?.cancel();
      setIsExiting(true);
      return;
    }

    if (isReducedMotion) {
      setTypingState({
        typedTitle: feature.title,
        typedDesc: feature.description,
        isTitleDone: true,
        isDescDone: true,
        showCursor: false,
        cursorTarget: "none",
      });
      setIsExiting(false);
      return;
    }

    // Pergantian step: teks lama fade out 300ms jika step sebelumnya berbeda
    const isStepChange = activeStepRef.current !== step;
    activeStepRef.current = step;

    // Batalkan typing yang sedang berjalan jika ada
    typingControllerRef.current?.cancel();

    if (isStepChange) {
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        setIsExiting(false);
        startTyping();
      }, 300);
      return () => clearTimeout(exitTimer);
    } else {
      setIsExiting(false);
      startTyping();
    }

    function startTyping() {
      const controller = createTypingController({
        title: feature.title,
        description: feature.description,
        titleCharMs: 35,
        descCharMs: 18,
        cursorHideDelayMs: 1000,
        onUpdate: (state) => {
          setTypingState(state);
        },
      });
      typingControllerRef.current = controller;
      controller.start();
    }

    return () => {
      typingControllerRef.current?.cancel();
    };
  }, [step, isActive, feature.title, feature.description, isReducedMotion]);

  if (!isActive && isExiting) {
    // Sembunyi halus
  }

  return (
    <div
      className={`relative z-20 w-full transition-all duration-300 ease-out ${
        isMobile
          ? "text-center px-4 max-w-md mx-auto"
          : "text-left max-w-[520px]"
      } ${
        !isActive
          ? "opacity-0 pointer-events-none translate-y-4"
          : isExiting
          ? "opacity-0 blur-[6px] translate-x-4 pointer-events-none"
          : "opacity-100 blur-0 translate-x-0"
      }`}
    >
      {/* 1. Aksesibilitas Pembaca Layar: Teks Penuh & Pengumuman Live Region */}
      <div className="sr-only" aria-live="polite">
        Fitur aktif: {feature.title}. {feature.description}
      </div>

      {/* 
        2. Teks Penuh Tak Terlihat (Invisible) untuk Mencegah Layout Shift
        Elemen ini menjaga tinggi dan lebar kontainer stabil saat teks sedang diketik.
      */}
      <div className="invisible select-none" aria-hidden="true">
        <h3 className="font-display font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(2rem,4.2vw,3.75rem)] text-white mb-3">
          {feature.title}
        </h3>
        <p className="font-display font-normal leading-[1.6] text-[clamp(1rem,1.35vw,1.25rem)] text-white/75">
          {feature.description}
        </p>
      </div>

      {/* 3. Teks Animasi Aktual yang Sedang Diketik */}
      <div
        className="absolute inset-0 select-none"
        aria-hidden="true"
      >
        <h3 className="font-display font-semibold tracking-[-0.03em] leading-[1.08] text-[clamp(2rem,4.2vw,3.75rem)] text-white mb-3 drop-shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          {typingState.typedTitle}
          {typingState.showCursor && typingState.cursorTarget === "title" && (
            <span className="inline-block w-[3px] h-[0.82em] bg-cyan-400 ml-1.5 align-middle animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          )}
        </h3>

        <p className="font-display font-normal leading-[1.6] text-[clamp(1rem,1.35vw,1.25rem)] text-white/75 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
          {typingState.typedDesc}
          {typingState.showCursor && typingState.cursorTarget === "desc" && (
            <span className="inline-block w-[2.5px] h-[0.82em] bg-cyan-300 ml-1 align-middle animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
          )}
        </p>
      </div>
    </div>
  );
};

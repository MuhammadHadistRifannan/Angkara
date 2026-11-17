import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Component,
  type ReactNode,
} from "react";
import { useGLTF } from "@react-three/drei";
import { MAIN_FEATURES_3D, SECONDARY_FEATURES } from "./data";
import { CanvasStage } from "./CanvasStage";
import { SecondaryFeatures } from "./SecondaryFeatures";
import { Features2DFallback } from "./Features2DFallback";
import { FeatureDescriptionPanel } from "./FeatureDescriptionPanel";
import {
  useSectionStep,
  getFeaturesSceneState,
  FEATURES_STEP_COUNT,
} from "../landing/useSectionStep";
import { useSnapAssist } from "../landing/useSnapAssist";
import { updateDebugOverlay } from "../landing/debugStore";

// WebGL Error Boundary Fallback
class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Features3D: WebGL render failed, falling back to 2D grid.", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Salinan judul intro diperbesar sinematik (clamp 2.5rem - 6.5rem)
const INTRO_TITLE_LINE_1 = ["Lima", "alasan"];
const INTRO_TITLE_LINE_2 = ["berlayar", "tanpa", "ragu."];
const SUBTITLE_TEXT = "Dari verifikasi sampai pembayaran, semuanya terjaga.";

export const FeaturesStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const slotIntroRef = useRef<HTMLDivElement>(null);
  const slotFeatureRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isEntered, setIsEntered] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0.5);
  const [exitProgress, setExitProgress] = useState(0);

  // 1. Single State Machine untuk Fitur 3D via useSectionStep (7 sentinel termasuk sentinel keluar)
  const { step: currentStep } = useSectionStep(containerRef, FEATURES_STEP_COUNT, {
    hysteresisRatio: 0.08,
  });

  // 2. Snap Assist khusus desktop
  useSnapAssist({
    containerRef,
    sentinelCount: FEATURES_STEP_COUNT,
    pauseMs: 140,
  });

  // 3. Cek kapabilitas browser: WebGL, Mobile, & Reduced Motion
  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        return Boolean(gl);
      } catch {
        return false;
      }
    };

    setHasWebGL(checkWebGL());

    const mediaQueryMobile = window.matchMedia("(max-width: 767px)");
    const mediaQueryMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    setIsMobile(mediaQueryMobile.matches);
    setPrefersReducedMotion(mediaQueryMotion.matches);

    const updateMobile = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const updateMotion = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);

    mediaQueryMobile.addEventListener("change", updateMobile);
    mediaQueryMotion.addEventListener("change", updateMotion);

    return () => {
      mediaQueryMobile.removeEventListener("change", updateMobile);
      mediaQueryMotion.removeEventListener("change", updateMotion);
    };
  }, []);

  // 4. Preload semua 5 model GLTF agar siap saat scroll
  useEffect(() => {
    if (!hasWebGL) return;
    MAIN_FEATURES_3D.forEach((feature) => {
      useGLTF.preload(feature.modelUrl);
    });
  }, [hasWebGL]);

  // 5. Observer Visibilitas Section Panggung untuk mematikan render 3D saat di luar layar
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          setIsEntered(true);
        }
      },
      { threshold: 0.05, rootMargin: "100px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 6. Pelacakan scroll progress & deteksi exit sentinel
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const el = containerRef.current;
          if (el) {
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            const totalDist = rect.height - vh;
            const scrolledDist = -rect.top;
            const progress = Math.max(0, Math.min(1, scrolledDist / Math.max(1, totalDist)));
            setScrollProgress(progress);

            // Deteksi keluar panggung (saat di sentinel ke-6 / langkah terakhir)
            const remaining = rect.bottom - vh;
            if (remaining < vh) {
              const exit = Math.max(0, Math.min(1, 1 - remaining / vh));
              setExitProgress(exit);
            } else {
              setExitProgress(0);
            }

            // Sinkronisasi ke Debug Overlay
            const scene = getFeaturesSceneState(currentStep);
            updateDebugOverlay("features", {
              step: currentStep,
              modelIndex: scene.modelIndex,
              modelActiveId: scene.modelActiveId,
              scrollProgress: progress,
              typingStatus: scene.textActive ? "typing" : "idle",
            });
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentStep]);

  // 7. Lompat ke Sentinel saat Titik Indikator Diklik
  const handleSelectFeature = useCallback((featureIndex: number) => {
    const el = containerRef.current;
    if (!el) return;
    const sentinelHeight = el.offsetHeight / FEATURES_STEP_COUNT;
    const targetScrollY = el.offsetTop + (featureIndex + 1) * sentinelHeight;
    window.scrollTo({ top: targetScrollY, behavior: "smooth" });
  }, []);

  if (!hasWebGL) {
    return <Features2DFallback />;
  }

  // Dapatkan scene state murni dari step (Perbaikan F1: Indeks model deterministik)
  const sceneState = getFeaturesSceneState(currentStep);
  const activeFeature = MAIN_FEATURES_3D[sceneState.modelIndex];
  const isIntro = sceneState.isIntro;

  let wordCounter = 0;

  return (
    <WebGLErrorBoundary fallback={<Features2DFallback />}>
      {/* 
        PEMBUNGKUS SCROLL (SCROLLCRAFT):
        Setinggi ~700vh (atau 560svh di mobile) untuk menampung 7 sentinel (1 intro + 5 fitur + 1 exit).
        Menyediakan ruang cukup di akhir agar section berikutnya tidak menimpa (Perbaikan F4).
      */}
      <div
        ref={containerRef}
        id="features"
        className="relative w-full bg-[hsl(var(--features-bg-top))]"
        style={{ height: isMobile ? "560svh" : "700vh" }}
      >
        {/* 7 Sentinel Tidak Terlihat */}
        <div className="absolute inset-0 pointer-events-none flex flex-col">
          {Array.from({ length: FEATURES_STEP_COUNT }).map((_, idx) => (
            <div
              key={idx}
              data-features-step={idx}
              className="w-full flex-1"
            />
          ))}
        </div>

        {/* 
          KONTEN STICKY SINEMATIK (H-[100SVH]):
          Ter-pin di layar selama pengguna menggulir ke-7 langkah.
          Padding atas 140px menjamin bebas tabrakan dengan Liquid Glass Navbar.
        */}
        <div
          className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col justify-between pt-[130px] sm:pt-[140px] pb-6 px-4 sm:px-6 select-none transition-opacity duration-300"
          style={{
            opacity: sceneState.isExit ? Math.max(0, 1 - exitProgress * 1.5) : 1,
          }}
        >
          {/* LAPISAN LATAR SECTION */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--features-bg-top))] via-[#041d2f] via-45% to-[#020b17]" />

            {/* Spotlight Beam Sinematik */}
            <div
              className="absolute -top-24 w-[950px] h-[1100px] pointer-events-none transition-all duration-700 ease-out"
              style={{
                left: isMobile ? "50%" : isIntro ? "50%" : "28%",
                transform: "translateX(-50%)",
                opacity: isEntered ? Math.max(0, 0.9 * (1 - exitProgress)) : 0,
                background:
                  "conic-gradient(from 180deg at 50% 0%, rgba(254, 243, 199, 0.28) 0deg, rgba(56, 189, 248, 0.16) 18deg, rgba(2, 6, 23, 0) 45deg, rgba(2, 6, 23, 0) 315deg, rgba(56, 189, 248, 0.16) 342deg, rgba(254, 243, 199, 0.28) 360deg)",
                maskImage:
                  "radial-gradient(ellipse 70% 90% at 50% 0%, black 20%, rgba(0,0,0,0.65) 55%, transparent 85%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 70% 90% at 50% 0%, black 20%, rgba(0,0,0,0.65) 55%, transparent 85%)",
                mixBlendMode: "screen",
                filter: "blur(18px)",
              }}
            />

            {/* Grain Dither Halus */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.025]"
              aria-hidden="true"
            >
              <filter id="features-stage-dither">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.8"
                  numOctaves="3"
                  stitchTiles="stitch"
                />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 1 0"
                />
              </filter>
              <rect width="100%" height="100%" filter="url(#features-stage-dither)" />
            </svg>
          </div>

          {/* 
            ZONA KONTEN UTAMA DENGAN DOM SLOTS (Perbaikan F1, F2):
            Slot Intro dan Slot Fitur berada dalam satu hierarki DOM yang terukur.
          */}
          <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex flex-col justify-between">
            {/* 
              A. BLOK JUDUL INTRO BESAR (Step 0):
              Ukuran adaptif min(8vw, 14svh, 6.5rem) agar muat di layar pendek (1064x671).
            */}
            <div
              className={`text-center px-4 max-w-6xl xl:max-w-7xl mx-auto transition-all duration-500 ease-out ${
                isIntro
                  ? "opacity-100 blur-0 translate-y-0"
                  : "opacity-0 blur-[10px] -translate-y-8 pointer-events-none"
              }`}
            >
              <h2 className="font-display font-semibold tracking-[-0.04em] leading-[1.04] text-[clamp(2.5rem,min(8vw,14svh),6.5rem)] drop-shadow-[0_4px_40px_rgba(0,0,0,0.35)]">
                {/* Baris 1: Putih Penuh */}
                <div className="text-white flex items-center justify-center flex-wrap gap-x-3.5 sm:gap-x-5">
                  <span className="inline-flex items-center gap-x-2.5 sm:gap-x-3.5 whitespace-nowrap">
                    {INTRO_TITLE_LINE_1.map((word) => {
                      const delay = prefersReducedMotion ? 0 : wordCounter++ * 70;
                      return (
                        <span
                          key={word}
                          className="inline-block overflow-hidden pb-1 align-bottom"
                        >
                          <span
                            className="inline-block transition-all"
                            style={{
                              transitionDuration: "900ms",
                              transform:
                                isEntered || prefersReducedMotion
                                  ? "translateY(0)"
                                  : "translateY(110%)",
                              filter:
                                isEntered || prefersReducedMotion
                                  ? "blur(0px)"
                                  : "blur(12px)",
                              letterSpacing:
                                isEntered || prefersReducedMotion
                                  ? "-0.04em"
                                  : "0.06em",
                              opacity: isEntered || prefersReducedMotion ? 1 : 0,
                              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                              transitionDelay: `${delay}ms`,
                            }}
                          >
                            {word}
                          </span>
                        </span>
                      );
                    })}
                  </span>
                </div>

                {/* Baris 2: Putih Opacity 0.7 */}
                <div className="text-white/70 flex items-center justify-center flex-wrap gap-x-3.5 sm:gap-x-5 mt-1 sm:mt-2">
                  <span className="inline-flex items-center gap-x-2.5 sm:gap-x-3.5 whitespace-nowrap">
                    {INTRO_TITLE_LINE_2.map((word) => {
                      const delay = prefersReducedMotion ? 0 : wordCounter++ * 70;
                      return (
                        <span
                          key={word}
                          className="inline-block overflow-hidden pb-1 align-bottom"
                        >
                          <span
                            className="inline-block transition-all"
                            style={{
                              transitionDuration: "900ms",
                              transform:
                                isEntered || prefersReducedMotion
                                  ? "translateY(0)"
                                  : "translateY(110%)",
                              filter:
                                isEntered || prefersReducedMotion
                                  ? "blur(0px)"
                                  : "blur(12px)",
                              letterSpacing:
                                isEntered || prefersReducedMotion
                                  ? "-0.04em"
                                  : "0.06em",
                              opacity: isEntered || prefersReducedMotion ? 1 : 0,
                              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                              transitionDelay: `${delay}ms`,
                            }}
                          >
                            {word}
                          </span>
                        </span>
                      );
                    })}
                  </span>
                </div>
              </h2>

              {/* Subteks: disembunyikan otomatis bila tinggi layar pendek (<700px) agar tidak tertabrak model */}
              <p
                className="mt-3 sm:mt-5 text-sm sm:text-base md:text-lg text-slate-300 max-w-xl mx-auto transition-all duration-700 ease-out hidden sm:block"
                style={{
                  opacity: isEntered || prefersReducedMotion ? 1 : 0,
                  transform:
                    isEntered || prefersReducedMotion ? "translateY(0)" : "translateY(12px)",
                  transitionDelay: "600ms",
                }}
              >
                {SUBTITLE_TEXT}
              </p>
            </div>

            {/* 
              DOM SLOT INTRO:
              Menentukan posisi fisik model shield di Intro (tengah bawah).
            */}
            <div
              ref={slotIntroRef}
              className={`w-full max-w-md mx-auto h-[40svh] max-h-[360px] pointer-events-none transition-opacity duration-300 ${
                isIntro ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* 
              B. GRID KONTEN FITUR 1-5 (DUA KOLOM SEJAJAR):
              Kolom Kiri = Slot DOM Model 3D. Kolom Kanan = Panel Deskripsi Teks.
              Menjamin model dan teks SELALU sejajar vertikal tanpa meleset.
            */}
            <div
              className={`absolute inset-x-0 bottom-12 top-28 sm:top-36 grid grid-cols-1 md:grid-cols-2 items-center px-4 sm:px-8 transition-opacity duration-500 ${
                !isIntro && !sceneState.isExit
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Kolom Kiri: DOM Slot Model Fitur */}
              <div className="flex items-center justify-center h-full max-h-[500px]">
                <div
                  ref={slotFeatureRef}
                  className="w-full max-w-sm sm:max-w-md h-[55svh] max-h-[440px] pointer-events-none"
                />
              </div>

              {/* Kolom Kanan: Panel Deskripsi */}
              <div className="flex items-center justify-center md:justify-start h-full">
                <FeatureDescriptionPanel
                  key={activeFeature.id}
                  feature={activeFeature}
                  isActive={!isIntro && !sceneState.isExit}
                  isMobile={isMobile}
                  isReducedMotion={prefersReducedMotion}
                />
              </div>
            </div>

            {/* 
              C. KANVAS 3D SELEBAR PANGGUNG:
              Menampung model 3D yang diproyeksikan langsung ke koordinat slot DOM.
            */}
            <CanvasStage
              activeFeature={activeFeature}
              step={currentStep}
              isVisible={isVisible}
              isEntered={isEntered}
              pulseTrigger={currentStep}
              isMobile={isMobile}
              isReducedMotion={prefersReducedMotion}
              scrollProgress={scrollProgress}
              slotIntroRef={slotIntroRef}
              slotFeatureRef={slotFeatureRef}
            />
          </div>

          {/* 
            D. 5 TITIK INDIKATOR PROGRES DI BAWAH PANGGUNG
          */}
          <div className="relative z-30 flex flex-col items-center justify-center pb-2">
            <div
              role="tablist"
              aria-label="Progres Fitur 3D"
              className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/10 transition-opacity duration-500 ${
                isIntro ? "opacity-40 hover:opacity-80" : "opacity-90"
              }`}
            >
              {MAIN_FEATURES_3D.map((item, idx) => {
                const isActive = !isIntro && idx === sceneState.modelIndex;
                return (
                  <button
                    key={item.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Lompat ke fitur ${item.title}`}
                    onClick={() => handleSelectFeature(idx)}
                    className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      isActive
                        ? "w-7 bg-cyan-400 shadow-[0_0_12px_rgba(14,165,233,0.8)]"
                        : "w-2 bg-white/25 hover:bg-white/50"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 
        Section Fitur Pendukung (Dan Masih Banyak Lagi):
        Diletakkan SETELAH pembungkus 700vh dengan latar opak dan z-20 agar TIDAK menimpa Fitur 5 (Perbaikan F4).
      */}
      <section
        id="secondary-features"
        className="relative z-20 bg-[#020b17] text-white py-20 mt-0"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SecondaryFeatures features={SECONDARY_FEATURES} />
        </div>
      </section>
    </WebGLErrorBoundary>
  );
};

export default FeaturesStage;

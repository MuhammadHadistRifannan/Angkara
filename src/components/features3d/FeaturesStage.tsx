import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Component,
  lazy,
  Suspense,
  type ReactNode,
} from "react";
import { MAIN_FEATURES_3D, SECONDARY_FEATURES } from "./data";
import { FeatureIllustration } from "./FeatureIllustration";
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

// Panggung fitur memakai ilustrasi SVG buatan sendiri (ringan, satu gaya).
// Set ke true untuk mengembalikan model 3D (.glb) seperti semula.
// CanvasStage dimuat malas, jadi Three.js tidak diunduh selama flag ini false.
const USE_3D_MODELS = false;
const CanvasStage = lazy(() =>
  import("./CanvasStage").then((m) => ({ default: m.CanvasStage }))
);

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
const INTRO_TITLE_LINE_1 = ["Cara", "Suar", "mengurus"];
const INTRO_TITLE_LINE_2 = ["satu", "perjalanan."];
const SUBTITLE_TEXT = "Lima bagian sistem, dari daftar kapal sampai pembayaran.";

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
  const lastProgressRef = useRef(0.5);
  const [exitProgress, setExitProgress] = useState(0);

  // Posisi horizontal spotlight beam & glow yang adaptif mengikuti model 3D
  const [featureSlotCenterX, setFeatureSlotCenterX] = useState<number>(38.5);

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

  // 5.5 Ukur posisi horizontal slot fitur DOM untuk melaraskan Spotlight Beam
  useEffect(() => {
    const updateSlotPos = () => {
      if (typeof window === "undefined") return;
      if (slotFeatureRef.current) {
        const rect = slotFeatureRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          const centerX = rect.left + rect.width / 2;
          const pct = (centerX / window.innerWidth) * 100;
          setFeatureSlotCenterX(Math.round(pct * 10) / 10);
        }
      }
    };

    updateSlotPos();
    window.addEventListener("resize", updateSlotPos);
    const raf = requestAnimationFrame(updateSlotPos);
    return () => {
      window.removeEventListener("resize", updateSlotPos);
      cancelAnimationFrame(raf);
    };
  }, [currentStep, isMobile]);

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
            if (Math.abs(progress - lastProgressRef.current) >= 0.004 || progress === 0 || progress === 1) {
              lastProgressRef.current = progress;
              setScrollProgress(progress);
            }

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

  if (USE_3D_MODELS && !hasWebGL) {
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
        Setinggi ~460vh (atau 400svh di mobile) untuk menampung 7 sentinel (1 intro + 5 fitur + 1 exit).
        Menyediakan ruang cukup di akhir agar section berikutnya tidak menimpa (Perbaikan F4).
      */}
      <div
        ref={containerRef}
        id="features"
        className="relative w-full bg-[hsl(var(--features-bg-top))]"
        style={{ height: isMobile ? "400svh" : "460vh" }}
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
        */}
        <div
          className="sticky top-0 h-[100svh] w-full overflow-hidden select-none transition-opacity duration-300"
          style={{
            opacity: sceneState.isExit ? Math.max(0, 1 - exitProgress * 1.5) : 1,
          }}
        >
          {/* LAPISAN LATAR SECTION */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--features-bg-top))] via-[#041d2f] via-45% to-[#020b17]" />

            {/* Cahaya lembut di belakang model 3D: satu sumber saja, tanpa sorot kerucut/noise */}
            <div
              className="absolute w-[560px] h-[560px] rounded-full pointer-events-none transition-all duration-700 ease-out"
              style={{
                left: isMobile || isIntro ? "50%" : `${featureSlotCenterX}%`,
                top: isMobile ? "40%" : isIntro ? "62%" : "50%",
                transform: "translate(-50%, -50%)",
                opacity: isEntered ? (isIntro ? 0.3 : 0.4) * (1 - exitProgress) : 0,
                background:
                  "radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(2, 6, 23, 0) 68%)",
                filter: "blur(32px)",
              }}
            />
          </div>

          {/* 
            MODEL 3D (OPSIONAL, hanya bila USE_3D_MODELS = true):
            Kanvas selebar panggung yang memproyeksikan model ke koordinat slot DOM.
          */}
          {USE_3D_MODELS && (
            <Suspense fallback={null}>
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
            </Suspense>
          )}

          {/* 
            A. ZONA INTRO (STEP 0):
            Judul besar di atas + DOM Slot Intro di bawah tengah.
          */}
          <div
            className={`absolute inset-0 flex flex-col justify-between pt-[120px] sm:pt-[130px] pb-16 px-4 sm:px-6 pointer-events-none transition-all duration-500 ease-out z-20 ${
              isIntro
                ? "opacity-100 blur-0 translate-y-0"
                : "opacity-0 blur-[10px] -translate-y-8 pointer-events-none"
            }`}
          >
            {/* Blok Judul Intro Besar */}
            <div className="text-center px-4 max-w-6xl xl:max-w-7xl mx-auto">
              <h2 className="font-display font-semibold tracking-[-0.04em] leading-[1.04] text-[clamp(2.5rem,min(7vw,13svh),5.75rem)]">
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
              className="w-full max-w-sm sm:max-w-md mx-auto h-[38svh] max-h-[340px] pointer-events-none"
            >
              {!USE_3D_MODELS && <FeatureIllustration id="intro" />}
            </div>
          </div>

          {/* 
            B. GRID KONTEN FITUR 1-5 (DIPUSATKAN DI TENGAH LAYAR / MIDDLE):
            Kolom Kiri = Slot DOM Model 3D (ditarik lebih ke tengah/middle).
            Kolom Kanan = Panel Deskripsi Teks (sejajar vertikal di tengah/middle).
          */}
          <div
            className={`absolute inset-0 flex items-center justify-center pt-16 sm:pt-20 pb-12 sm:pb-14 px-4 sm:px-8 pointer-events-none transition-opacity duration-200 z-20 ${
              !isIntro && !sceneState.isExit
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="w-full max-w-5xl lg:max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-6 sm:gap-10 lg:gap-14">
              {/* Kolom Kiri: DOM Slot Model Fitur (Lebih ke tengah) */}
              <div className="flex items-center justify-center md:justify-end">
                <div
                  ref={slotFeatureRef}
                  className="w-full max-w-xs sm:max-w-sm md:max-w-[380px] h-[45svh] max-h-[400px] pointer-events-none"
                >
                  {!USE_3D_MODELS && (
                    <FeatureIllustration
                      key={isIntro ? "idle" : activeFeature.id}
                      id={activeFeature.id}
                    />
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Panel Deskripsi */}
              <div className="flex items-center justify-center md:justify-start">
                <FeatureDescriptionPanel
                  key={activeFeature.id}
                  feature={activeFeature}
                  index={sceneState.modelIndex}
                  total={MAIN_FEATURES_3D.length}
                  isActive={!isIntro && !sceneState.isExit}
                  isMobile={isMobile}
                  isReducedMotion={prefersReducedMotion}
                />
              </div>
            </div>
          </div>

          {/* 
            C. 5 TITIK INDIKATOR PROGRES DI BAWAH PANGGUNG
          */}
          <div className="absolute bottom-3 sm:bottom-4 inset-x-0 z-30 flex flex-col items-center justify-center pointer-events-auto">
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
                        ? "w-7 bg-white"
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
        Diletakkan SETELAH pembungkus 460vh dengan latar opak dan z-20 agar TIDAK menimpa Fitur 5 (Perbaikan F4).
        Perpotongan dengan section berikutnya dibuat menyatu mulus dalam tema kanvas bahari.
      */}
      <section
        id="secondary-features"
        className="relative z-20 bg-[#020b17] text-white pt-16 pb-0 mt-0 overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SecondaryFeatures features={SECONDARY_FEATURES} />
        </div>

        {/* Transisi Ombak Halus Menuju Pesisir Cilacap & Mengapa Wisatawan Memilih Platform SUAR */}
        <div className="relative w-full overflow-hidden leading-none -mb-px mt-16" aria-hidden="true">
          <svg
            viewBox="0 0 1440 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-14 sm:h-20 block"
            preserveAspectRatio="none"
          >
            <path
              d="M0,42 C320,85 640,15 960,58 C1200,88 1360,35 1440,42 L1440,96 L0,96 Z"
              fill="#F8FAFC"
            />
          </svg>
        </div>
      </section>
    </WebGLErrorBoundary>
  );
};

export default FeaturesStage;

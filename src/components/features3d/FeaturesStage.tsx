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
  calculateStepFromSentinel,
  getFeatureIndexForStep,
  isIntroStep,
  STEP_COUNT,
  TOTAL_FEATURES,
} from "./scrollStep";

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

// Salinan judul intro diperbesar sinematik (clamp 3.25rem - 8rem)
const INTRO_TITLE_LINE_1 = ["Lima", "alasan"];
const INTRO_TITLE_LINE_2 = ["berlayar", "tanpa", "ragu."];
const SUBTITLE_TEXT = "Dari verifikasi sampai pembayaran, semuanya terjaga.";

export const FeaturesStage = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0 (Intro) s.d. 5 (Fitur 5)
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isEntered, setIsEntered] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0.5);
  const [exitProgress, setExitProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 1. Cek kapabilitas browser: WebGL, Mobile, & Reduced Motion
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

  // 2. Preload semua 5 model GLTF agar siap saat scroll
  useEffect(() => {
    if (!hasWebGL) return;
    MAIN_FEATURES_3D.forEach((feature) => {
      useGLTF.preload(feature.modelUrl);
    });
  }, [hasWebGL]);

  // 3. IntersectionObserver pada 6 Sentinel dengan trigger garis tengah viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepAttr = entry.target.getAttribute("data-step");
            if (stepAttr !== null) {
              const step = calculateStepFromSentinel(parseInt(stepAttr, 10));
              setCurrentStep(step);
              setIsEntered(true);
            }
          }
        });
      },
      { rootMargin: "-48% 0px -48% 0px" }
    );

    sentinelRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // 4. Observer Visibilitas Section Panggung untuk mematikan render 3D saat di luar layar
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

  // 5. Parallax Scroll & Exit Detection saat mendekati akhir pembungkus 600vh
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

            // Deteksi keluar section (setelah sentinel terakhir terlewati)
            const remaining = rect.bottom - vh;
            if (remaining < vh * 0.5) {
              const exit = Math.max(0, Math.min(1, 1 - remaining / (vh * 0.5)));
              setExitProgress(exit);
            } else {
              setExitProgress(0);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 6. Lompat ke Sentinel saat Titik Indikator Diklik
  const handleSelectFeature = useCallback((featureIndex: number) => {
    const targetSentinel = sentinelRefs.current[featureIndex + 1];
    if (targetSentinel) {
      targetSentinel.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  if (!hasWebGL) {
    return <Features2DFallback />;
  }

  const activeFeatureIndex = getFeatureIndexForStep(currentStep);
  const activeFeature = MAIN_FEATURES_3D[activeFeatureIndex];
  const isIntro = isIntroStep(currentStep);

  let wordCounter = 0;

  return (
    <WebGLErrorBoundary fallback={<Features2DFallback />}>
      {/* 
        PEMBUNGKUS SCROLL (SCROLLCRAFT):
        Setinggi ~600vh (atau 600svh di mobile) untuk menampung 6 sentinel (1 intro + 5 fitur).
      */}
      <div
        ref={containerRef}
        id="features"
        className="relative w-full bg-[hsl(var(--features-bg-top))]"
        style={{ height: isMobile ? "480svh" : "600vh" }}
      >
        {/* 
          6 SENTINEL TIDAK TERLIHAT (H-SCREEN / 100SVH TIAP LANGKAH):
          Dideteksi oleh IntersectionObserver dengan rootMargin: "-50% 0px -50% 0px".
        */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: STEP_COUNT }).map((_, idx) => (
            <div
              key={idx}
              ref={(el) => {
                sentinelRefs.current[idx] = el;
              }}
              data-step={idx}
              className="w-full"
              style={{ height: isMobile ? "80svh" : "100vh" }}
            />
          ))}
        </div>

        {/* 
          KONTEN STICKY SINEMATIK (H-[100SVH]):
          Ter-pin di layar selama pengguna menggulir ke-6 langkah.
          Padding atas 140px menjamin bebas tabrakan dengan Liquid Glass Navbar.
        */}
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col justify-between pt-[140px] pb-6 px-4 sm:px-6 select-none">
          {/* LAPISAN LATAR SECTION: Menyatu tanpa batas kotak atau garis potong */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* 1. Base Gradient: Dari --features-bg-top ke kedalaman teal laut #020b17 */}
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--features-bg-top))] via-[#041d2f] via-45% to-[#020b17]" />

            {/* 
              2. Spotlight Beam Sinematik:
              Bergeser mulus mengikuti model: di Intro di tengah (50%), di Fitur 1-5 di kiri (28% di desktop).
            */}
            <div
              className="absolute -top-24 w-[950px] h-[1100px] pointer-events-none transition-all duration-700 ease-out"
              style={{
                left: isMobile ? "50%" : isIntro ? "50%" : "28%",
                transform: "translateX(-50%)",
                opacity: isEntered ? Math.max(0, 0.9 * (1 - exitProgress)) : 0,
                background:
                  "conic-gradient(from 180deg at 50% 0%, transparent 66deg, rgba(255,251,235,0.09) 78deg, rgba(255,251,235,0.16) 90deg, rgba(255,251,235,0.09) 102deg, transparent 114deg)",
                maskImage:
                  "radial-gradient(ellipse 75% 82% at 50% 32%, black 20%, transparent 80%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 75% 82% at 50% 32%, black 20%, transparent 80%)",
                mixBlendMode: "screen",
              }}
            />

            {/* 3. Anamorphic Horizontal Lens Streak di Titik Lampu Atas (Hanya Desktop) */}
            {!isMobile && (
              <div
                className="absolute top-6 left-1/2 -translate-x-1/2 w-[460px] h-[2px] bg-gradient-to-r from-transparent via-cyan-300/50 via-50% to-transparent pointer-events-none blur-[0.8px] transition-opacity duration-1000"
                style={{ opacity: isEntered ? 0.35 * (1 - exitProgress) : 0 }}
              />
            )}

            {/* 4. Kolam Cahaya Lembut Elips di Sekitar Bawah Model */}
            <div
              className="absolute top-[65%] w-[720px] h-[480px] bg-sky-500/[0.07] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ease-out"
              style={{
                left: isMobile ? "50%" : isIntro ? "50%" : "28%",
                transform: "translate(-50%, -50%)",
                opacity: isEntered ? Math.max(0, 1 - exitProgress) : 0,
              }}
            />

            {/* 5. Micro-dither grain tipis (opacity 0.02) untuk meniadakan color banding */}
            <svg
              className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <filter id="features-stage-dither">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.8"
                  numOctaves="3"
                  stitchTiles="stitch"
                />
              </filter>
              <rect width="100%" height="100%" filter="url(#features-stage-dither)" />
            </svg>
          </div>

          {/* 
            ZONA KONTEN UTAMA:
            Intro (Step 0) vs Fitur (Step 1-5)
          */}
          <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex items-center justify-center">
            {/* 
              A. BLOK JUDUL INTRO BESAR (Step 0):
              Menempati zona atas (14% s.d. 46% tinggi layar).
              Memudar ke atas (translateY -40px, blur 10px, opacity 0) saat beralih ke Fitur 1 (step >= 1).
            */}
            <div
              className="absolute top-4 sm:top-6 inset-x-0 z-20 text-center px-4 max-w-6xl xl:max-w-7xl mx-auto transition-all duration-500 ease-out"
              style={{
                transform: prefersReducedMotion
                  ? "none"
                  : isIntro
                  ? "translateY(0)"
                  : "translateY(-40px)",
                opacity: isIntro ? 1 : 0,
                filter: prefersReducedMotion ? "none" : isIntro ? "blur(0px)" : "blur(10px)",
                pointerEvents: isIntro ? "auto" : "none",
              }}
            >
              {/* Judul Utama Raksasa Diperbesar Sesuai Prompt Revisi 4 */}
              <h2 className="font-display font-semibold tracking-[-0.04em] leading-[1.04] text-[clamp(2.75rem,6.8vw,6.25rem)] drop-shadow-[0_4px_40px_rgba(0,0,0,0.35)]">
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

              {/* Subteks Satu Baris Kecil (Hanya di Intro) */}
              <p
                className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-slate-300 max-w-xl mx-auto transition-all duration-700 ease-out"
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
              B. KANVAS 3D SELEBAR PANGGUNG:
              Menampung model 3D yang berpindah dari tengah ke kiri dengan spring physics.
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
            />

            {/* 
              C. PANEL DESKRIPSI DI KANAN (Step 1-5):
              Mulai sekitar 55% lebar layar di desktop, tengah vertikal, lebar maks 520px.
              Di mobile berada di separuh bawah panggung, rata tengah.
            */}
            <div
              className={`absolute z-20 transition-all duration-500 ease-out ${
                isMobile
                  ? "bottom-12 inset-x-0 flex justify-center"
                  : "top-1/2 -translate-y-1/2 left-[54%] xl:left-[56%] flex items-center"
              }`}
            >
              <FeatureDescriptionPanel
                key={activeFeature.id}
                feature={activeFeature}
                isActive={!isIntro}
                step={currentStep}
                isMobile={isMobile}
                isReducedMotion={prefersReducedMotion}
              />
            </div>
          </div>

          {/* 
            D. 5 TITIK INDIKATOR PROGRES DI BAWAH PANGGUNG:
            Bisa diklik atau navigasi keyboard untuk melompat langsung ke sentinel fitur terkait.
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
                const isActive = !isIntro && idx === activeFeatureIndex;
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
        Menyatu mulus langsung dari dasar panggung ke latar #020b17 tanpa garis batas pemisah.
      */}
      <section
        id="secondary-features"
        className="relative z-10 bg-[#020b17] text-white py-16"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SecondaryFeatures features={SECONDARY_FEATURES} />
        </div>
      </section>
    </WebGLErrorBoundary>
  );
};

export default FeaturesStage;

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Component,
  type ReactNode,
  type TouchEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGLTF } from "@react-three/drei";
import { MAIN_FEATURES_3D, SECONDARY_FEATURES } from "./data";
import { CanvasStage } from "./CanvasStage";
import { SecondaryFeatures } from "./SecondaryFeatures";
import { Features2DFallback } from "./Features2DFallback";

// Keterangan nama fitur di bawah panggung
const SHOW_CAPTION = true;

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

// Salinan judul sinematik dua baris (mudah disesuaikan lewat konstanta)
const TITLE_LINE_1 = ["Lima", "alasan"];
const TITLE_LINE_2 = ["berlayar", "tanpa", "ragu."];
const SUBTITLE_TEXT = "Dari verifikasi sampai pembayaran, semuanya terjaga.";

export const FeaturesStage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isEntered, setIsEntered] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0.5);
  const [titleExitProgress, setTitleExitProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);

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

    const mediaQueryMobile = window.matchMedia("(max-width: 1023px)");
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

  // 2. Preload model aktif + model tetangga
  useEffect(() => {
    if (!hasWebGL) return;
    useGLTF.preload(MAIN_FEATURES_3D[activeIndex].modelUrl);
    useGLTF.preload(
      MAIN_FEATURES_3D[(activeIndex + 1) % MAIN_FEATURES_3D.length].modelUrl
    );
    useGLTF.preload(
      MAIN_FEATURES_3D[
        (activeIndex - 1 + MAIN_FEATURES_3D.length) % MAIN_FEATURES_3D.length
      ].modelUrl
    );
  }, [activeIndex, hasWebGL]);

  // 3. Scrollcraft: IntersectionObserver untuk visibilitas dan entrance ~30% viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.intersectionRatio >= 0.25 || entry.isIntersecting) {
          setIsEntered(true);
        }
      },
      { threshold: [0.1, 0.25, 0.35], rootMargin: "100px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 4. Parallax Scroll Tracker untuk Dolly Kamera dan Exit Parallax Judul
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const el = containerRef.current;
          if (el) {
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            const totalDist = rect.height + vh;
            const currentDist = vh - rect.top;
            const progress = Math.max(0, Math.min(1, currentDist / totalDist));
            setScrollProgress(progress);

            // Parallax keluar judul saat section mulai bergerak lewat atas layar
            if (rect.top < 0) {
              const exit = Math.min(1, Math.abs(rect.top) / (rect.height * 0.45));
              setTitleExitProgress(exit);
            } else {
              setTitleExitProgress(0);
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

  // 5. Handler Navigasi Panah (throttling transisi ±220ms)
  const handlePrev = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setActiveIndex((prev) => (prev - 1 + MAIN_FEATURES_3D.length) % MAIN_FEATURES_3D.length);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 220);
  }, []);

  const handleNext = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setActiveIndex((prev) => (prev + 1) % MAIN_FEATURES_3D.length);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 220);
  }, []);

  const handleSelect = useCallback((index: number) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setActiveIndex(index);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 220);
  }, []);

  // 6. Dukungan Keyboard (ArrowLeft / ArrowRight) saat section terlihat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, handlePrev, handleNext]);

  // 7. Dukungan Gesture Touch Swipe Mobile
  const handleTouchStart = (e: TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    touchStartXRef.current = null;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  if (!hasWebGL) {
    return <Features2DFallback />;
  }

  const activeFeature = MAIN_FEATURES_3D[activeIndex];

  // Hitung stagger delay untuk tiap kata
  let wordCounter = 0;

  return (
    <WebGLErrorBoundary fallback={<Features2DFallback />}>
      {/* 
        Section Panggung Fitur 3D Sinematik:
        Semua cahaya diletakkan di level latar root section (tanpa kotak / overflow pembatas).
      */}
      <section
        ref={containerRef}
        id="features-stage-section"
        className="relative w-full pt-36 sm:pt-40 pb-16 overflow-hidden flex flex-col items-center bg-[hsl(var(--features-bg-top))]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* LAPISAN LATAR SECTION: Menyatu tanpa batas kotak atau garis potong */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* 1. Base Gradient: Dari --features-bg-top ke kedalaman teal laut #020b17 */}
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--features-bg-top))] via-[#041d2f] via-45% to-[#020b17]" />

          {/* 2. Spotlight Beam: Kerucut cahaya lembut bermula dari atas area judul melebar ke bawah */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[950px] h-[1100px] transition-opacity duration-1000 ease-out pointer-events-none"
            style={{
              opacity: isEntered ? 0.9 : 0,
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
              style={{ opacity: isEntered ? 0.35 : 0 }}
            />
          )}

          {/* 4. Kolam Cahaya Lembut Elips di Sekitar Bawah Model (Memudar ke 0 sebelum tepi) */}
          <div
            className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[480px] bg-sky-500/[0.07] rounded-full blur-[140px] pointer-events-none transition-opacity duration-1000"
            style={{ opacity: isEntered ? 1 : 0 }}
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

        {/* 1. BLOK JUDUL SINEMATIK SEPERTI HERO (Z-Index 20, di atas beam, bebas tabrakan) */}
        <div
          className="relative z-20 text-center max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 mb-3 sm:mb-5 transition-transform duration-300 ease-out"
          style={{
            transform: prefersReducedMotion
              ? "none"
              : `translateY(-${titleExitProgress * 40}px)`,
            opacity: prefersReducedMotion ? 1 : Math.max(0.2, 1 - titleExitProgress * 0.7),
          }}
        >
          {/* Eyebrow Kapsul Halus */}
          <div
            className="transition-all duration-700 ease-out mb-3.5"
            style={{
              opacity: isEntered || prefersReducedMotion ? 0.85 : 0,
              transform:
                isEntered || prefersReducedMotion ? "translateY(0)" : "translateY(12px)",
              transitionDelay: "450ms",
            }}
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 tracking-[0.18em] uppercase drop-shadow-sm">
              Fitur Utama Angkara
            </span>
          </div>

          {/* Judul Utama Lebar dengan Per-Word Reveal & Kontras Sinematik */}
          <h2
            className="font-display font-semibold tracking-[-0.03em] leading-[1.12] text-[clamp(1.75rem,3.6vw,3.5rem)] drop-shadow-[0_4px_40px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center justify-center flex-wrap gap-x-3.5 sm:gap-x-4 gap-y-1">
              {/* Frasa 1: Solid Pure White */}
              <span className="inline-flex items-center gap-x-2 sm:gap-x-2.5 text-white whitespace-nowrap">
                {TITLE_LINE_1.map((word) => {
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
                              ? "-0.03em"
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

              {/* Frasa 2: Muted White (70% Opacity) */}
              <span className="inline-flex items-center gap-x-2 sm:gap-x-2.5 text-white/70 whitespace-nowrap">
                {TITLE_LINE_2.map((word) => {
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
                              ? "-0.03em"
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

          {/* Subteks Sinkron 5 Model Panggung */}
          <p
            className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-300 max-w-xl mx-auto transition-all duration-700 ease-out"
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

        {/* 2. PANGGUNG 3D SELEBAR LAYAR (Tanpa Overflow-Hidden yang Memotong Berkas Cahaya) */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex items-center justify-center">
          {/* Tombol Panah Kiri (Liquid Glass) */}
          <button
            onClick={handlePrev}
            aria-label="Fitur sebelumnya"
            className="absolute left-2 sm:left-4 md:left-8 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900/40 hover:bg-slate-900/70 active:scale-95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-center text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 group"
          >
            <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* Kontainer Kanvas WebGL (Transparan, Mask-Image Vertikal & Radial di CanvasStage) */}
          <div className="relative w-full flex items-center justify-center">
            <CanvasStage
              activeFeature={activeFeature}
              isVisible={isVisible}
              isEntered={isEntered}
              pulseTrigger={activeFeature.id}
              isMobile={isMobile}
              isReducedMotion={prefersReducedMotion}
              scrollProgress={scrollProgress}
            />
          </div>

          {/* Tombol Panah Kanan (Liquid Glass) */}
          <button
            onClick={handleNext}
            aria-label="Fitur berikutnya"
            className="absolute right-2 sm:right-4 md:right-8 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900/40 hover:bg-slate-900/70 active:scale-95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-center text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 group"
          >
            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* 3. Keterangan Nama Fitur & 5 Titik Indikator di Bawah Panggung */}
        <div className="relative z-20 text-center mt-2 mb-2">
          {SHOW_CAPTION && (
            <div className="mb-2.5">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                {activeFeature.title}
              </h3>
            </div>
          )}

          {/* 5 Titik Indikator Rata Tengah */}
          <div
            role="tablist"
            aria-label="Indikator fitur 3D"
            className="flex items-center justify-center gap-2"
          >
            {MAIN_FEATURES_3D.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Pilih fitur ${item.title}`}
                  onClick={() => handleSelect(idx)}
                  className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    isActive
                      ? "w-7 bg-cyan-400 shadow-[0_0_12px_rgba(14,165,233,0.8)]"
                      : "w-2 bg-white/25 hover:bg-white/50"
                  }`}
                />
              );
            })}
          </div>

          {/* Pengumuman Aksesibilitas Pembaca Layar */}
          <div aria-live="polite" className="sr-only">
            Fitur aktif: {activeFeature.title}
          </div>
        </div>
      </section>

      {/* 
        Section Fitur Pendukung (Dan Masih Banyak Lagi):
        Menyatu mulus langsung dari dasar panggung ke latar #020b17 tanpa garis batas pemisah.
      */}
      <section
        id="secondary-features"
        className="relative z-10 bg-[#020b17] text-white py-14"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SecondaryFeatures features={SECONDARY_FEATURES} />
        </div>
      </section>
    </WebGLErrorBoundary>
  );
};

export default FeaturesStage;

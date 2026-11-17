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

export const FeaturesStage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isEntered, setIsEntered] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

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

  // 2. Preload model aktif + model tetangga (tanpa tatakan wooden plate)
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

  // 3. Scrollcraft: IntersectionObserver untuk visibilitas dan entrance ~25-35% viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.intersectionRatio >= 0.2 || entry.isIntersecting) {
          setIsEntered(true);
        }
      },
      { threshold: [0.1, 0.2, 0.35], rootMargin: "100px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 4. Handler Navigasi Panah (throttling transisi ±220ms)
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

  // 5. Dukungan Keyboard (ArrowLeft / ArrowRight) saat section terlihat
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

  // 6. Dukungan Gesture Touch Swipe Mobile
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
        handleNext(); // swipe kiri -> ke kanan
      } else {
        handlePrev(); // swipe kanan -> ke kiri
      }
    }
  };

  if (!hasWebGL) {
    return <Features2DFallback />;
  }

  const activeFeature = MAIN_FEATURES_3D[activeIndex];

  return (
    <WebGLErrorBoundary fallback={<Features2DFallback />}>
      {/* 
        Panggung Utama Fitur 3D (Revisi 2):
        - Alur normal (bukan overlay).
        - Padding atas min 140px (pt-36 sm:pt-40) agar judul tidak tertutup navbar fixed.
        - Menyatu mulus dari bawah Hero (--features-bg-top) ke tone teal laut dalam (#020b17).
        - Motif papan catur dihapus.
      */}
      <section
        ref={containerRef}
        id="features-stage-section"
        className="relative w-full pt-36 sm:pt-40 pb-12 overflow-hidden flex flex-col items-center bg-[hsl(var(--features-bg-top))]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Latar Belakang: Gradasi Vertikal Halus Menyatu dari Bawah Hero ke Kedalaman Laut */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* 1. Gradasi vertikal lembut dari --features-bg-top ke tone teal di sekitar panggung lalu ke #020b17 */}
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--features-bg-top))] via-[#041d2f] via-50% to-[#020b17]" />

          {/* 2. Sorot cahaya radial lembut dari atas-tengah panggung */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-cyan-400/[0.06] rounded-full blur-[140px] pointer-events-none" />

          {/* 3. Kolam cahaya radial halus di sekitar titik model */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[500px] h-[400px] bg-sky-500/[0.08] rounded-full blur-[100px] pointer-events-none" />
        </div>

        {/* 1. Blok Judul Section di Atas (Z-Index 20, Alur Normal, Tidak Pernah Tertutup Model) */}
        <div className="relative z-20 text-center max-w-3xl mx-auto px-4 mb-4 sm:mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 mb-3 tracking-wider uppercase">
            Fitur Utama Angkara
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold tracking-tight text-white leading-tight">
            Fitur Lengkap untuk Pengalaman Terbaik
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            10 fitur utama yang dirancang khusus untuk mengatasi tantangan booking kapal wisata di Cilacap
          </p>
        </div>

        {/* 2. Kontainer Panggung 3D (Tinggi Terkontrol h-[min(58svh,520px)], Canvas HANYA di Sini) */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 flex items-center justify-center">
          {/* Tombol Panah Kiri (Liquid Glass) */}
          <button
            onClick={handlePrev}
            aria-label="Fitur sebelumnya"
            className="absolute left-2 sm:left-4 md:left-8 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900/40 hover:bg-slate-900/70 active:scale-95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center justify-center text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 group"
          >
            <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* Kontainer Kanvas WebGL */}
          <div className="relative w-full max-w-2xl h-[min(58svh,520px)] min-h-[360px] overflow-hidden flex items-center justify-center">
            <CanvasStage
              activeFeature={activeFeature}
              isVisible={isVisible}
              isEntered={isEntered}
              pulseTrigger={activeFeature.id}
              isMobile={isMobile}
              isReducedMotion={prefersReducedMotion}
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
        <div className="relative z-20 text-center mt-3 mb-2">
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
        Diletakkan tepat di bawah panggung 3D dengan 4 kartu fitur sekunder.
      */}
      <section
        id="secondary-features"
        className="relative z-10 bg-[#020b17] text-white py-16 border-t border-slate-900/80"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SecondaryFeatures features={SECONDARY_FEATURES} />
        </div>
      </section>
    </WebGLErrorBoundary>
  );
};

export default FeaturesStage;

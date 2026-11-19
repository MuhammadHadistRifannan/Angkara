import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calculateCoverflowState, type CoverflowState } from "./suarCarouselLogic";

export interface SuarCarouselProps {
  children: React.ReactNode;
  className?: string;
  showArrows?: boolean;
  ariaLabel?: string;
  onActiveChange?: (index: number) => void;
  /** Indeks kartu yang tampil di tengah saat pertama muat. Default 1 (kartu kedua). */
  initialActiveIndex?: number;
}

interface SuarCarouselChildProps {
  tilt?: number;
  scale?: number;
  zIndex?: number;
  opacity?: number;
  isActive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const SuarCarousel: React.FC<SuarCarouselProps> = ({
  children,
  className = "",
  showArrows = true,
  ariaLabel = "Koleksi Kartu Suar",
  onActiveChange,
  initialActiveIndex = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const validChildren = React.Children.toArray(children).filter(Boolean);
  const totalItems = validChildren.length;

  // Pembaruan status tombol panah
  const updateArrows = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 15);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 15);
  }, []);

  // Scroll ke initialActiveIndex setelah layout siap (supaya 3 kartu terlihat)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || totalItems === 0) return;
    const targetIdx = Math.min(initialActiveIndex, totalItems - 1);
    const targetItem = itemsRef.current[targetIdx];
    if (!targetItem) return;
    const itemCenter = targetItem.offsetLeft + targetItem.offsetWidth / 2;
    container.scrollLeft = Math.max(0, itemCenter - container.clientWidth / 2);
    setActiveIndex(targetIdx);
    updateArrows();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems]);

  // Deteksi kartu tengah dengan IntersectionObserver & fallback perhitungan jarak pusat
  useEffect(() => {
    const container = containerRef.current;
    if (!container || totalItems === 0) return;

    // 1. IntersectionObserver dengan rootMargin sekitar 0 -40% 0 -40%
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const idxStr = entry.target.getAttribute("data-index");
              if (idxStr !== null) {
                const idx = parseInt(idxStr, 10);
                if (!isNaN(idx)) {
                  setActiveIndex(idx);
                  onActiveChange?.(idx);
                }
              }
            }
          });
        },
        {
          root: container,
          rootMargin: "0px -38% 0px -38%",
          threshold: 0.1,
        }
      );

      itemsRef.current.forEach((el) => {
        if (el && observer) observer.observe(el);
      });
    }

    // 2. Fallback scroll calculation jika scroll cepat atau observer belum trigger
    let ticking = false;
    const handleScroll = () => {
      updateArrows();
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!container) return;
          const containerCenter = container.scrollLeft + container.clientWidth / 2;
          let closestIdx = 0;
          let minDistance = Infinity;

          itemsRef.current.forEach((item, idx) => {
            if (!item) return;
            const itemCenter = item.offsetLeft + item.offsetWidth / 2;
            const distance = Math.abs(containerCenter - itemCenter);
            if (distance < minDistance) {
              minDistance = distance;
              closestIdx = idx;
            }
          });

          if (minDistance < 220) {
            setActiveIndex(closestIdx);
            onActiveChange?.(closestIdx);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    updateArrows();

    return () => {
      if (observer) observer.disconnect();
      container.removeEventListener("scroll", handleScroll);
    };
  }, [totalItems, updateArrows, onActiveChange]);

  // Gulir ke kartu tertentu
  const scrollToCard = useCallback((targetIndex: number) => {
    const container = containerRef.current;
    const targetItem = itemsRef.current[targetIndex];
    if (!container || !targetItem) return;

    const itemCenter = targetItem.offsetLeft + targetItem.offsetWidth / 2;
    const scrollTarget = itemCenter - container.clientWidth / 2;

    container.scrollTo({
      left: Math.max(0, scrollTarget),
      behavior: "smooth",
    });
  }, []);

  const handlePrev = () => {
    const nextIdx = Math.max(0, activeIndex - 1);
    scrollToCard(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = Math.min(totalItems - 1, activeIndex + 1);
    scrollToCard(nextIdx);
  };

  // Navigasi Keyboard
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div
      className={`relative w-full overflow-visible ${className}`}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={ariaLabel}
    >
      {/* Panah Navigasi Carousel di Pojok Kanan Atas / Mengambang */}
      {showArrows && totalItems > 1 && (
        <div className="flex items-center justify-end gap-2 mb-2 sm:mb-3 px-2">
          <span className="text-xs font-semibold text-slate-500 mr-auto hidden sm:inline-block">
            Geser atau gunakan panah untuk melihat {totalItems} pilihan
          </span>
          <button
            type="button"
            onClick={handlePrev}
            disabled={!canPrev}
            aria-label="Pilihan sebelumnya"
            className="p-2.5 rounded-full border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed transition-all focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canNext}
            aria-label="Pilihan berikutnya"
            className="p-2.5 rounded-full border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed transition-all focus-visible:ring-2 focus-visible:ring-sky-500 outline-none"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* 
        Kontainer Scroll Native (scroll-snap-type: x mandatory):
        - padding vertikal luas (py-8 sm:py-10) agar interaksi pop 1.08 dan naik 12px tidak terpotong.
        - padding horizontal cukup agar kartu pertama dan kartu terakhir bisa berada tepat di tengah.
      */}
      <div
        ref={containerRef}
        className={`flex items-center gap-4 sm:gap-6 lg:gap-8 overflow-x-auto overflow-y-visible snap-x snap-mandatory py-8 sm:py-10 px-4 sm:px-8 lg:px-[calc(50%-190px)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          totalItems <= 2 ? "justify-center" : ""
        }`}
        style={{ scrollBehavior: "smooth" }}
      >
        {validChildren.map((child, index) => {
          const coverflow: CoverflowState = calculateCoverflowState(index, activeIndex, totalItems);

          // Suntikkan properti mengipas ke elemen anak bila merupakan komponen React yang valid
          const injectedChild = React.isValidElement<SuarCarouselChildProps>(child)
            ? React.cloneElement(child, {
                tilt: coverflow.tilt,
                scale: coverflow.scale,
                zIndex: coverflow.zIndex,
                opacity: coverflow.opacity,
                isActive: index === activeIndex,
                onClick: (e: React.MouseEvent) => {
                  // Jika diklik tapi belum aktif, gulir ke kartu ini
                  if (index !== activeIndex) {
                    scrollToCard(index);
                  }
                  child.props?.onClick?.(e);
                },
              })
            : child;

          return (
            <div
              key={index}
              ref={(el) => {
                itemsRef.current[index] = el;
              }}
              data-index={index}
              className="snap-center shrink-0 flex items-center justify-center overflow-visible"
              style={{
                perspective: "1000px",
              }}
            >
              {injectedChild}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuarCarousel;

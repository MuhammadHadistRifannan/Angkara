import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Cloud,
  Star,
  MessageCircle,
} from "lucide-react";
import type { SecondaryFeatureItem } from "./types";

interface SecondaryFeaturesProps {
  features: SecondaryFeatureItem[];
}

export const SecondaryFeatures = ({ features }: SecondaryFeaturesProps) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(680);

  // Ukur lebar kartu aktif saat resize untuk translasi translasi pixel yang presisi
  useEffect(() => {
    const updateWidth = () => {
      if (firstCardRef.current) {
        setCardWidth(firstCardRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIdx((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActiveIdx((prev) => Math.min(features.length - 1, prev + 1));
  }, [features.length]);

  const handleSelect = useCallback((idx: number) => {
    setActiveIdx(idx);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrev();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  };

  const gap = 24; // 1.5rem (gap-6)
  const slideOffset = -activeIdx * (cardWidth + gap);

  return (
    <div
      className="pt-10 pb-12 focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Karusel Fitur Ekosistem Maritim"
    >
      {/* 
        1. HEADER SECTION & NAVIGATION CONTROLS
        Sesuai referensi Dribbble: Title, subtitle, dan tombol navigasi Prev/Next
      */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Ekosistem Maritim Lengkap
          </span>
          <h4 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight mt-1">
            Dan Masih Banyak Lagi
          </h4>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-2 leading-relaxed">
            Dirancang menyeluruh untuk keselamatan navigasi, transparansi operasional, dan kepuasan wisatawan bahari Cilacap.
          </p>
        </div>

        {/* Navigation Controls: Counter + Prev/Next buttons */}
        <div className="flex items-center gap-4 self-start md:self-end">
          {/* Active Step Indicator */}
          <div
            data-testid="active-step-counter"
            className="flex items-baseline gap-1 font-mono px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md"
          >
            <span className="text-2xl font-black text-cyan-400">
              {String(activeIdx + 1).padStart(2, "0")}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              / {String(features.length).padStart(2, "0")}
            </span>
          </div>

          {/* Prev Button */}
          <button
            type="button"
            aria-label="Kartu sebelumnya"
            disabled={activeIdx === 0}
            onClick={handlePrev}
            className="w-11 h-11 rounded-full border border-slate-800 bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-800 hover:border-cyan-500/40 hover:text-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Next Button */}
          <button
            type="button"
            aria-label="Kartu berikutnya"
            disabled={activeIdx === features.length - 1}
            onClick={handleNext}
            className="w-11 h-11 rounded-full border border-slate-800 bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-800 hover:border-cyan-500/40 hover:text-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 
        2. HORIZONTAL SLIDING CARD TRACK
        Card yang digeser interaktif: Drag gesture, spring transition, peeking preview
      */}
      <div className="relative overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0 py-4">
        {/* Ambient glow traveling with active slide */}
        <div
          className="absolute -top-10 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10 transition-transform duration-700 ease-out"
          style={{ transform: `translateX(${activeIdx * 120}px)` }}
        />

        <motion.div
          ref={trackRef}
          animate={{ x: slideOffset }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          drag="x"
          dragConstraints={{
            left: -(features.length - 1) * (cardWidth + gap),
            right: 0,
          }}
          onDragEnd={(_e, info) => {
            const swipeThreshold = 40;
            if (info.offset.x < -swipeThreshold && activeIdx < features.length - 1) {
              handleNext();
            } else if (info.offset.x > swipeThreshold && activeIdx > 0) {
              handlePrev();
            }
          }}
          className="flex gap-6 cursor-grab active:cursor-grabbing select-none"
        >
          {features.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === activeIdx;

            return (
              <div
                key={item.id}
                ref={idx === 0 ? firstCardRef : null}
                onClick={() => {
                  if (!isActive) handleSelect(idx);
                }}
                className={`w-[85vw] sm:w-[580px] md:w-[680px] lg:w-[740px] flex-shrink-0 rounded-3xl p-6 sm:p-8 md:p-9 transition-all duration-500 flex flex-col justify-between relative overflow-hidden backdrop-blur-2xl border ${
                  isActive
                    ? "bg-slate-900/90 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.16)] scale-100 opacity-100 z-10 ring-1 ring-cyan-500/20"
                    : "bg-slate-900/40 border-slate-800/80 scale-[0.97] opacity-55 hover:opacity-85 hover:border-slate-700/80 cursor-pointer"
                }`}
              >
                {/* Watermark Giant Numeral (Dribbble Ref 01, 02, 03, 04) */}
                <span className="absolute top-2 right-6 sm:right-8 font-mono font-black text-7xl sm:text-8xl md:text-9xl text-white/[0.06] select-none pointer-events-none tracking-tighter">
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* Top Row: Icon + Badge Pills */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wide uppercase bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                          {item.tag || "Fitur Suar"}
                        </span>
                      </div>
                    </div>

                    {item.badge && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-400 bg-slate-800/60 border border-slate-700/50 hidden sm:inline-block">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* 
                    Custom Interactive Visual Widget per Feature 
                  */}
                  {idx === 0 && (
                    <div className="my-5 p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 font-mono text-xs text-slate-300 space-y-2.5">
                      <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800/80">
                        <span className="flex items-center gap-2 text-cyan-300 font-semibold">
                          <Calculator className="w-3.5 h-3.5" /> Simulasi Sewa Teluk Penyu
                        </span>
                        <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                          ✓ Bebas Pungli
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Sewa Armada Kapal Wisata</span>
                        <span className="text-white font-semibold">Rp 450.000</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Bahan Bakar Solar & Operasional</span>
                        <span className="text-white font-semibold">Rp 100.000</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Jasa Nakhoda & Sertifikasi ABK</span>
                        <span className="text-white font-semibold">Rp 150.000</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-sm font-bold">
                        <span className="text-cyan-300">Total Tarif Transparan</span>
                        <span className="text-cyan-400 text-base">Rp 700.000</span>
                      </div>
                    </div>
                  )}

                  {idx === 1 && (
                    <div className="my-5 p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 font-mono text-xs text-slate-300 space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <span className="flex items-center gap-2 text-cyan-300 font-semibold">
                          <Cloud className="w-3.5 h-3.5" /> Sensor Maritim Cilacap (Live WIB)
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full font-sans font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> AMAN BERLAYAR
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-1 text-center font-sans">
                        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                          <span className="block text-[11px] text-slate-400">Gelombang</span>
                          <span className="block text-base font-bold text-white font-mono">0,8 m</span>
                          <span className="block text-[10px] text-cyan-400">Maks 1,25m</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                          <span className="block text-[11px] text-slate-400">Kecepatan Angin</span>
                          <span className="block text-base font-bold text-white font-mono">11 knot</span>
                          <span className="block text-[10px] text-cyan-400">Maks 15 knot</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
                          <span className="block text-[11px] text-slate-400">Jendela Berlayar</span>
                          <span className="block text-base font-bold text-white font-mono">07–15</span>
                          <span className="block text-[10px] text-emerald-400">WIB Terbaik</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Kalkulasi: rules.ts deterministik</span>
                        <span className="text-cyan-400 font-semibold">100% Konservatif</span>
                      </div>
                    </div>
                  )}

                  {idx === 2 && (
                    <div className="my-5 p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-xs text-slate-300 space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <span className="font-bold text-white text-sm font-mono mr-1">4.9</span>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-slate-400 text-[11px] font-mono ml-1">(248 ulasan)</span>
                        </div>
                        <span className="text-[11px] text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-full font-mono">
                          ✓ GPS Validated
                        </span>
                      </div>
                      <p className="text-slate-300 italic text-xs sm:text-sm leading-relaxed">
                        &ldquo;Nakhoda Pak Sugeng sangat teliti membaca arus dan pelampung keselamatan lengkap untuk 6 anggota keluarga kami saat susur mangrove.&rdquo;
                      </p>
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                        <span>Wisatawan: Hendra P. (Bandung)</span>
                        <span className="text-emerald-400">Tiket Terverifikasi</span>
                      </div>
                    </div>
                  )}

                  {idx === 3 && (
                    <div className="my-5 p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-xs text-slate-300 space-y-2.5 font-sans">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <span className="flex items-center gap-2 text-cyan-300 font-semibold font-mono">
                          <MessageCircle className="w-3.5 h-3.5" /> Asisten Maritim Cerdas Juru Mudi
                        </span>
                        <span className="text-[11px] text-sky-400 bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded-full font-mono">
                          Gemini 2.5
                        </span>
                      </div>
                      <div className="space-y-2 pt-1">
                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 max-w-[85%] text-slate-200">
                          <span className="text-[10px] text-slate-400 block mb-0.5 font-mono">Anda</span>
                          &ldquo;Kapal mana yang cocok untuk 8 orang ke Teluk Penyu besok pagi?&rdquo;
                        </div>
                        <div className="bg-cyan-950/40 border border-cyan-700/40 rounded-xl p-2.5 ml-auto max-w-[90%] text-cyan-100">
                          <span className="text-[10px] text-cyan-400 block mb-0.5 font-mono">Juru Mudi AI</span>
                          &ldquo;Rekomendasi Speedboat KM Bahari (kapasitas 10). Gelombang aman 0,7 m pukul 08.00 WIB. Sudah terverifikasi KSOP.&rdquo;
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Title & Description */}
                  <h5 className="font-bold text-xl sm:text-2xl text-white mb-2">
                    {item.title}
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-xl">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Action CTA */}
                <div>
                  <a
                    href={item.href || "#"}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 group/btn"
                  >
                    <span>{item.actionText || "Pelajari Selengkapnya"}</span>
                    <ArrowUpRight className="w-4 h-4 text-cyan-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* 
        3. BOTTOM SEGMENTED PROGRESS TABS (01, 02, 03, 04)
        Bisa diklik untuk lompat langsung ke kartu yang dipilih
      */}
      <div
        role="tablist"
        aria-label="Pilihan Kartu Fitur"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-4 border-t border-slate-800/80"
      >
        {features.map((item, idx) => {
          const isActive = idx === activeIdx;
          const numStr = String(idx + 1).padStart(2, "0");

          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              aria-label={`Pilih kartu ${numStr} - ${item.title}`}
              onClick={() => handleSelect(idx)}
              className={`p-3 rounded-2xl text-left transition-all duration-300 flex flex-col justify-between border ${
                isActive
                  ? "bg-slate-900/80 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.12)]"
                  : "bg-slate-900/30 border-slate-800/60 hover:bg-slate-900/60 hover:border-slate-700/70"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`font-mono font-bold text-xs ${
                    isActive ? "text-cyan-400" : "text-slate-500"
                  }`}
                >
                  {numStr}
                </span>
                <span
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive ? "bg-cyan-400 scale-125" : "bg-slate-700"
                  }`}
                />
              </div>
              <span
                className={`text-xs font-semibold truncate ${
                  isActive ? "text-white" : "text-slate-400"
                }`}
              >
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

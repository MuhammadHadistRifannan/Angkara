import { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Anchor,
} from "lucide-react";
import type { SecondaryFeatureItem } from "./types";

interface SecondaryFeaturesProps {
  features: SecondaryFeatureItem[];
}

export const SecondaryFeatures = ({ features }: SecondaryFeaturesProps) => {
  const [activeIdx, setActiveIdx] = useState(0);

  const handlePrev = useCallback(() => {
    setActiveIdx((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActiveIdx((prev) => Math.min(features.length - 1, prev + 1));
  }, [features.length]);

  const handleSelect = useCallback((idx: number) => {
    setActiveIdx(idx);
  }, []);

  return (
    <div
      className="pt-6 pb-10 focus:outline-none"
      tabIndex={0}
      role="region"
      aria-label="Karusel Fitur SUAR"
    >
      {/* 
        1. HEADER SECTION
        Sederhana dan langsung ke poin.
      */}
      <div className="max-w-3xl mb-8">
        <h4 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight mt-1">
          Dan Masih Banyak Lagi
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-2 leading-relaxed">
          Satu tempat untuk pesan tiket, cek cuaca dan gelombang, baca ulasan penumpang, dan tanya Juru Mudi AI sebelum berangkat.        
        </p>

        {/* Kontrol aksesibilitas (disembunyikan dari visual sesuai permintaan) */}
        <div className="sr-only">
          <div data-testid="active-step-counter">
            <span>{String(activeIdx + 1).padStart(2, "0")}</span>
            <span>/ {String(features.length).padStart(2, "0")}</span>
          </div>
          <button
            type="button"
            aria-label="Kartu sebelumnya"
            disabled={activeIdx === 0}
            onClick={handlePrev}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Kartu berikutnya"
            disabled={activeIdx === features.length - 1}
            onClick={handleNext}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 
        2. GRID 4 KARTU FITUR (Sederhana, Bersih, Hover-Highlighted)
        Format simpel tanpa visual berlebih: badge ringkas, judul, deskripsi jelas, dan tag status.
      */}
      <div
        role="tablist"
        aria-label="Pilihan Kartu Fitur"
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {features.map((item, idx) => {
          const numStr = String(idx + 1).padStart(2, "0");

          return (
            <div
              key={item.id}
              role="tab"
              aria-selected={idx === activeIdx}
              aria-label={`Pilih kartu ${numStr} - ${item.title}`}
              onClick={() => handleSelect(idx)}
              className="group rounded-2xl p-6 bg-[#091322] border border-slate-800/80 hover:bg-[#0c192d] hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-950/30 transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              {/* Subtle Top Accent Line on Hover */}
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              <div>
                {/* Tag Kategori Kecil */}
                <div className="mb-2.5">
                  <span className="text-[11px] font-semibold tracking-wider text-cyan-400 uppercase">
                    {item.badge || item.tag}
                  </span>
                </div>

                {/* Judul Kartu */}
                <h5 className="font-bold text-lg text-white mb-2 tracking-tight group-hover:text-cyan-200 transition-colors">
                  {item.title}
                </h5>

                {/* Deskripsi Bersih */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              {/* Tag / Status Ringkas di Bagian Bawah */}
              <div className="pt-4 mt-5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-medium text-slate-400 group-hover:text-cyan-300/80 transition-colors">
                  {item.tag}
                </span>
                <span className="text-slate-600 font-mono text-[10px]">
                  0{idx + 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

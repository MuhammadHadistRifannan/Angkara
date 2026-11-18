import { useState, useCallback } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Anchor,
} from "lucide-react";
import type { SecondaryFeatureItem } from "./types";

interface SecondaryFeaturesProps {
  features: SecondaryFeatureItem[];
}

// Data spesifikasi teknis riil
const FEATURE_SPECS: Record<string, string[]> = {
  "kalkulator-tarif": [
    "Standar tarif baku asosiasi nelayan & KSOP",
    "Rincian jelas bahan bakar, retribusi, & asuransi",
    "Bebas pungutan liar dan tawar-menawar di dermaga",
  ],
  "peringatan-cuaca": [
    "Telemetri BMKG Stasiun Maritim Cilacap",
    "Ambang batas aman gelombang ≤ 1,25 m & angin ≤ 15 knot",
    "Jendela pelayaran rekomendasi jam 07.00–15.00 WIB",
  ],
  "rating-terverifikasi": [
    "Ulasan hanya dari penumpang yang tervalidasi GPS",
    "Satu tiket terdaftar berhak atas satu ulasan sah",
    "Transparansi rekam jejak kepatuhan alat keselamatan",
  ],
  "asisten-juru-mudi": [
    "Rekomendasi jenis perahu sesuai kapasitas rombongan",
    "Panduan alur aman terlindung & pasang surut air laut",
    "Integrasi protokol siaga darurat Maritim SAR 115",
  ],
};

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
      aria-label="Karusel Fitur Ekosistem Maritim"
    >
      {/* 
        1. HEADER SECTION
        Angka dan tombol panah di pojok kanan atas telah dihilangkan total dari tampilan visual.
        Elemen kontrol tetap disematkan secara ramah aksesibilitas (sr-only).
      */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-sm backdrop-blur-md mb-3">
          <Anchor className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ekosistem Maritim Lengkap</span>
          <span className="text-cyan-500/60 font-mono text-[10px] hidden sm:inline">• 7°44&apos;S 109°00&apos;E</span>
        </div>
        <h4 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight mt-1">
          Dan Masih Banyak Lagi
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-2 leading-relaxed">
          Infrastruktur terpadu yang menopang keandalan pelayaran: kalkulasi tarif baku, telemetri cuaca BMKG, ulasan tervalidasi GPS, dan asisten navigasi.
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
        2. GRID 4 KARTU EKOSISTEM (Hover-Highlighted, Tanpa Icon & Tanpa Angka/Teks Atas)
        - Highlight aktif saat di-HOVER (bukan saat diklik)
        - Icon dan angka/teks paling atas di dalam kotak telah dihilangkan
        - Langsung diawali judul kartu yang tegas dan spesifikasi kapabilitas sistem
      */}
      <div
        role="tablist"
        aria-label="Pilihan Kartu Fitur"
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((item, idx) => {
          const numStr = String(idx + 1).padStart(2, "0");
          const specs = FEATURE_SPECS[item.id] || [];

          return (
            <div
              key={item.id}
              role="tab"
              aria-selected={idx === activeIdx}
              aria-label={`Pilih kartu ${numStr} - ${item.title}`}
              onClick={() => handleSelect(idx)}
              className="group rounded-3xl p-6 sm:p-7 bg-[#091322] border border-slate-800/80 hover:bg-gradient-to-b hover:from-[#0F223D] hover:to-[#0A1628] hover:border-cyan-400/60 hover:shadow-xl hover:shadow-cyan-950/40 hover:ring-1 hover:ring-cyan-400/30 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              {/* Top Accent Line on Hover */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                {/* Judul Kartu (Langsung di baris paling atas tanpa icon dan tanpa teks/angka) */}
                <h5 className="font-bold text-lg sm:text-xl text-white mb-2.5 tracking-tight group-hover:text-cyan-200 transition-colors">
                  {item.title}
                </h5>

                {/* Deskripsi */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                  {item.description}
                </p>

                {/* Spesifikasi Kapabilitas Sistem */}
                <div className="space-y-2 mb-6 pt-4 border-t border-slate-800/80 group-hover:border-slate-700/80 transition-colors">
                  <span className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wider block mb-2">
                    Kapabilitas Sistem:
                  </span>
                  {specs.map((spec, specIdx) => (
                    <div key={specIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                      <span className="leading-snug">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tautan Aksi di Bagian Bawah */}
              <div className="pt-4 border-t border-slate-800/80 group-hover:border-slate-700/80 transition-colors mt-auto">
                <a
                  href={item.href || "#"}
                  className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-700/70 bg-slate-800/40 text-slate-300 group-hover:bg-cyan-500/20 group-hover:text-cyan-200 group-hover:border-cyan-400/50 transition-all duration-200"
                >
                  <span>{item.actionText || "Pelajari Selengkapnya"}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

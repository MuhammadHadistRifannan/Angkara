import React, { useState, useEffect, useRef } from "react";
import { TicketCheck, CloudSun, StarHalf, BotMessageSquare } from "lucide-react";
import type { SecondaryFeatureItem } from "./types";
import {
  FeatureInsuranceScene,
  FeatureWeatherScene,
  FeatureReviewScene,
  FeatureAssistantScene,
} from "@/components/illustrations";

interface SecondaryFeaturesProps {
  features?: SecondaryFeatureItem[];
}

interface FeatureCardConfig {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  Illustration: React.FC<{ className?: string }>;
}

const FEATURE_CARDS: FeatureCardConfig[] = [
  {
    id: "etiket-asuransi",
    label: "Asuransi",
    title: "E-Tiket & Asuransi",
    description: "Tiket QR digital, sudah termasuk asuransi kecelakaan laut.",
    icon: TicketCheck,
    Illustration: FeatureInsuranceScene,
  },
  {
    id: "peringatan-cuaca",
    label: "Cuaca",
    title: "Peringatan Cuaca BMKG",
    description: "Cuaca laut real-time, dijelaskan sederhana: aman, waspada, atau tunda.",
    icon: CloudSun,
    Illustration: FeatureWeatherScene,
  },
  {
    id: "rating-terverifikasi",
    label: "Ulasan",
    title: "Ulasan Terverifikasi",
    description: "Hanya dari penumpang yang benar-benar sudah berlayar.",
    icon: StarHalf,
    Illustration: FeatureReviewScene,
  },
  {
    id: "asisten-juru-mudi",
    label: "Asisten AI",
    title: "Juru Mudi, Asisten AI",
    description: "Tanya waktu berlayar terbaik dan kapal yang cocok, kapan saja.",
    icon: BotMessageSquare,
    Illustration: FeatureAssistantScene,
  },
];

export const SecondaryFeatures: React.FC<SecondaryFeaturesProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="pt-4 pb-8 focus:outline-none"
      role="region"
      aria-label="Fitur Tambahan SUAR"
    >
      {/* 
        1. HEADER SECTION
        Ringkas, ramah, dan selaras:
        - Tanpa pil koordinat
        - Judul tetap "Dan Masih Banyak Lagi"
        - Subteks 1 baris pendek
      */}
      <div className="max-w-2xl mb-8 sm:mb-10 text-left">
        <h4 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">
          Dan Masih Banyak Lagi
        </h4>
        <p className="text-base sm:text-lg text-slate-300 mt-2.5 font-normal leading-relaxed">
          Semua yang dibutuhkan sebelum dan sesudah berlayar.
        </p>
      </div>

      {/* 
        2. GRID 4 KARTU FITUR
        Layout: 4 kolom (>=1280px), 2 kolom (>=768px), 1 kolom mobile.
        Struktur seragam per kartu:
        - Area Ilustrasi (~110-130px dengan blob seafoam/teal lembut & maskot Si Suar)
        - Label Kapsul Pendek
        - Judul (22-24px, weight 600)
        - Deskripsi 1 kalimat (max 80 karakter, putih opacity 0.8, 16px)
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6">
        {FEATURE_CARDS.map((card, idx) => {
          const { Illustration } = card;
          const staggerDelay = idx * 80;

          return (
            <div
              key={card.id}
              style={{
                transitionDelay: !isReducedMotion && isInView ? `${staggerDelay}ms` : "0ms",
              }}
              className={`group relative rounded-2xl p-5 sm:p-6 bg-[#091322] border border-slate-800/80 flex flex-col justify-between h-full transition-all duration-300 ease-out cursor-default overflow-hidden ${
                isReducedMotion
                  ? "opacity-100 translate-y-0"
                  : isInView
                  ? "opacity-100 translate-y-0 hover:-translate-y-1 hover:border-teal-400/50 hover:bg-[#0c192d] hover:shadow-xl hover:shadow-teal-950/40"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {/* Garis Aksen Halus di Bagian Atas saat Hover */}
              <div
                className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                aria-hidden="true"
              />

              <div>
                {/* 1. Area Ilustrasi (Tinggi ~120px dengan blob lembut & maskot Si Suar) */}
                <div className="mb-4">
                  <Illustration className="transition-transform duration-300 group-hover:scale-[1.02]" />
                </div>

                {/* 2. Label Kapsul Pendek dengan Icon & Bounce */}
                <div className="mb-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30 tracking-wide transition-all duration-300 group-hover:scale-105 group-hover:bg-teal-500/25">
                    <card.icon className="w-3.5 h-3.5 text-teal-300 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6" />
                    <span>{card.label}</span>
                  </span>
                </div>

                {/* 3. Judul Kartu (22-24px, font-semibold) */}
                <h5 className="text-[22px] sm:text-[24px] font-semibold text-white tracking-tight mb-2 leading-snug group-hover:text-teal-200 transition-colors">
                  {card.title}
                </h5>

                {/* 4. Deskripsi Singkat & Ramah (Maksimal 80 karakter, putih opacity 0.8 / kontras AA, 16px) */}
                <p className="text-[16px] text-white/80 leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

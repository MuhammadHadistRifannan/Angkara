import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Compass,
  Ship,
  ThumbsUp,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  Anchor,
  LifeBuoy,
  Wind,
  Waves,
  Calendar,
  Users,
} from "lucide-react";
import {
  StepSearch,
  StepWeather,
  StepBooking,
  StepDepart,
} from "./illustrations";

interface StepItem {
  id: string;
  stepNumber: string;
  chip: string;
  title: string;
  description: string;
  benefit: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS_DATA: StepItem[] = [
  {
    id: "how-step-1",
    stepNumber: "01",
    chip: "Dermaga Cilacap",
    title: "Cari & filter kapal",
    description:
      "Pilih dermaga keberangkatan (Teluk Penyu atau Tanjung Intan), tanggal trip, jumlah penumpang, dan tipe armada kapal.",
    benefit: "Daftar kapal berizin KSOP yang siap berlayar.",
    icon: Search,
  },
  {
    id: "how-step-2",
    stepNumber: "02",
    chip: "AI & BMKG Safety",
    title: "Cek cuaca & ulasan",
    description:
      "Periksa status keselamatan gelombang maritim dan ulasan asli nakhoda berlisensi KSOP sebelum Anda memesan.",
    benefit: "Kepastian kelaikan laut sebelum Anda bayar.",
    icon: Compass,
  },
  {
    id: "how-step-3",
    stepNumber: "03",
    chip: "Escrow Terjamin",
    title: "Booking & bayar DP",
    description:
      "Kunci kursi Anda via transaksi anti-overbooking dan bayar DP 30% yang diamankan oleh sistem escrow resmi.",
    benefit: "Jaminan kursi pasti milik Anda tanpa calo.",
    icon: Ship,
  },
  {
    id: "how-step-4",
    stepNumber: "04",
    chip: "Perjalanan Nyaman",
    title: "Nikmati perjalanan",
    description:
      "Tunjukkan e-tiket digital pada nakhoda di dermaga dan kenakan jaket pelampung keselamatan standar SOLAS.",
    benefit: "Keberangkatan tertib dan perlindungan asuransi resmi.",
    icon: ThumbsUp,
  },
];

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [litSteps, setLitSteps] = useState<Set<number>>(new Set([0]));
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);

  // Deteksi preferensi reduced motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);

    if (mq.matches) {
      setLitSteps(new Set([0, 1, 2, 3]));
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
      if (e.matches) {
        setLitSteps(new Set([0, 1, 2, 3]));
      }
    };

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // IntersectionObserver untuk melacak langkah aktif dan menyalakan rute secara bertahap
  useEffect(() => {
    if (isReducedMotion) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setLitSteps(new Set([0, 1, 2, 3]));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-step-index"));
            if (!isNaN(index)) {
              setActiveStep(index);
              setLitSteps((prev) => {
                const next = new Set(prev);
                next.add(index);
                return next;
              });
            }
          }
        });
      },
      {
        threshold: 0.35,
        rootMargin: "-10% 0px -20% 0px",
      }
    );

    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isReducedMotion]);

  const handleStepClick = (idx: number) => {
    const el = document.getElementById(STEPS_DATA[idx]?.id);
    if (el) {
      el.scrollIntoView({ behavior: isReducedMotion ? "auto" : "smooth" });
    }
  };

  const handleOpenJuruMudi = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-assistant", {
          detail: {
            prompt: "Halo Juru Mudi, bantu saya rencanakan pelayaran wisata di Cilacap",
          },
        })
      );
    }
  };

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="relative bg-[#FAF7F2] text-slate-900 overflow-hidden"
      style={{ "--section-how-bg": "#FAF7F2" } as React.CSSProperties}
    >
      {/* 1. Transisi Gradasi Halus Terang ke Krem (#F8FAFC -> #FAF7F2) tanpa pita navy */}
      <div
        className="w-full h-8 sm:h-12 bg-gradient-to-b from-[#F8FAFC] to-[#FAF7F2] -mt-px pointer-events-none"
        aria-hidden="true"
      />

      {/* 2. Tekstur Peta Laut Halus (Kontur & Kisi tipis) + Ornamen Kompas */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 select-none"
        aria-hidden="true"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="nautical-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#D6CEBE"
                strokeWidth="0.5"
                strokeDasharray="2,4"
                opacity="0.6"
              />
              <circle cx="30" cy="30" r="1" fill="#C4B8A5" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nautical-grid)" />
        </svg>
      </div>

      {/* Kompas Mawar Ornamen di sudut */}
      <div
        className="absolute top-16 right-4 sm:top-24 sm:right-12 pointer-events-none opacity-20 select-none"
        aria-hidden="true"
      >
        <svg
          className="w-28 h-28 sm:w-44 sm:h-44 text-slate-700"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="50" cy="50" r="46" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx="50" cy="50" r="40" strokeWidth="0.75" />
          <circle cx="50" cy="50" r="6" strokeWidth="1" />
          <path d="M50 4 L50 96 M4 50 L96 50" strokeWidth="0.75" />
          <polygon points="50,10 54,46 50,44 46,46" fill="currentColor" />
          <polygon points="50,90 54,54 50,56 46,54" fill="currentColor" />
          <polygon points="90,50 54,54 56,50 54,46" fill="currentColor" />
          <polygon points="10,50 46,54 44,50 46,46" fill="currentColor" />
          <text
            x="50"
            y="22"
            textAnchor="middle"
            fontSize="8"
            fontWeight="bold"
            fill="currentColor"
          >
            U
          </text>
        </svg>
      </div>

      {/* 3. Konten Utama */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <p className="text-xs sm:text-sm font-bold tracking-widest text-slate-500 uppercase mb-2">
            Alur Reservasi Resmi
          </p>

          <h2
            id="how-it-works-title"
            className="font-display font-black text-slate-900 tracking-tight leading-tight mb-3"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
          >
            Cara Kerja <span className="text-teal-600">SUAR</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Booking kapal wisata kini semudah 4 langkah terverifikasi, transparan tanpa
            calo, dan terpantau kelaikan cuaca maritim BMKG.
          </p>
        </div>

        {/* 4. Stepper Horizontal Ringkas (4 Ikon + Label Pendek) */}
        <div
          role="navigation"
          aria-label="Langkah alur pemesanan SUAR"
          className="max-w-4xl mx-auto mb-16 sm:mb-20"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2.5 sm:p-4 border border-slate-200/80 shadow-sm">
            <ol className="flex items-center justify-between gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
              {STEPS_DATA.map((step, idx) => {
                const Icon = step.icon;
                const isCurrent = activeStep === idx;
                const isLit = litSteps.has(idx);

                return (
                  <li key={step.id} className="flex-1 min-w-[70px] sm:min-w-0">
                    <button
                      type="button"
                      onClick={() => handleStepClick(idx)}
                      aria-current={isCurrent ? "step" : undefined}
                      className={`w-full flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 py-2 px-1 sm:px-3 rounded-xl transition-all text-center sm:text-left ${
                        isCurrent
                          ? "bg-teal-50 text-teal-900 font-bold shadow-2xs border border-teal-200"
                          : isLit
                          ? "text-slate-800 hover:bg-slate-100/80"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isCurrent
                            ? "bg-teal-600 text-white shadow-xs"
                            : isLit
                            ? "bg-slate-200 text-slate-700"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 leading-none mb-0.5 sm:mb-1">
                          Langkah {idx + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold truncate leading-tight">
                          {idx === 0
                            ? "Cari"
                            : idx === 1
                            ? "Cek Cuaca"
                            : idx === 2
                            ? "Booking"
                            : "Berangkat"}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* 5. Inti Rute & Langkah (Zig-zag Desktop, Single Column Mobile) */}
        <div className="relative max-w-5xl mx-auto">
          {/* Garis Rute Penghubung di Desktop (Tengah) */}
          <div
            className="hidden lg:block absolute left-1/2 top-12 bottom-12 w-0.5 -translate-x-1/2 pointer-events-none"
            aria-hidden="true"
          >
            <div className="w-full h-full border-l-2 border-dashed border-slate-300" />
          </div>

          <ol className="space-y-16 sm:space-y-24">
            {STEPS_DATA.map((step, idx) => {
              const isEven = idx % 2 === 0;
              const isLit = litSteps.has(idx);
              const isActive = activeStep === idx;

              return (
                <li
                  key={step.id}
                  id={step.id}
                  data-step-index={idx}
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  className="relative scroll-mt-28"
                >
                  {/* Pelampung Bernomor di Tengah (Desktop) / Kiri (Mobile) */}
                  <div
                    className="flex items-center gap-3 mb-4 lg:mb-0 lg:absolute lg:left-1/2 lg:top-8 lg:-translate-x-1/2 z-20"
                    aria-hidden="true"
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 shadow-md ${
                        isActive
                          ? "bg-teal-600 text-white ring-4 ring-teal-200 scale-110"
                          : isLit
                          ? "bg-slate-800 text-teal-300 ring-2 ring-slate-300"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {step.stepNumber}
                    </div>

                    {/* Lencana Kapal Kecil pada Langkah Aktif */}
                    {isActive && (
                      <span className="lg:hidden text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Anchor className="w-3 h-3 text-teal-600" />
                        <span>Posisi Anda</span>
                      </span>
                    )}
                  </div>

                  {/* Grid 2 Kolom Bergantian */}
                  <div
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                      isEven ? "" : "lg:grid-flow-dense"
                    }`}
                  >
                    {/* Sisi ILUSTRASI (Mini UI Card) */}
                    <div
                      className={`w-full flex justify-center ${
                        isEven ? "lg:justify-end" : "lg:col-start-2 lg:justify-start"
                      }`}
                      aria-hidden="true"
                    >
                      <div className="w-full max-w-[420px] transition-transform duration-300 hover:-translate-y-1">
                        {renderIllustrationCard(idx)}
                      </div>
                    </div>

                    {/* Sisi TEKS */}
                    <div
                      className={`w-full ${
                        isEven
                          ? "lg:pl-8 text-left"
                          : "lg:col-start-1 lg:pr-8 text-left"
                      }`}
                    >
                      {/* Chip Kategori */}
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-200/90 text-slate-700 border border-slate-300/60 shadow-2xs">
                          {step.chip}
                        </span>
                      </div>

                      {/* Judul Aksi */}
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
                        {step.title}
                      </h3>

                      {/* Penjelasan Ringkas */}
                      <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-4">
                        {step.description}
                      </p>

                      {/* Baris "Yang Anda dapat" */}
                      <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>
                          <strong className="text-slate-900 font-bold">
                            Yang Anda dapat:
                          </strong>{" "}
                          {step.benefit}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* 6. Penutup & Tombol Aksi (CTA) */}
        <div className="mt-20 sm:mt-24 text-center max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
          <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
            Siap menjelajahi pesona bahari Nusakambangan?
          </h4>
          <p className="text-sm sm:text-base text-slate-600 mb-6">
            Pesan tiket aman Anda sekarang atau konsultasikan rencana keberangkatan dengan AI Juru Mudi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#armada-siap-berlayar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all duration-200 focus:ring-2 focus:ring-teal-400 focus:outline-none"
            >
              <span>Cari kapal sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={handleOpenJuruMudi}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition-all duration-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
            >
              <span>Tanya Juru Mudi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global CSS Animasi Wave Sway */}
      <style>{`
        @keyframes suar-wave-sway {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-30px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .suar-wave-sway {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
};

// =========================================================================
// RENDER KARTU ILUSTRASI MINI UI (Inline HTML+CSS & SVG, Tanpa Library)
// =========================================================================

function renderIllustrationCard(stepIndex: number) {
  switch (stepIndex) {
    case 0:
      // KARTU 1: CARI & FILTER KAPAL
      return (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-4">
          {/* Ilustrasi Adegan Si Suar di Dermaga dengan Kaca Pembesar */}
          <StepSearch />

          {/* Kolom Pencarian */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <Search className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate font-medium">
              Teluk Penyu ⇄ Nusakambangan
            </span>
          </div>

          {/* Pemilih Dermaga */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Pilihan Dermaga Resmi
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="px-3 py-2 rounded-xl bg-teal-50 border border-teal-300 text-teal-900 text-xs font-bold flex items-center justify-between">
                <span>Teluk Penyu</span>
                <span className="w-2 h-2 rounded-full bg-teal-600" />
              </div>
              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium">
                <span>Tanjung Intan</span>
              </div>
            </div>
          </div>

          {/* Filter Tanggal & Stepper Penumpang */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-600 block mb-0.5">Tanggal</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>20 Nov 2026</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-600 block mb-0.5">Penumpang</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>4 Orang</span>
              </div>
            </div>
          </div>

          {/* Dua Kartu Mini Kapal */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  KM Sekar Bahari
                </span>
                <span className="text-[10px] text-slate-600">Speedboat Fiber • 8 Penumpang</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                KSOP
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  KM Bintang Samudera
                </span>
                <span className="text-[10px] text-slate-600">Kapal Kayu • 12 Penumpang</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                KSOP
              </span>
            </div>
          </div>
        </div>
      );

    case 1:
      // KARTU 2: CEK CUACA & ULASAN NAKHODA
      return (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-4">
          {/* Ilustrasi Adegan Si Suar Pantau Cuaca BMKG */}
          <StepWeather status="aman" />

          {/* Lencana Status Keselamatan Besar */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-900 block uppercase tracking-wide">
                  AMAN BERLAYAR
                </span>
                <span className="text-[10px] text-emerald-700">
                  Data BMKG &amp; Sensor Pesisir Terkini
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
              WIB 08:00
            </span>
          </div>

          {/* Dua Bar Indikator Cuaca Nyata */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            {/* Gelombang: 0.8 m vs ambang 1.25 m */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Waves className="w-3.5 h-3.5 text-teal-600" />
                  Tinggi Gelombang
                </span>
                <span className="text-slate-900 font-bold">
                  0,8 m{" "}
                  <span className="text-[10px] text-slate-600 font-normal">
                    (Batas 1,25 m)
                  </span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden relative">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: "64%" }}
                />
              </div>
            </div>

            {/* Angin: 11 knot vs ambang 15 knot */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Wind className="w-3.5 h-3.5 text-teal-600" />
                  Kecepatan Angin
                </span>
                <span className="text-slate-900 font-bold">
                  11 knot{" "}
                  <span className="text-[10px] text-slate-600 font-normal">
                    (Batas 15 knot)
                  </span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden relative">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: "73%" }}
                />
              </div>
            </div>
          </div>

          {/* Ulasan Singkat Nakhoda */}
          <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 text-xs">
            <div className="flex items-center gap-1 text-amber-500 mb-1">
              {"★".repeat(5)}
              <span className="text-[10px] font-bold text-slate-600 ml-1">5.0</span>
            </div>
            <p className="text-slate-700 italic text-[11px] leading-relaxed mb-1">
              &ldquo;Alur laut tenang dan angin bersahabat pagi ini menuju Karang Bolong.&rdquo;
            </p>
            <span className="text-[10px] font-bold text-slate-900 block">
              Capt. Haryanto — KM Berkah (Nakhoda KSOP)
            </span>
          </div>
        </div>
      );

    case 2:
      // KARTU 3: BOOKING & BAYAR DP (ESCROW)
      return (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-4">
          {/* Ilustrasi Adegan Si Suar Booking Escrow */}
          <StepBooking />

          {/* Ringkasan Perjalanan */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Teluk Penyu ⇄ Nusakambangan</span>
              <span className="font-mono text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md">
                4 Kursi Terkunci
              </span>
            </div>
            <span className="text-[11px] text-slate-600 block">
              20 Nov 2026 • Jam 08:30 WIB • Kapal Speedboat
            </span>
          </div>

          {/* Rincian DP 30% & Escrow Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-slate-700">Uang Muka (DP 30%)</span>
              <span className="font-black text-sm text-teal-800">Rp 75.000</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-teal-600 rounded-full"
                style={{ width: "30%" }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-600">
              <span className="text-teal-700 font-bold">● Terbayar via Escrow</span>
              <span>Sisa Rp 175.000 di Dermaga</span>
            </div>
          </div>

          {/* Jaminan Escrow */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2">
            <Lock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-snug">
              <strong className="text-slate-800">Dana ditahan escrow:</strong> Nelayan baru
              menerima pelunasan setelah Anda selesai menyeberang dengan selamat.
            </p>
          </div>

          {/* Tombol Kunci Kursi */}
          <button
            type="button"
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>Kunci Kursi (Anti-Overbooking)</span>
          </button>
        </div>
      );

    case 3:
      // KARTU 4: NIKMATI PERJALANAN (E-TIKET & PELAMPUNG)
      return (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-3.5">
          {/* Ilustrasi Adegan Si Suar Berlayar */}
          <StepDepart />

          {/* Header E-Tiket Boarding Pass */}
          <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-mono tracking-wider font-bold text-teal-700 block">
                SUAR BOARDING PASS
              </span>
              <span className="text-xs font-black text-slate-900">
                SUAR-TK-8921
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              Valid KSOP
            </span>
          </div>

          {/* Detail Dermaga & Jam */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-600 block">Dermaga</span>
              <span className="font-bold text-slate-800">Teluk Penyu</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 block">Keberangkatan</span>
              <span className="font-bold text-slate-800">08:30 WIB</span>
            </div>
          </div>

          {/* Pola QR Sederhana SVG */}
          <div className="flex items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <svg
              className="w-24 h-24 text-slate-900"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.1" />
              <rect x="4" y="4" width="4" height="4" fill="currentColor" />
              <rect x="14" y="2" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.1" />
              <rect x="16" y="4" width="4" height="4" fill="currentColor" />
              <rect x="2" y="14" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.1" />
              <rect x="4" y="16" width="4" height="4" fill="currentColor" />
              <path d="M14 14h2v2h-2z M18 14h4v2h-4z M14 18h4v4h-4z M20 20h2v2h-2z" fill="currentColor" />
            </svg>
          </div>

          {/* Instruksi Pelampung */}
          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 flex items-center gap-2.5">
            <LifeBuoy className="w-5 h-5 text-teal-600 shrink-0" />
            <span className="text-[11px] font-semibold text-teal-900 leading-tight">
              Tunjukkan ke nakhoda di dermaga &amp; kenakan pelampung keselamatan.
            </span>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default HowItWorks;

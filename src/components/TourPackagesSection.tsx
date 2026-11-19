import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import imgTourTelukPenyu from "@/assets/tour-teluk-penyu.png";
import imgTourMangrove from "@/assets/tour-mangrove-anakan.png";
import imgTourMancing from "@/assets/tour-mancing-mercusuar.png";
import { SuarCard, type SuarCardColor } from "@/components/ui/SuarCard";
import { SuarCarousel } from "@/components/ui/SuarCarousel";
import { MascotSticker, type MascotAccessoryType } from "@/components/illustrations/MascotSticker";

interface TourPackageItem {
  id: string;
  title: string;
  fullTitle: string;
  destination: string;
  category: "all" | "keluarga" | "mangrove" | "mancing";
  badge: string;
  duration: string;
  distance: string;
  blurb: string;
  description: string;
  chips: string[];
  pricingType: string;
  price: number;
  unit: string;
  image_url: string;
  stickerType: MascotAccessoryType;
}

/**
 * Data Resmi Paket Tour SUAR (sesuai spesifikasi Bagian E)
 * Judul kartu maksimal 3 kata / 24 karakter, blurb maksimal 60 karakter, chip maks 2.
 */
const defaultTourPackages: TourPackageItem[] = [
  {
    id: "pkg-teluk-penyu",
    title: "Pantai Permisan",
    fullTitle: "Penyeberangan Teluk Penyu – Pantai Pasir Putih Permisan",
    destination: "Pantai Permisan",
    category: "keluarga",
    badge: "Terpopuler",
    duration: "15 mnt",
    distance: "2,5 km",
    blurb: "Pantai pasir putih, selat tenang.",
    description:
      "Menyeberangi selat tenang menuju Pantai Permisan di Nusakambangan. Jelajah pantai pasir putih alami dengan ombak teduh yang ramah keluarga.",
    chips: ["15 mnt - 2,5 km", "Pelampung anak gratis"],
    pricingType: "Mulai dari",
    price: 35000,
    unit: "/ orang",
    image_url: imgTourTelukPenyu,
    stickerType: "umbrella",
  },
  {
    id: "pkg-segara-anakan",
    title: "Hutan Mangrove",
    fullTitle: "Jelajah Hutan Mangrove & Laguna Segara Anakan",
    destination: "Laguna Segara Anakan",
    category: "mangrove",
    badge: "Ekowisata",
    duration: "2 jam",
    distance: "8,5 km",
    blurb: "Susuri bakau dan laguna Segara Anakan.",
    description:
      "Menyusuri ekosistem mangrove terbesar di Pulau Jawa. Termasuk kunjungan ke tambak kepiting bakau dan susur perairan tenang.",
    chips: ["2 jam - 8,5 km", "Donasi 1 pohon bakau"],
    pricingType: "Charter Kapal",
    price: 350000,
    unit: "/ grup",
    image_url: imgTourMangrove,
    stickerType: "snorkel",
  },
  {
    id: "pkg-mancing-mercusuar",
    title: "Mercusuar Cimiring",
    fullTitle: "Trip Memancing & View Mercusuar Cimiring 1870",
    destination: "Mercusuar Cimiring",
    category: "mancing",
    badge: "Petualangan",
    duration: "4 jam",
    distance: "14 km",
    blurb: "Memancing seru, view mercusuar 1870.",
    description:
      "Sensasi memancing ikan kakap putih dan tenggiri di spot karang laut dalam dengan latar spektakuler mercusuar bersejarah peninggalan kolonial.",
    chips: ["4 jam - 14 km", "Alat pancing lengkap"],
    pricingType: "Charter Spesial",
    price: 550000,
    unit: "/ paket",
    image_url: imgTourMancing,
    stickerType: "fishing",
  },
  {
    id: "pkg-sunset-karang-bolong",
    title: "Sunset Karang Bolong",
    fullTitle: "Sunset Teluk Penyu – Pantai Karang Bolong",
    destination: "Pantai Karang Bolong",
    category: "keluarga",
    badge: "Sunset Teduh",
    duration: "2 jam",
    distance: "4 km",
    blurb: "Sunset Teluk Penyu ke Karang Bolong.",
    description:
      "Berlayar sore dari Teluk Penyu menuju Pantai Karang Bolong, pulang saat matahari terbenam di Laut Selatan.",
    chips: ["2 jam - 4 km", "Spot foto sunset"],
    pricingType: "Mulai dari",
    price: 75000,
    unit: "/ orang",
    image_url: imgTourTelukPenyu,
    stickerType: "umbrella",
  },
  {
    id: "pkg-susur-tambak",
    title: "Tambak Kepiting",
    fullTitle: "Susur Sungai & Tambak Kepiting Laguna Segara Anakan",
    destination: "Laguna Segara Anakan",
    category: "mangrove",
    badge: "Edukasi",
    duration: "3 jam",
    distance: "10 km",
    blurb: "Susur sungai dan tambak bakau warga.",
    description:
      "Menyusuri sungai dan tambak kepiting bakau di Segara Anakan bersama pemandu lokal.",
    chips: ["3 jam - 10 km", "Pemandu lokal"],
    pricingType: "Charter Kapal",
    price: 275000,
    unit: "/ grup",
    image_url: imgTourMangrove,
    stickerType: "snorkel",
  },
  {
    id: "pkg-mancing-malam",
    title: "Mancing Malam",
    fullTitle: "Mancing Malam & Sunrise Mercusuar Cimiring",
    destination: "Mercusuar Cimiring",
    category: "mancing",
    badge: "Mancing Malam",
    duration: "6 jam",
    distance: "14 km",
    blurb: "Mancing karang malam & sunrise 1870.",
    description:
      "Mancing malam di spot karang, lalu menunggu matahari terbit dengan latar Mercusuar Cimiring 1870.",
    chips: ["6 jam - 14 km", "Fishfinder sonar"],
    pricingType: "Charter Spesial",
    price: 750000,
    unit: "/ paket",
    image_url: imgTourMancing,
    stickerType: "fishing",
  },
];

// Rotasi warna kartu: teal, seafoam, koral, kuning matahari
const ROTATING_COLORS: SuarCardColor[] = ["teal", "seafoam", "coral", "sun"];

export const TourPackagesSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [packages] = useState<TourPackageItem[]>(defaultTourPackages);

  const filteredPackages =
    activeTab === "all"
      ? packages
      : packages.filter((pkg) => pkg.category === activeTab);

  const tabs = [
    { id: "all", label: "Semua Paket" },
    { id: "keluarga", label: "Wisata Keluarga" },
    { id: "mangrove", label: "Ekowisata Mangrove" },
    { id: "mancing", label: "Memancing & Mercusuar" },
  ];

  return (
    <section
      id="pilihan-paket-tour"
      className="py-18 sm:py-24 bg-white text-slate-900 relative overflow-hidden border-t border-slate-200/60"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Center (Sesuai Referensi Velin) */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/70 border border-sky-200/80 text-sky-900 text-xs font-semibold uppercase tracking-wider mb-3 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
            <span>Rute &amp; Paket Kurasi Nakhoda</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-fredoka text-slate-900 tracking-tight">
            Pilihan Paket Tour
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Rute terpopuler dengan nakhoda berpengalaman dari Teluk Penyu.
          </p>

          {/* Filter Tabs Pil di Tengah */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#0B1528] text-white shadow-md border border-cyan-400/20 scale-105"
                      : "bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Carousel Coverflow Mengipas SuarCard */}
        <SuarCarousel
          key={activeTab}
          ariaLabel="Daftar Pilihan Paket Tour"
          className="mt-2"
        >
          {filteredPackages.map((pkg, index) => {
            const cardColor = ROTATING_COLORS[index % ROTATING_COLORS.length];
            const isDark = cardColor === "teal" || cardColor === "coral" || cardColor === "navy";

            return (
              <SuarCard
                key={pkg.id}
                color={cardColor}
                title={pkg.title}
                blurb={pkg.blurb}
                chips={pkg.chips}
                illustration={
                  <div className="relative w-full h-full">
                    {/* Foto Asli dengan Sudut Membulat */}
                    <img
                      src={pkg.image_url}
                      alt={pkg.title}
                      className="w-full h-full object-cover rounded-[20px] sm:rounded-[22px]"
                      loading="lazy"
                    />
                    {/* Durasi & Jarak di Pojok Kiri Bawah Foto */}
                    <div className="absolute bottom-2 left-2 bg-black/65 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white border border-white/20">
                      {pkg.duration} • {pkg.distance}
                    </div>
                    {/* Stiker Maskot Si Suar di Sudut Kanan Atas */}
                    <div className="absolute top-2 right-2">
                      <MascotSticker type={pkg.stickerType} size={48} />
                    </div>
                  </div>
                }
                footer={
                  <div className="w-full text-center">
                    <span
                      className={`block text-[11px] font-semibold uppercase tracking-wider mb-0.5 ${
                        isDark ? "text-white/80" : "text-slate-700"
                      }`}
                    >
                      {pkg.pricingType}
                    </span>
                    <div className="flex items-baseline justify-center gap-1 mb-3">
                      <span
                        className={`text-2xl font-black font-fredoka tracking-tight ${
                          isDark ? "text-white" : "text-slate-950"
                        }`}
                      >
                        Rp{pkg.price.toLocaleString("id-ID")}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          isDark ? "text-white/85" : "text-slate-700"
                        }`}
                      >
                        {pkg.unit}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/tour-packages");
                      }}
                      className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all cursor-pointer ${
                        isDark
                          ? "bg-white text-slate-950 hover:bg-slate-100"
                          : "bg-[#0B1528] text-white hover:bg-slate-900"
                      }`}
                    >
                      Lihat Rute
                    </button>
                  </div>
                }
              />
            );
          })}
        </SuarCarousel>
      </div>
    </section>
  );
};

export default TourPackagesSection;

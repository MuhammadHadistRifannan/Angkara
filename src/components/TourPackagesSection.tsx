import React, { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapPin, ChevronDown } from "lucide-react";
import imgTourPesisir from "@/assets/tour-pesisir-nusakambangan.jpg";
import imgTourMangroveSegara from "@/assets/dest-segara-anakan.png";
import imgTourFishingBoat from "@/assets/tour-fishing-boat.jpg";
import imgTourKarangRocks from "@/assets/tour-karang-bolong.png";
import imgTourKarangBeach from "@/assets/tour-karang-bolong-beach.jpg";
import imgTourMangroveBoat from "@/assets/tour-mangrove-boat.jpg";
import imgSunriseBoats from "@/assets/tour-sunrise-boats.jpg";
import imgKarangBolongSouth from "@/assets/tour-karang-bolong-south.jpg";

interface TourPackageItem {
  id: string;
  title: string;
  destination: string;
  category: "all" | "keluarga" | "mangrove" | "mancing";
  badge: string;
  duration: string;
  distance: string;
  description: string;
  tags: string[];
  pricingType: string;
  price: number;
  unit: string;
  image_url: string;
}

const defaultTourPackages: TourPackageItem[] = [
  {
    id: "pkg-teluk-penyu",
    title: "Penyeberangan Teluk Penyu – Pantai Pasir Putih Permisan",
    destination: "Pantai Permisan",
    category: "keluarga",
    badge: "Wisata Keluarga",
    duration: "15 Menit",
    distance: "2,5 km",
    description:
      "Menyeberangi selat tenang menuju Pantai Permisan di Nusakambangan. Jelajah pantai pasir putih alami dengan ombak teduh yang ramah keluarga.",
    tags: ["Perairan Tenang", "Gratis Pelampung Anak"],
    pricingType: "Mulai dari",
    price: 35000,
    unit: "/ orang",
    image_url: imgTourPesisir,
  },
  {
    id: "pkg-segara-anakan",
    title: "Jelajah Hutan Mangrove & Laguna Segara Anakan",
    destination: "Laguna Segara Anakan",
    category: "mangrove",
    badge: "Ekowisata Mangrove",
    duration: "2 Jam",
    distance: "8,5 km",
    description:
      "Menyusuri ekosistem mangrove terbesar di Pulau Jawa. Termasuk kunjungan ke tambak kepiting bakau dan susur perairan tenang.",
    tags: ["Pemandu Lokal", "Donasi 1 Pohon Bakau"],
    pricingType: "Charter Kapal",
    price: 350000,
    unit: "/ group",
    image_url: imgTourMangroveSegara,
  },
  {
    id: "pkg-mancing-mercusuar",
    title: "Trip Memancing & View Mercusuar Cimiring 1870",
    destination: "Mercusuar Cimiring",
    category: "mancing",
    badge: "Mancing & Mercusuar",
    duration: "4 Jam",
    distance: "14 km",
    description:
      "Sensasi memancing ikan kakap putih dan tenggiri di spot karang laut dalam dengan latar spektakuler mercusuar bersejarah peninggalan kolonial.",
    tags: ["Fishfinder Sonar", "Alat Pancing Lengkap"],
    pricingType: "Charter Spesial",
    price: 550000,
    unit: "/ paket",
    image_url: imgTourFishingBoat,
  },
  {
    id: "pkg-sunset-karang-bolong",
    title: "Sunset Teluk Penyu – Pantai Karang Bolong",
    destination: "Pantai Karang Bolong",
    category: "keluarga",
    badge: "Wisata Keluarga",
    duration: "2 Jam",
    distance: "4 km",
    description:
      "Berlayar sore dari Teluk Penyu menuju Pantai Karang Bolong, pulang saat matahari terbenam di Laut Selatan.",
    tags: ["Perairan Tenang", "Spot Foto Sunset"],
    pricingType: "Mulai dari",
    price: 75000,
    unit: "/ orang",
    image_url: imgTourKarangRocks,
  },
  {
    id: "pkg-snorkeling-karang-bolong",
    title: "Snorkeling Pantai Karang Bolong",
    destination: "Pantai Karang Bolong",
    category: "keluarga",
    badge: "Wisata Keluarga",
    duration: "3 Jam",
    distance: "6 km",
    description:
      "Snorkeling di perairan jernih Pantai Karang Bolong dengan pemandu lokal.",
    tags: ["Alat Snorkeling", "Pemandu Lokal"],
    pricingType: "Mulai dari",
    price: 150000,
    unit: "/ orang",
    image_url: imgTourKarangBeach,
  },
  {
    id: "pkg-susur-tambak",
    title: "Susur Sungai & Tambak Kepiting Laguna Segara Anakan",
    destination: "Laguna Segara Anakan",
    category: "mangrove",
    badge: "Ekowisata Mangrove",
    duration: "3 Jam",
    distance: "10 km",
    description:
      "Menyusuri sungai dan tambak kepiting bakau di Segara Anakan bersama pemandu lokal.",
    tags: ["Pemandu Lokal", "Edukasi Mangrove"],
    pricingType: "Charter Kapal",
    price: 275000,
    unit: "/ group",
    image_url: imgTourMangroveBoat,
  },
  {
    id: "pkg-mancing-malam",
    title: "Mancing Malam & Sunrise Mercusuar Cimiring",
    destination: "Mercusuar Cimiring",
    category: "mancing",
    badge: "Mancing & Mercusuar",
    duration: "6 Jam",
    distance: "14 km",
    description:
      "Mancing malam di spot karang, lalu menunggu matahari terbit dengan latar Mercusuar Cimiring 1870.",
    tags: ["Alat Pancing Lengkap", "Fishfinder Sonar"],
    pricingType: "Charter Spesial",
    price: 750000,
    unit: "/ paket",
    image_url: imgSunriseBoats,
  },
  {
    id: "pkg-nusakambangan-sehari",
    title: "Jelajah Sehari – Permisan, Karang Bolong & Mercusuar Cimiring",
    destination: "Pantai Permisan, Pantai Karang Bolong & Mercusuar Cimiring",
    category: "keluarga",
    badge: "Wisata Keluarga",
    duration: "6 Jam",
    distance: "18 km",
    description:
      "Satu hari penuh: Pantai Pasir Putih Permisan, Karang Bolong, dan view Mercusuar Cimiring dari laut.",
    tags: ["Perairan Tenang", "Pemandu Lokal"],
    pricingType: "Mulai dari",
    price: 250000,
    unit: "/ orang",
    image_url: imgKarangBolongSouth,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const TourPackagesSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showAll, setShowAll] = useState<boolean>(false);
  const [packages] = useState<TourPackageItem[]>(defaultTourPackages);

  const filteredPackages =
    activeTab === "all"
      ? packages
      : packages.filter((pkg) => pkg.category === activeTab);

  // Batasi tampilan awal ke 6 kartu bila paket banyak agar tidak panjang ke bawah
  const visiblePackages =
    activeTab === "all" && !showAll
      ? filteredPackages.slice(0, 6)
      : filteredPackages;

  const tabs = [
    { id: "all", label: "Semua Paket" },
    { id: "keluarga", label: "Wisata Keluarga" },
    { id: "mangrove", label: "Ekowisata Mangrove" },
    { id: "mancing", label: "Mancing & Mercusuar" },
  ];

  return (
    <section id="pilihan-paket-tour" className="py-20 sm:py-24 bg-white text-slate-900 relative overflow-hidden border-t border-slate-200/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 sm:mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Pilihan Paket Tour
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Rute terpopuler dengan nakhoda berpengalaman dari Teluk Penyu.
            </p>
          </div>

          {/* Filter Tabs with interactive feedback */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowAll(false);
                  }}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#0B1528] text-white shadow-md border border-[#0B1528]"
                      : "bg-slate-100/80 text-slate-700 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Tour Cards Grid */}
        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {visiblePackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image & Badges (Tinggi proporsional & rapi) */}
                <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={pkg.image_url}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  {/* Top-left badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-[#0B1528]/85 backdrop-blur-md text-white border border-white/20">
                      {pkg.badge}
                    </span>
                  </div>
                  {/* Bottom-right duration & distance pill */}
                  <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-800 shadow-xs border border-slate-100">
                    {pkg.duration} • {pkg.distance}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 leading-snug line-clamp-2 group-hover:text-sky-800 transition-colors">
                    {pkg.title}
                  </h3>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-sky-700">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> Tujuan: {pkg.destination}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3.5 line-clamp-2">
                    {pkg.description}
                  </p>

                  {/* Feature Tags (maks 2 tag ringkas) */}
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {pkg.tags.slice(0, 2).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Pricing & Action */}
              <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-500 font-medium">
                    {pkg.pricingType}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base sm:text-lg font-black text-slate-900">
                      Rp {pkg.price.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">{pkg.unit}</span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(`/route/${pkg.id}`)}
                  className="px-3.5 py-2 rounded-xl bg-[#0B1528] hover:bg-[#15233e] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  Detail Rute
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tombol Tampilkan Lebih Banyak / Sedikit bila paket banyak */}
        {activeTab === "all" && filteredPackages.length > 6 && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors shadow-2xs"
            >
              <span>
                {showAll
                  ? "Tampilkan Lebih Sedikit"
                  : `Lihat Semua Rute (${filteredPackages.length} Paket)`}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  showAll ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TourPackagesSection;

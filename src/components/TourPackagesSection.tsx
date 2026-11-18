import React, { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import imgTourTelukPenyu from "@/assets/tour-teluk-penyu.png";
import imgTourMangrove from "@/assets/tour-mangrove-anakan.png";
import imgTourMancing from "@/assets/tour-mancing-mercusuar.png";

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
    badge: "Terpopuler Keluarga",
    duration: "15 Menit",
    distance: "2,5 km",
    description:
      "Menyeberangi selat tenang menuju Pantai Permisan di Nusakambangan. Jelajah pantai pasir putih alami dengan ombak teduh yang ramah keluarga.",
    tags: ["Perairan Tenang", "Gratis Pelampung Anak"],
    pricingType: "Mulai dari",
    price: 35000,
    unit: "/ orang",
    image_url: imgTourTelukPenyu,
  },
  {
    id: "pkg-segara-anakan",
    title: "Jelajah Hutan Mangrove & Laguna Segara Anakan",
    destination: "Laguna Segara Anakan",
    category: "mangrove",
    badge: "Ekowisata Edukasi",
    duration: "2 Jam",
    distance: "8,5 km",
    description:
      "Menyusuri ekosistem mangrove terbesar di Pulau Jawa. Termasuk kunjungan ke tambak kepiting bakau dan susur perairan tenang.",
    tags: ["Pemandu Lokal", "Donasi 1 Pohon Bakau"],
    pricingType: "Charter Kapal",
    price: 350000,
    unit: "/ group",
    image_url: imgTourMangrove,
  },
  {
    id: "pkg-mancing-mercusuar",
    title: "Trip Memancing & View Mercusuar Cimiring 1870",
    destination: "Mercusuar Cimiring",
    category: "mancing",
    badge: "Trip Petualangan & Mancing",
    duration: "4 Jam",
    distance: "14 km",
    description:
      "Sensasi memancing ikan kakap putih dan tenggiri di spot karang laut dalam dengan latar spektakuler mercusuar bersejarah peninggalan kolonial.",
    tags: ["Fishfinder Sonar", "Alat Pancing Lengkap"],
    pricingType: "Charter Spesial",
    price: 550000,
    unit: "/ paket",
    image_url: imgTourMancing,
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
    image_url: imgTourTelukPenyu,
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
    image_url: imgTourTelukPenyu,
  },
  {
    id: "pkg-susur-tambak",
    title: "Susur Sungai & Tambak Kepiting Laguna Segara Anakan",
    destination: "Laguna Segara Anakan",
    category: "mangrove",
    badge: "Ekowisata Edukasi",
    duration: "3 Jam",
    distance: "10 km",
    description:
      "Menyusuri sungai dan tambak kepiting bakau di Segara Anakan bersama pemandu lokal.",
    tags: ["Pemandu Lokal", "Edukasi Mangrove"],
    pricingType: "Charter Kapal",
    price: 275000,
    unit: "/ group",
    image_url: imgTourMangrove,
  },
  {
    id: "pkg-mancing-malam",
    title: "Mancing Malam & Sunrise Mercusuar Cimiring",
    destination: "Mercusuar Cimiring",
    category: "mancing",
    badge: "Trip Petualangan & Mancing",
    duration: "6 Jam",
    distance: "14 km",
    description:
      "Mancing malam di spot karang, lalu menunggu matahari terbit dengan latar Mercusuar Cimiring 1870.",
    tags: ["Alat Pancing Lengkap", "Fishfinder Sonar"],
    pricingType: "Charter Spesial",
    price: 750000,
    unit: "/ paket",
    image_url: imgTourMancing,
  },
  {
    id: "pkg-nusakambangan-sehari",
    title: "Jelajah Sehari – Permisan, Karang Bolong & Mercusuar Cimiring",
    destination: "Pantai Permisan, Pantai Karang Bolong & Mercusuar Cimiring",
    category: "keluarga",
    badge: "Terpopuler Keluarga",
    duration: "6 Jam",
    distance: "18 km",
    description:
      "Satu hari penuh: Pantai Pasir Putih Permisan, Karang Bolong, dan view Mercusuar Cimiring dari laut.",
    tags: ["Perairan Tenang", "Pemandu Lokal"],
    pricingType: "Mulai dari",
    price: 250000,
    unit: "/ orang",
    image_url: imgTourTelukPenyu,
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
  const [packages, setPackages] = useState<TourPackageItem[]>(defaultTourPackages);

  // DEMO: pakai defaultTourPackages (8 paket) langsung.
  // Fetch Supabase dimatikan sementara, dengan pola yang sama seperti
  // armada: tabel tour_packages di Supabase tidak konsisten dengan data
  // demo, dan halaman /tour-packages menampilkan "Gagal memuat paket tour"
  // saat fetch gagal. Nyalakan lagi setelah tabel berisi 8 paket yang sama.


  const filteredPackages =
    activeTab === "all"
      ? packages
      : packages.filter((pkg) => pkg.category === activeTab);

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
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 sm:mb-14"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/70 border border-sky-200/80 text-sky-900 text-xs font-semibold uppercase tracking-wider mb-2.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
              <span>Rute &amp; Paket Kurasi Nakhoda</span>
            </div>
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
                    document
                      .getElementById("pilihan-paket-tour")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#0B1528] text-white shadow-md border border-cyan-400/20"
                      : "bg-slate-100/80 text-slate-700 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* 8 Tour Cards with Staggered Entrance */}
        {/* key={activeTab}: tiap ganti tab, kartu di-mount ulang sehingga
            animasi masuk jalan lagi dan hasil filter langsung terlihat.
            Tanpa key ini, kartu lama bisa tetap tersembunyi (opacity 0)
            setelah filter berubah. */}
        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {filteredPackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-slate-100">
                  <img
                    src={pkg.image_url}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  {/* Top-left badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-[#0B1528]/85 backdrop-blur-md text-white border border-white/20">
                      {pkg.badge}
                    </span>
                  </div>
                  {/* Bottom-right duration & distance pill */}
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-sm border border-slate-100">
                    {pkg.duration} • {pkg.distance}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 leading-snug line-clamp-2 group-hover:text-sky-800 transition-colors">
                    {pkg.title}
                  </h3>
                  <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-sky-700">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> Tujuan: {pkg.destination}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
                    {pkg.description}
                  </p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {pkg.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Pricing & Action */}
              <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                <div>
                  <span className="block text-[11px] text-slate-500 font-medium">
                    {pkg.pricingType}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg sm:text-xl font-black text-slate-900">
                      Rp {pkg.price.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">{pkg.unit}</span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/tour-packages")}
                  className="px-4 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#15233e] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Detail Rute
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TourPackagesSection;

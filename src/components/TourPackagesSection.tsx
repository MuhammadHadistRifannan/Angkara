import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import imgTourTelukPenyu from "@/assets/tour-teluk-penyu.png";
import imgTourMangrove from "@/assets/tour-mangrove-anakan.png";
import imgTourMancing from "@/assets/tour-mancing-mercusuar.png";

interface TourPackageItem {
  id: string;
  title: string;
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
    category: "keluarga",
    badge: "Terpopuler Keluarga",
    duration: "15 Menit",
    distance: "2,5 km",
    description:
      "Menyeberangi selat tenang menuju pulau legendaris Nusakambangan. Jelajah pantai pasir putih alami dengan ombak teduh yang ramah keluarga.",
    tags: ["Perairan Tenang", "Gratis Pelampung Anak"],
    pricingType: "Mulai dari",
    price: 35000,
    unit: "/ orang",
    image_url: imgTourTelukPenyu,
  },
  {
    id: "pkg-segara-anakan",
    title: "Jelajah Hutan Mangrove & Laguna Segara Anakan",
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
];

export const TourPackagesSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [packages, setPackages] = useState<TourPackageItem[]>(defaultTourPackages);

  useEffect(() => {
    async function fetchPackages() {
      try {
        const { data, error } = await supabase
          .from("tour_packages")
          .select("*")
          .order("price", { ascending: true });

        if (!error && data && data.length > 0) {
          // Map backend items if available, else keep defaults
          const mapped: TourPackageItem[] = (data as Array<Record<string, unknown>>).map((item, idx: number) => {
            const fallback = defaultTourPackages[idx % defaultTourPackages.length];
            return {
              id: (item.id as string) || fallback.id,
              title: (item.title as string) || (item.name as string) || fallback.title,
              category: ((item.category as TourPackageItem["category"]) || fallback.category),
              badge: (item.badge as string) || fallback.badge,
              duration: (item.duration as string) || fallback.duration,
              distance: (item.distance as string) || fallback.distance,
              description: (item.description as string) || fallback.description,
              tags: item.tags && Array.isArray(item.tags) ? (item.tags as string[]) : fallback.tags,
              pricingType: (item.pricing_type as string) || fallback.pricingType,
              price: (item.price as number) || fallback.price,
              unit: (item.unit as string) || fallback.unit,
              image_url: (item.image_url as string) || fallback.image_url,
            };
          });
          setPackages(mapped);
        }
      } catch (err) {
        console.warn("Using default tour packages fallback:", err);
      }
    }

    fetchPackages();
  }, []);

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
    <section id="pilihan-paket-tour" className="py-20 sm:py-24 bg-[#F1F5F9]/60 text-slate-900 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 sm:mb-14">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Pilihan Paket Tour
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Rute terpopuler dengan jaminan nakhoda berpengalaman dan standar keselamatan KSOP.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#090D16] text-white shadow-md"
                      : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Tour Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-slate-100">
                  <img
                    src={pkg.image_url}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Top-left badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-[#090D16]/80 backdrop-blur-md text-white border border-white/20">
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
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2.5 leading-snug line-clamp-2 group-hover:text-sky-800 transition-colors">
                    {pkg.title}
                  </h3>
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

                <button
                  type="button"
                  onClick={() => navigate("/tour-packages")}
                  className="px-4 py-2.5 rounded-xl bg-[#090D16] hover:bg-[#1E293B] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Detail Rute
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TourPackagesSection;

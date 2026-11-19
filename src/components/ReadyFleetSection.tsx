import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import {
  ShieldCheck,
  Star,
  MessageSquare,
  PhoneCall,
  Radio,
  Users,
  Zap,
} from "lucide-react";
import { SuarCard, type SuarCardColor } from "@/components/ui/SuarCard";
import { SuarCarousel } from "@/components/ui/SuarCarousel";
import { BoatCardIllustration } from "@/components/illustrations/BoatCardIllustration";

interface FleetBoat {
  id: string;
  name: string;
  boatTypeTag: string;
  rating: number;
  tripsCount: number;
  captainName: string;
  capacityText: string;
  safetyGear: string;
  engineSpecs: string;
  fareLabel: string;
  price: number;
}

const defaultFleet: FleetBoat[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "KM Sri Rejeki 03",
    boatTypeTag: "Jukung Tradisional",
    rating: 4.9,
    tripsCount: 84,
    captainName: "Pak Slamet Riyadi (24 th pengalaman)",
    capacityText: "Maks. 10 Penumpang",
    safetyGear: "12 Jaket Pelampung SOLAS",
    engineSpecs: "Yamaha Marine 15PK",
    fareLabel: "Tarif PP Teluk Penyu:",
    price: 350000,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "KM Nusantara Express 01",
    boatTypeTag: "Speedboat Fiber Cepat",
    rating: 4.8,
    tripsCount: 112,
    captainName: "Mas Budiarto (Sertifikasi KSOP)",
    capacityText: "Maks. 20 Penumpang",
    safetyGear: "24 Pelampung + Life Raft",
    engineSpecs: "Twin Yamaha 200HP",
    fareLabel: "Tarif PP Teluk Penyu:",
    price: 650000,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "KM Segara Anakan 07",
    boatTypeTag: "Kapal Ekowisata",
    rating: 4.8,
    tripsCount: 63,
    captainName: "Kang Darmo (Pemandu Mangrove)",
    capacityText: "Maks. 12 Penumpang",
    safetyGear: "Sound Guide + Binokular",
    engineSpecs: "Mesin Diesel Silent 40PK",
    fareLabel: "Tarif Trip Laguna:",
    price: 400000,
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    name: "KM Camar Laut 02",
    boatTypeTag: "Speedboat Fiber Cepat",
    rating: 4.7,
    tripsCount: 58,
    captainName: "Pak Tarno",
    capacityText: "Maks. 8 Penumpang",
    safetyGear: "10 Jaket Pelampung SOLAS",
    engineSpecs: "Yamaha 40PK",
    fareLabel: "Tarif PP Teluk Penyu:",
    price: 550000,
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    name: "KM Baruna Jaya 05",
    boatTypeTag: "Kapal Kayu Tradisional",
    rating: 4.7,
    tripsCount: 71,
    captainName: "Pak Karso",
    capacityText: "Maks. 15 Penumpang",
    safetyGear: "18 Jaket Pelampung SOLAS",
    engineSpecs: "Diesel 30PK",
    fareLabel: "Tarif PP Teluk Penyu:",
    price: 300000,
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    name: "KM Samudra Kilat 01",
    boatTypeTag: "Speedboat Fiber Cepat",
    rating: 4.8,
    tripsCount: 49,
    captainName: "Mas Agus",
    capacityText: "Maks. 12 Penumpang",
    safetyGear: "14 Pelampung + Life Raft",
    engineSpecs: "Twin Yamaha 115HP",
    fareLabel: "Tarif PP Teluk Penyu:",
    price: 600000,
  },
  {
    id: "10000000-0000-4000-8000-000000000007",
    name: "KM Bintang Pesisir 04",
    boatTypeTag: "Jukung Tradisional",
    rating: 4.9,
    tripsCount: 92,
    captainName: "Pak Trisno",
    capacityText: "Maks. 10 Penumpang",
    safetyGear: "12 Pelampung SOLAS",
    engineSpecs: "Yamaha 15PK",
    fareLabel: "Tarif PP Teluk Penyu:",
    price: 350000,
  },
  {
    id: "10000000-0000-4000-8000-000000000008",
    name: "KM Tirta Kencana 02",
    boatTypeTag: "Kapal Ekowisata",
    rating: 4.8,
    tripsCount: 54,
    captainName: "Kang Yanto",
    capacityText: "Maks. 14 Penumpang",
    safetyGear: "Binokular + Sound Guide",
    engineSpecs: "Diesel Silent 40PK",
    fareLabel: "Tarif Trip Laguna:",
    price: 420000,
  },
  {
    id: "10000000-0000-4000-8000-000000000009",
    name: "KM Ombak Selatan 09",
    boatTypeTag: "Speedboat Fiber Cepat",
    rating: 4.9,
    tripsCount: 88,
    captainName: "Mas Hendra",
    capacityText: "Maks. 18 Penumpang",
    safetyGear: "20 Pelampung + Life Raft",
    engineSpecs: "Twin 150HP",
    fareLabel: "Tarif PP Teluk Penyu:",
    price: 620000,
  },
  {
    id: "10000000-0000-4000-8000-000000000010",
    name: "KM Teluk Indah 01",
    boatTypeTag: "Kapal Kayu Tradisional",
    rating: 4.7,
    tripsCount: 65,
    captainName: "Pak Maryono",
    capacityText: "Maks. 12 Penumpang",
    safetyGear: "15 Pelampung SOLAS",
    engineSpecs: "Diesel 25PK",
    fareLabel: "Tarif PP Teluk Penyu:",
    price: 320000,
  },
  {
    id: "10000000-0000-4000-8000-000000000011",
    name: "KM Berkah Bahari 06",
    boatTypeTag: "Jukung Tradisional",
    rating: 4.8,
    tripsCount: 77,
    captainName: "Pak Supri",
    capacityText: "Maks. 10 Penumpang",
    safetyGear: "12 Pelampung SOLAS",
    engineSpecs: "Yamaha 15PK",
    fareLabel: "Tarif PP Teluk Penyu:",
    price: 350000,
  },
  {
    id: "10000000-0000-4000-8000-000000000012",
    name: "KM Gelora Laut 03",
    boatTypeTag: "Speedboat Fiber Cepat",
    rating: 4.8,
    tripsCount: 60,
    captainName: "Mas Eko",
    capacityText: "Maks. 16 Penumpang",
    safetyGear: "18 Pelampung + Life Raft",
    engineSpecs: "Twin 175HP",
    fareLabel: "Tarif PP Teluk Penyu:",
    price: 580000,
  },
];

// Rotasi warna kartu: teal, seafoam, koral, kuning matahari
const ROTATING_COLORS: SuarCardColor[] = ["teal", "seafoam", "coral", "sun"];

export const ReadyFleetSection: React.FC = () => {
  const navigate = useNavigate();
  const [fleet] = useState<FleetBoat[]>(defaultFleet);
  const [authOpen, setAuthOpen] = useState(false);

  const openAssistantWith = (prompt: string) => {
    window.dispatchEvent(
      new CustomEvent("open-assistant", {
        detail: {
          prompt,
        },
      })
    );
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    try {
      const prompt = sessionStorage.getItem("pending_assistant_prompt");
      if (prompt) openAssistantWith(prompt);
    } catch (err) {
      console.warn("Gagal membaca prompt tersimpan:", err);
    }
  };

  const handleChatCaptain = async (boat: FleetBoat) => {
    const prompt = `Halo, saya ingin menanyakan jadwal ketersediaan kapal ${boat.name} dengan nakhoda ${boat.captainName}.`;
    try {
      sessionStorage.setItem("pending_assistant_prompt", prompt);
    } catch (e) {
      console.warn("Gagal menyimpan prompt:", e);
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setAuthOpen(true);
      return;
    }
    openAssistantWith(prompt);
  };

  const handleBookNow = (boatId: string) => {
    navigate(`/booking?boat=${encodeURIComponent(boatId)}`);
  };

  return (
    <section
      id="armada-siap-berlayar"
      className="py-18 sm:py-24 bg-[#F8FAFC] text-slate-900 relative overflow-hidden border-t border-slate-200/60"
    >
      <div id="boats" className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Center (Sesuai Referensi Velin) */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/70 border border-sky-200/80 text-sky-900 text-xs font-semibold uppercase tracking-wider mb-3 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
            <span>Armada Resmi Berlisensi KSOP</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-fredoka text-slate-900 tracking-tight">
            Armada Siap Berlayar Hari Ini
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Semua kapal lolos inspeksi fisik lambung dan kelengkapan P3K laut.
          </p>

          {/* Lencana Jumlah Kapal di Tengah */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-950 shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-sky-700" />
            <span className="text-xs font-bold text-sky-950">
              12 Kapal Siap Berlayar Hari Ini
            </span>
          </div>
        </div>

        {/* Carousel Coverflow Mengipas Armada SuarCard */}
        <SuarCarousel ariaLabel="Daftar Armada Kapal Suar" className="mt-2">
          {fleet.map((boat, index) => {
            const cardColor = ROTATING_COLORS[index % ROTATING_COLORS.length];
            const isDark = cardColor === "teal" || cardColor === "coral" || cardColor === "navy";

            // Nilai ringkas untuk 3 fakta cepat (Kapasitas, Keselamatan, Mesin)
            const shortCapacity = boat.capacityText
              .replace(/Maks\.\s*/i, "")
              .replace(/Penumpang/i, "orang")
              .trim();
            const shortSafety = boat.safetyGear
              .replace(/Jaket\s*/i, "")
              .replace(/SOLAS/i, "")
              .replace(/\+\s*Life\s*Raft/i, "")
              .trim();
            const shortEngine = boat.engineSpecs
              .replace(/Marine/i, "")
              .replace(/Mesin/i, "")
              .replace(/Silent/i, "")
              .trim();
            const shortCaptain = boat.captainName.split("(")[0].trim();

            return (
              <SuarCard
                key={boat.id}
                color={cardColor}
                title={boat.name}
                blurb={`Nahkoda ${shortCaptain}`}
                chips={[
                  boat.boatTypeTag.replace(" Tradisional", "").replace(" Cepat", ""),
                  `★ ${boat.rating.toFixed(1)} (${boat.tripsCount} trip)`,
                ]}
                illustration={
                  <div className="w-full h-full rounded-[20px] sm:rounded-[22px] overflow-hidden">
                    <BoatCardIllustration boatType={boat.boatTypeTag} />
                  </div>
                }
                footer={
                  <div className="w-full text-center">
                    {/* Tiga Fakta Singkat: Kapasitas, Alat Keselamatan, Mesin */}
                    <div
                      className={`grid grid-cols-3 gap-1 py-1.5 px-2 rounded-xl mb-3 border ${
                        isDark
                          ? "bg-black/15 border-white/20 text-white"
                          : "bg-slate-900/5 border-slate-900/15 text-slate-900"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <Users className="w-3.5 h-3.5 mb-0.5 opacity-75" />
                        <span className="text-[10px] font-bold leading-tight">
                          {shortCapacity}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center text-center border-x border-current/15 px-1">
                        <ShieldCheck className="w-3.5 h-3.5 mb-0.5 opacity-75" />
                        <span className="text-[10px] font-bold leading-tight line-clamp-1">
                          {shortSafety}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center text-center">
                        <Zap className="w-3.5 h-3.5 mb-0.5 opacity-75" />
                        <span className="text-[10px] font-bold leading-tight line-clamp-1">
                          {shortEngine}
                        </span>
                      </div>
                    </div>

                    {/* Tarif Besar Rata Tengah */}
                    <div className="flex items-baseline justify-center gap-1 mb-3">
                      <span
                        className={`text-2xl font-black font-fredoka tracking-tight ${
                          isDark ? "text-white" : "text-slate-950"
                        }`}
                      >
                        Rp{boat.price.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {/* Dua Tombol Aksi: Chat dan Pesan */}
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChatCaptain(boat);
                        }}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                          isDark
                            ? "bg-white/10 hover:bg-white/20 text-white border-white/30"
                            : "bg-slate-900/10 hover:bg-slate-900/15 text-slate-900 border-slate-900/20"
                        }`}
                      >
                        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                        <span>Chat</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(boat.id);
                        }}
                        className={`flex items-center justify-center py-2.5 px-3 rounded-2xl text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer ${
                          isDark
                            ? "bg-white text-slate-950 hover:bg-slate-100"
                            : "bg-[#0B1528] text-white hover:bg-slate-900"
                        }`}
                      >
                        Pesan
                      </button>
                    </div>
                  </div>
                }
              />
            );
          })}
        </SuarCarousel>

        {/* Emergency SAR Quick-Response Banner */}
        <div className="mt-8 rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-[#0B1528] via-[#0f2142] to-[#0B1528] text-white border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex-shrink-0 shadow-inner">
              <Radio className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold font-fredoka text-white tracking-tight">
                Jalur Cepat Darurat Maritim Terpadu
              </h4>
              <p className="text-xs sm:text-sm text-slate-300">
                Pos Siaga Basarnas SAR Pelabuhan Cilacap &amp; Radio Nelayan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto relative z-10">
            <span className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono font-bold text-slate-200">
              VHF Radio: CH 16
            </span>
            <a
              href="tel:115"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-950/40 transition-colors"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Hotline 115</span>
            </a>
          </div>
        </div>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </section>
  );
};

export default ReadyFleetSection;

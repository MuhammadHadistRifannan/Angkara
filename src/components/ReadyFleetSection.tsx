import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Star, MessageSquare, PhoneCall, Radio } from "lucide-react";

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
    id: "sri-rejeki-03",
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
    id: "nusantara-express-01",
    name: "KM Nusantara Express 01",
    boatTypeTag: "Speedboat Fiber Cepat",
    rating: 5.0,
    tripsCount: 112,
    captainName: "Mas Budiarto (Sertifikasi KSOP)",
    capacityText: "Maks. 20 Penumpang",
    safetyGear: "24 Pelampung + Life Raft",
    engineSpecs: "Twin Yamaha 200HP",
    fareLabel: "Tarif PP Teluk Penyu:",
    price: 650000,
  },
  {
    id: "segara-anakan-07",
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
];

export const ReadyFleetSection: React.FC = () => {
  const navigate = useNavigate();
  const [fleet, setFleet] = useState<FleetBoat[]>(defaultFleet);

  useEffect(() => {
    async function fetchFleet() {
      try {
        const { data, error } = await supabase
          .from("boats")
          .select("*")
          .eq("available", true)
          .limit(3);

        if (!error && data && data.length > 0) {
          const mapped: FleetBoat[] = (data as Array<Record<string, unknown>>).map((b, idx: number) => {
            const fallback = defaultFleet[idx % defaultFleet.length];
            return {
              id: (b.id as string) || fallback.id,
              name: (b.name as string) || fallback.name,
              boatTypeTag:
                b.boat_type === "speedboat"
                  ? "Speedboat Fiber Cepat"
                  : b.boat_type === "kapal_kayu"
                  ? "Jukung Tradisional"
                  : fallback.boatTypeTag,
              rating: (b.rating as number) || fallback.rating,
              tripsCount: (b.total_trips as number) || fallback.tripsCount,
              captainName: b.captain_name
                ? `${b.captain_name} (Terlisensi KSOP)`
                : fallback.captainName,
              capacityText: `Maks. ${(b.capacity as number) || 10} Penumpang`,
              safetyGear: (b.safety_equipment as string) || fallback.safetyGear,
              engineSpecs: (b.engine_power as string) || fallback.engineSpecs,
              fareLabel: fallback.fareLabel,
              price: (b.price_per_hour as number) || (b.base_fare as number) || fallback.price,
            };
          });
          setFleet(mapped);
        }
      } catch (err) {
        console.warn("Using fallback fleet data:", err);
      }
    }

    fetchFleet();
  }, []);

  const handleChatCaptain = (boat: FleetBoat) => {
    window.dispatchEvent(
      new CustomEvent("open-assistant", {
        detail: {
          prompt: `Halo, saya ingin menanyakan jadwal ketersediaan kapal ${boat.name} dengan nakhoda ${boat.captainName}.`,
        },
      })
    );
  };

  const handleBookNow = (boatId: string) => {
    navigate(`/booking?boat=${encodeURIComponent(boatId)}`);
  };

  return (
    <section id="armada-siap-berlayar" className="py-20 sm:py-24 bg-white text-slate-900 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header & KSOP Verified Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 sm:mb-14">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Armada Siap Berlayar Hari Ini
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Setiap kapal telah lolos inspeksi fisik lambung dan kelengkapan P3K laut.
            </p>
          </div>

          {/* KSOP Verified Indicator Pill */}
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-sky-100/70 border border-sky-200/80 text-sky-950 shadow-sm self-start md:self-auto">
            <div className="p-1.5 rounded-xl bg-sky-500/20 text-sky-800">
              <ShieldCheck className="h-6 w-6 text-sky-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none text-sky-950">
                42 Kapal
              </span>
              <span className="text-xs font-semibold text-sky-800">
                Terverifikasi KSOP Hari Ini
              </span>
            </div>
          </div>
        </div>

        {/* 3 Fleet Cards matching Image 4 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10">
          {fleet.map((boat) => (
            <div
              key={boat.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header: Tag & Rating */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                    {boat.boatTypeTag}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>
                      {boat.rating.toFixed(1)} ({boat.tripsCount} trip)
                    </span>
                  </div>
                </div>

                {/* Boat Name & Captain */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
                  {boat.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6">
                  Nahkoda: <span className="text-slate-700 font-semibold">{boat.captainName}</span>
                </p>

                {/* Specs List */}
                <div className="space-y-2.5 text-xs sm:text-sm border-t border-slate-100 pt-4 mb-6">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Kapasitas Muat:</span>
                    <span className="font-semibold text-slate-900">{boat.capacityText}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Alat Keselamatan:</span>
                    <span className="font-semibold text-slate-900">{boat.safetyGear}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Mesin:</span>
                    <span className="font-semibold text-slate-900">{boat.engineSpecs}</span>
                  </div>
                </div>
              </div>

              {/* Pricing & 2 Buttons */}
              <div>
                <div className="flex justify-between items-baseline mb-5 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">{boat.fareLabel}</span>
                  <span className="text-xl font-black text-slate-900">
                    Rp {boat.price.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChatCaptain(boat)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 text-slate-600" />
                    <span>Chat Nelayan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBookNow(boat.id)}
                    className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-[#090D16] hover:bg-[#1E293B] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Pesan Sekarang
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency SAR Quick-Response Banner matching Image 4 */}
        <div className="rounded-2xl p-4 sm:p-5 bg-[#EFEFEF] border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-300/80 text-slate-700 flex-shrink-0">
              <Radio className="h-6 w-6 text-slate-700" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                Jalur Cepat Darurat Maritim Terpadu
              </h4>
              <p className="text-xs text-slate-600">
                Pos Siaga Basarnas SAR Pelabuhan Cilacap & Radio Nelayan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700">
              VHF Radio: CH 16
            </span>
            <a
              href="tel:115"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#090D16] hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Hotline 115</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadyFleetSection;

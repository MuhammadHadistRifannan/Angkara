import React, { useState, useRef } from "react";
import { motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Star, MessageSquare, PhoneCall, Radio, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

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
    price: 350000
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
    price: 650000
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
    price: 400000
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
    price: 550000
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
    price: 300000
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
    price: 600000
  },
  {
    id: "10000000-0000-4000-8000-000000000007",
    name: "KM Lumba-Lumba 04",
    boatTypeTag: "Speedboat Fiber Cepat",
    rating: 4.6,
    tripsCount: 37,
    captainName: "Pak Dedi",
    capacityText: "Maks. 6 Penumpang",
    safetyGear: "8 Jaket Pelampung SOLAS",
    engineSpecs: "Yamaha 40PK",
    fareLabel: "Tarif PP Teluk Penyu:",
    price: 450000
  },
  {
    id: "10000000-0000-4000-8000-000000000008",
    name: "KM Bahari Sejahtera 09",
    boatTypeTag: "Kapal Kayu Tradisional",
    rating: 4.7,
    tripsCount: 66,
    captainName: "Pak Joko",
    capacityText: "Maks. 20 Penumpang",
    safetyGear: "22 Jaket Pelampung SOLAS",
    engineSpecs: "Diesel 40PK",
    fareLabel: "Tarif PP Tanjung Intan:",
    price: 350000
  },
  {
    id: "10000000-0000-4000-8000-000000000009",
    name: "KM Albatros 06",
    boatTypeTag: "Speedboat Fiber Cepat",
    rating: 4.7,
    tripsCount: 44,
    captainName: "Mas Rian",
    capacityText: "Maks. 10 Penumpang",
    safetyGear: "12 Pelampung + Life Raft",
    engineSpecs: "Yamaha 85HP",
    fareLabel: "Tarif PP Tanjung Intan:",
    price: 500000
  },
  {
    id: "10000000-0000-4000-8000-000000000010",
    name: "KM Mangrove Explorer 02",
    boatTypeTag: "Kapal Ekowisata",
    rating: 4.8,
    tripsCount: 52,
    captainName: "Kang Udin",
    capacityText: "Maks. 12 Penumpang",
    safetyGear: "Sound Guide + Binokular",
    engineSpecs: "Mesin Diesel Silent 40PK",
    fareLabel: "Tarif Trip Laguna:",
    price: 425000
  },
  {
    id: "10000000-0000-4000-8000-000000000011",
    name: "KM Pesisir Indah 08",
    boatTypeTag: "Kapal Kayu Tradisional",
    rating: 4.6,
    tripsCount: 29,
    captainName: "Pak Warto",
    capacityText: "Maks. 14 Penumpang",
    safetyGear: "16 Jaket Pelampung SOLAS",
    engineSpecs: "Diesel 30PK",
    fareLabel: "Tarif PP Teluk Penyu:",
    price: 325000
  },
  {
    id: "10000000-0000-4000-8000-000000000012",
    name: "KM Cahaya Selatan 10",
    boatTypeTag: "Speedboat Fiber Cepat",
    rating: 4.8,
    tripsCount: 78,
    captainName: "Mas Fajar",
    capacityText: "Maks. 16 Penumpang",
    safetyGear: "18 Pelampung + Life Raft",
    engineSpecs: "Twin Yamaha 150HP",
    fareLabel: "Tarif PP Teluk Penyu:",
    price: 625000
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

export const ReadyFleetSection: React.FC = () => {
  const navigate = useNavigate();
  const [fleet] = useState<FleetBoat[]>(defaultFleet);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingBoat, setPendingBoat] = useState<FleetBoat | null>(null);
  const [pendingBookingBoatId, setPendingBookingBoatId] = useState<string | null>(null);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 10);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scrollFleet = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 440, behavior: "smooth" });
  };

  // DEMO: pakai defaultFleet (12 kapal) langsung.
  // Fetch Supabase dimatikan sementara, karena tabel boats di Supabase
  // hanya berisi 3 kapal dengan nama/kapasitas berbeda, dan query lama
  // memakai .limit(3) sehingga menimpa 12 kapal di atas.
  // Setelah Hadist menjalankan seed-demo-12-kapal-8-paket.sql, tabel
  // boats berisi 12 kapal ini (id UUID sama) — fetch boleh dinyalakan
  // lagi, dan pemesanan online (RPC create_booking) bisa jalan.

  const openWhatsApp = (boat: FleetBoat) => {
    const phone = "6281234567890";
    const message = encodeURIComponent(
      `Halo Nakhoda ${boat.captainName}, saya ingin menanyakan jadwal ketersediaan kapal ${boat.name} (${boat.boatTypeTag}) untuk penyeberangan wisata Teluk Penyu - Nusakambangan.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleChatCaptain = async (boat: FleetBoat) => {
    const authRes = supabase.auth.getSession ? await supabase.auth.getSession() : null;
    if (!authRes?.data?.session) {
      setPendingBoat(boat);
      setAuthOpen(true);
      return;
    }
    openWhatsApp(boat);
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    if (pendingBookingBoatId) {
      const boatId = pendingBookingBoatId;
      setPendingBookingBoatId(null);
      navigate(`/booking?boat=${encodeURIComponent(boatId)}`);
    } else if (pendingBoat) {
      openWhatsApp(pendingBoat);
      setPendingBoat(null);
    }
  };

  const handleBookNow = async (boatId: string) => {
    const authRes = supabase.auth.getSession ? await supabase.auth.getSession() : null;
    if (!authRes?.data?.session) {
      if (typeof toast.info === "function") {
        toast.info("Silakan login terlebih dahulu untuk memesan tiket.");
      } else if (typeof toast.error === "function") {
        toast.error("Silakan login terlebih dahulu untuk memesan tiket.");
      }
      setPendingBookingBoatId(boatId);
      setAuthOpen(true);
      return;
    }
    navigate(`/booking?boat=${encodeURIComponent(boatId)}`);
  };

  return (
    <section id="armada-siap-berlayar" className="py-20 sm:py-24 bg-[#F8FAFC] text-slate-900 relative overflow-hidden border-t border-slate-200/60">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* id="boats": target semua tautan #boats di landing */}
      <div id="boats" className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header & KSOP Verified Badge */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 sm:mb-14"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Armada Siap Berlayar Hari Ini
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Setiap kapal menampilkan spesifikasi, kapasitas, dan harga sewanya di depan.
            </p>
          </div>

          {/* KSOP Verified Indicator Pill with Floating Animation */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-sky-100/80 border border-sky-200 text-sky-950 shadow-sm self-start md:self-auto"
          >
            <div className="p-1.5 rounded-xl bg-sky-500/20 text-sky-800">
              <ShieldCheck className="h-6 w-6 text-sky-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none text-sky-950">
                12 Kapal
              </span>
              <span className="text-xs font-semibold text-sky-800">
                Terdaftar & Siap Disewa
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Slider armada: 12 kapal, geser untuk melihat semuanya */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <span className="text-xs font-semibold text-slate-500 mr-auto">
            Geser untuk melihat {fleet.length} kapal
          </span>
          <button
            type="button"
            onClick={() => scrollFleet(-1)}
            disabled={!canPrev}
            aria-label="Kapal sebelumnya"
            className="p-2.5 rounded-full border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollFleet(1)}
            disabled={!canNext}
            aria-label="Kapal berikutnya"
            className="p-2.5 rounded-full border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex gap-6 sm:gap-8 overflow-x-auto snap-x snap-mandatory pb-4 mb-6 [scrollbar-width:thin] [-ms-overflow-style:auto]"
        >
          {fleet.map((boat) => (
            <motion.div
              key={boat.id}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="snap-start shrink-0 w-[85%] sm:w-[400px] lg:w-[calc(33.333%-22px)] bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between"
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
                <h3
                  className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1 cursor-pointer hover:text-sky-700 transition-colors"
                  onClick={() => navigate(`/boat/${boat.id}`)}
                >
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
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleChatCaptain(boat)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-sky-50/50 hover:border-sky-300 text-slate-800 text-xs sm:text-sm font-bold transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 text-slate-600" />
                    <span>Chat Nelayan</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleBookNow(boat.id)}
                    className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-[#0B1528] hover:bg-[#15233e] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Pesan Sekarang
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        </motion.div>
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setPendingBoat(null);
          setPendingBookingBoatId(null);
        }}
        onSuccess={handleAuthSuccess}
      />
    </section>
  );
};

export default ReadyFleetSection;

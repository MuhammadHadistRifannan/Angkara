import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AuthModal } from "@/components/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { findDemoPackage } from "@/lib/demoFallback";
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  Compass,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  CalendarCheck,
  LifeBuoy,
  Anchor,
  Sparkles,
} from "lucide-react";

import imgTourTelukPenyu from "@/assets/tour-teluk-penyu.png";
import imgTourMangrove from "@/assets/tour-mangrove-anakan.png";
import imgTourMancing from "@/assets/tour-mancing-mercusuar.png";
import destKarangBolong from "@/assets/dest-karang-bolong.jpg";
import destMercusuarCimiring from "@/assets/dest-mercusuar-cimiring.png";
import destSegaraAnakan from "@/assets/dest-segara-anakan.png";

interface RoutePackageData {
  id: string;
  name: string;
  destination: string;
  category: string;
  durationLabel: string;
  distance: string;
  description: string;
  price: number;
  unit: string;
  includes: string[];
  maxParticipants: number;
  imageUrl: string;
  itinerary: { step: string; title: string; desc: string }[];
}

const DEFAULT_IMAGES: Record<string, string> = {
  mangrove: imgTourMangrove,
  mancing: imgTourMancing,
  keluarga: imgTourTelukPenyu,
};

const DEST_IMAGES: Record<string, string> = {
  "Pantai Permisan": imgTourTelukPenyu,
  "Laguna Segara Anakan": destSegaraAnakan || imgTourMangrove,
  "Mercusuar Cimiring": destMercusuarCimiring || imgTourMancing,
  "Pantai Karang Bolong": destKarangBolong || imgTourTelukPenyu,
};

export const RouteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState<RoutePackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPackage = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      // 1. Coba muat dari Supabase
      try {
        const { data, error } = await supabase
          .from("tour_packages")
          .select("id, name, description, duration_hours, price, includes, max_participants")
          .eq("id", id)
          .single();

        if (!error && data && !cancelled) {
          const hours = data.duration_hours || 2;
          setPkg({
            id: data.id,
            name: data.name,
            destination: "Pesisir & Perairan Cilacap",
            category: "Bahari",
            durationLabel: `${hours} Jam`,
            distance: `${(hours * 4.2).toFixed(1)} km`,
            description: data.description || "Jelajah wisata bahari aman dan berkesan bersama nelayan lokal Cilacap.",
            price: data.price,
            unit: "/ orang",
            includes: (data.includes as string[]) || ["Pelampung Standar SOLAS", "Pemandu Lokal"],
            maxParticipants: data.max_participants || 10,
            imageUrl: imgTourMangrove,
            itinerary: [
              {
                step: "01",
                title: "Titik Kumpul & Safety Briefing",
                desc: "Pemeriksaan rompi pelampung SOLAS dan pengenalan nakhoda berlisensi di dermaga keberangkatan.",
              },
              {
                step: "02",
                title: "Navigasi Alur Pelayaran Aman",
                desc: "Menyusuri perairan tenang sesuai rekomendasi peta keselamatan syahbandar BMKG & KSOP.",
              },
              {
                step: "03",
                title: "Eksplorasi Spot Wisata Utama",
                desc: "Menikmati keindahan panorama alami, dokumentasi foto, dan aktivitas rekreasi bahari.",
              },
              {
                step: "04",
                title: "Perjalanan Kembali & Sandar",
                desc: "Pelayaran pulang yang nyaman menuju dermaga asal dengan pendampingan penuh.",
              },
            ],
          });
          setLoading(false);
          return;
        }
      } catch {
        // Fallback ke demo data
      }

      // 2. Fallback ke Demo Data jika id cocok dengan demo
      const demo = findDemoPackage(id);
      if (demo && !cancelled) {
        const img = DEST_IMAGES[demo.destination] || DEFAULT_IMAGES[demo.category] || imgTourTelukPenyu;
        setPkg({
          id: demo.id,
          name: demo.name,
          destination: demo.destination,
          category: demo.category === "mangrove" ? "Ekowisata Edukasi" : demo.category === "mancing" ? "Mancing & Petualangan" : "Wisata Keluarga",
          durationLabel: demo.durationLabel,
          distance: demo.durationHours ? `${(demo.durationHours * 4.2).toFixed(1)} km` : "5,0 km",
          description: demo.description,
          price: demo.price,
          unit: demo.unit,
          includes: demo.includes.length > 0 ? demo.includes : ["Pelampung SOLAS", "Pemandu Berlisensi"],
          maxParticipants: 10,
          imageUrl: img,
          itinerary: [
            {
              step: "01",
              title: "Registrasi & Safety Briefing Dermaga",
              desc: "Pemberangkatan dari dermaga resmi Cilacap, fitting jaket pelampung SOLAS anak & dewasa.",
            },
            {
              step: "02",
              title: "Susur Alur Maritim Bersejarah",
              desc: "Pelayaran menyusuri perairan Teluk Penyu / Laguna Segara Anakan dengan panduan cuaca BMKG.",
            },
            {
              step: "03",
              title: `Tiba di Destinasi: ${demo.destination}`,
              desc: "Eksplorasi keindahan alam pesisir, susur ekosistem, spot foto cagar alam, atau sensasi memancing.",
            },
            {
              step: "04",
              title: "Perjalanan Kembali ke Dermaga",
              desc: "Kembali berlayar dengan armada perahu nelayan terverifikasi dan sandar dengan selamat.",
            },
          ],
        });
      }

      if (!cancelled) {
        setLoading(false);
      }
    };

    loadPackage();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBookingClick = async () => {
    if (!pkg) return;

    // Autentikasi ketat: semua aktivitas booking wajib login terlebih dahulu
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("Silakan masuk ke akun Anda terlebih dahulu untuk melanjutkan booking rute ini.");
      setAuthOpen(true);
      return;
    }

    // Jika sudah login, langsung arahkan ke halaman booking paket ini
    navigate(`/booking?packageId=${encodeURIComponent(pkg.id)}`);
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    if (pkg) {
      toast.success("Berhasil masuk! Melanjutkan ke halaman pemesanan...");
      navigate(`/booking?packageId=${encodeURIComponent(pkg.id)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Navbar />
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Memuat detail rute pelayaran...</p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20 text-center max-w-lg">
          <Compass className="w-16 h-16 text-cyan-400 mx-auto mb-4 opacity-80" />
          <h1 className="text-2xl font-bold mb-2">Rute Wisata Tidak Ditemukan</h1>
          <p className="text-slate-400 text-sm mb-6">
            Rute pelayaran yang Anda cari mungkin telah diperbarui atau belum tersedia di sistem.
          </p>
          <Button variant="default" onClick={() => navigate("/tour-packages")}>
            Lihat Semua Paket Tour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Tombol Navigasi Kembali */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Jelajah Rute Wisata</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Kolom Kiri: Detail Rute Utama (Span 2) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Banner Gambar Rute */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 group">
              <img
                src={pkg.imageUrl}
                alt={pkg.name}
                className="w-full h-72 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070D18] via-[#070D18]/40 to-transparent" />

              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <Badge className="bg-cyan-500/90 hover:bg-cyan-500 text-slate-950 font-bold border-0 text-xs px-3 py-1">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {pkg.category}
                </Badge>
                <Badge className="bg-emerald-500/90 text-white font-semibold border-0 text-xs px-3 py-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Terverifikasi KSOP
                </Badge>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-cyan-300 text-xs sm:text-sm font-semibold flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-4 h-4" /> Tujuan: {pkg.destination}
                </p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
                  {pkg.name}
                </h1>
              </div>
            </div>

            {/* 4 Kartu Metrik Ringkasan Rute */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> Durasi Trip
                </span>
                <span className="text-lg font-bold text-white mt-1">{pkg.durationLabel}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" /> Jarak Tempuh
                </span>
                <span className="text-lg font-bold text-white mt-1">{pkg.distance}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-cyan-400" /> Kapasitas Kapal
                </span>
                <span className="text-lg font-bold text-white mt-1">Maks. {pkg.maxParticipants} Org</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <CalendarCheck className="w-3.5 h-3.5 text-cyan-400" /> Jendela Aman
                </span>
                <span className="text-sm font-bold text-emerald-300 mt-1">07.00 - 15.00 WIB</span>
              </div>
            </div>

            {/* Deskripsi & Ringkasan Perjalanan */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <span>Gambaran & Daya Tarik Rute</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {pkg.description}
              </p>
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-3">
                <LifeBuoy className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-cyan-300">Standar Keselamatan Terintegrasi:</span> Seluruh
                  rute ini dipandu nakhoda berpengalaman, wajib menggunakan rompi pelampung SOLAS berstandar
                  internasional, dan diawasi telemetri cuaca maritim live BMKG Cilacap.
                </div>
              </div>
            </div>

            {/* Itinerary Rute Step-by-Step */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Anchor className="w-5 h-5 text-cyan-400" />
                <span>Rencana Perjalanan (Itinerary Rute)</span>
              </h2>

              <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                {pkg.itinerary.map((item, idx) => (
                  <div key={idx} className="relative pl-10">
                    <span className="absolute left-0 top-0.5 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center justify-center">
                      {item.step}
                    </span>
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fasilitas Termasuk */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Fasilitas Termasuk dalam Paket</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {pkg.includes.map((fac, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-sm text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{fac}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Sticky Booking Card (Span 1) */}
          <div className="lg:sticky lg:top-28 space-y-4">
            <Card className="rounded-3xl border-white/15 bg-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden text-slate-100">
              <div className="p-6 sm:p-7 border-b border-white/10">
                <span className="text-xs text-slate-400 font-medium block mb-1">
                  Tarif Resmi Terdaftar
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400">
                    Rp {pkg.price.toLocaleString("id-ID")}
                  </span>
                  <span className="text-sm text-slate-400">{pkg.unit}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  *Termasuk armada kapal operator yang telah dipaketkan dan terverifikasi kelaikan.
                </p>
              </div>

              <CardContent className="p-6 sm:p-7 space-y-5">
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-400">Tujuan Rute</span>
                    <span className="font-semibold text-white">{pkg.destination}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-400">Estimasi Durasi</span>
                    <span className="font-semibold text-white">{pkg.durationLabel}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-400">Kapasitas Maksimal</span>
                    <span className="font-semibold text-white">{pkg.maxParticipants} Penumpang</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-400">Ketentuan Pembayaran</span>
                    <span className="font-semibold text-cyan-300">DP 30%, Pelunasan di Lokasi</span>
                  </div>
                </div>

                {/* Tombol Booking Sekarang dengan Auth Gate */}
                <div className="pt-2 space-y-2">
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleBookingClick}
                    className="w-full text-base font-bold py-6 rounded-2xl shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    Booking Sekarang
                  </Button>
                  <p className="text-[11px] text-center text-slate-400">
                    Semua aktivitas booking wajib masuk / login akun terlebih dahulu.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Kartu Bantuan / Syahbandar Notice */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Jaminan Kelaikan Berlayar</span>
              </div>
              <p className="leading-relaxed">
                Setiap keberangkatan kapal disinkronkan dengan peringatan dini BMKG dan regulasi keselamatan
                pelayaran KSOP Kelas II Cilacap.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Gate Modal jika user belum login */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default RouteDetail;

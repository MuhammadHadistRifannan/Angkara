import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Package as PackageIcon,
  AlertTriangle,
} from "lucide-react";

import imgTourTelukPenyu from "@/assets/tour-teluk-penyu.png";
import imgTourMangrove from "@/assets/tour-mangrove-boat.jpg";
import imgTourMancing from "@/assets/tour-fishing-boat.jpg";
import destKarangBolong from "@/assets/dest-karang-bolong.png";
import destMercusuarCimiring from "@/assets/dest-mercusuar-cimiring.png";
import imgPesisirNusakambangan from "@/assets/tour-pesisir-nusakambangan.jpg";
import imgKarangBolongRocks from "@/assets/tour-karang-bolong.png";
import imgKarangBolongBeach from "@/assets/tour-karang-bolong-beach.jpg";
import imgSunriseBoats from "@/assets/tour-sunrise-boats.jpg";
import imgKarangBolongSouth from "@/assets/tour-karang-bolong-south.jpg";
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
  keluarga: imgPesisirNusakambangan,
};

const DEST_IMAGES: Record<string, string> = {
  "Pantai Permisan": imgPesisirNusakambangan,
  "Laguna Segara Anakan": destSegaraAnakan || imgTourMangrove,
  "Mercusuar Cimiring": destMercusuarCimiring || imgTourMancing,
  "Pantai Karang Bolong": destKarangBolong || imgTourTelukPenyu,
};

// Foto yang sama dengan kartu paket di landing, supaya gambar depan kartu
// sama dengan gambar halaman detail rute (berdasarkan slug di URL).
const PKG_IMAGES: Record<string, string> = {
  "pkg-teluk-penyu": imgPesisirNusakambangan,
  "pkg-segara-anakan": destSegaraAnakan,
  "pkg-mancing-mercusuar": imgTourMancing,
  "pkg-sunset-karang-bolong": imgKarangBolongRocks,
  "pkg-snorkeling-karang-bolong": imgKarangBolongBeach,
  "pkg-susur-tambak": imgTourMangrove,
  "pkg-mancing-malam": imgSunriseBoats,
  "pkg-nusakambangan-sehari": imgKarangBolongSouth,
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
        const img = PKG_IMAGES[id ?? ""] || DEST_IMAGES[demo.destination] || DEFAULT_IMAGES[demo.category] || imgTourTelukPenyu;
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Memuat detail rute pelayaran...</p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 text-center max-w-lg">
          <Compass className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-60" />
          <h1 className="text-2xl font-bold mb-2">Rute Wisata Tidak Ditemukan</h1>
          <p className="text-muted-foreground text-sm mb-6">
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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Tombol Navigasi Kembali */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 -ml-2 text-slate-600 hover:text-slate-900 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Jelajah Rute</span>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Kolom Kiri: Detail Rute Utama (Span 2) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Card Banner Gambar & Judul */}
            <Card className="overflow-hidden border border-slate-200 shadow-sm">
              <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-muted">
                <img
                  src={pkg.imageUrl}
                  alt={pkg.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <Badge className="bg-primary text-white border-0 shadow-sm font-semibold">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    {pkg.category}
                  </Badge>
                  <Badge className="bg-primary text-white font-semibold border-0 shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Terverifikasi KSOP
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary mb-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>Tujuan: {pkg.destination}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
                  {pkg.name}
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {pkg.description}
                </p>
              </CardContent>
            </Card>

            {/* 4 Kartu Metrik Ringkasan Rute */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card className="border border-slate-200 shadow-xs">
                <CardContent className="p-4 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-primary" /> Durasi Trip
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 mt-2">{pkg.durationLabel}</p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-xs">
                <CardContent className="p-4 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Compass className="w-4 h-4 text-primary" /> Jarak Tempuh
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 mt-2">{pkg.distance}</p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-xs">
                <CardContent className="p-4 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Users className="w-4 h-4 text-primary" /> Kapasitas Kapal
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 mt-2">Maks. {pkg.maxParticipants} Org</p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-xs">
                <CardContent className="p-4 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <CalendarCheck className="w-4 h-4 text-emerald-600" /> Jendela Aman
                  </span>
                  <p className="text-sm font-bold text-emerald-700 mt-2">07.00 - 15.00 WIB</p>
                </CardContent>
              </Card>
            </div>

            {/* Jaminan Keselamatan Pelayaran */}
            <Card className="border border-cyan-100 bg-cyan-50/50 shadow-xs">
              <CardContent className="p-5 flex items-start gap-3.5">
                <LifeBuoy className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900">Standar Keselamatan Terintegrasi Syahbandar:</span> Seluruh
                  rute ini dipandu nakhoda lokal terverifikasi, wajib menggunakan rompi pelampung SOLAS berstandar
                  internasional, dan dimonitor melalui telemetri peringatan dini BMKG & KSOP Kelas II Cilacap.
                </div>
              </CardContent>
            </Card>

            {/* Itinerary Rute Step-by-Step */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Anchor className="w-5 h-5 text-primary" />
                  <span>Rencana Perjalanan (Itinerary Rute)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {pkg.itinerary.map((item, idx) => (
                    <div key={idx} className="relative pl-10">
                      <span className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary/10 border-2 border-primary text-primary font-bold text-xs flex items-center justify-center">
                        {item.step}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fasilitas Termasuk */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Fasilitas Termasuk dalam Paket</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-2 gap-3">
                  {pkg.includes.map((fac, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: Sticky Booking Card (Span 1) */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
              <CardHeader className="bg-slate-50/80 p-6 border-b border-slate-100">
                <span className="text-xs text-muted-foreground font-medium block mb-1">
                  Tarif Resmi Terdaftar
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-primary">
                    Rp {pkg.price.toLocaleString("id-ID")}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">{pkg.unit}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Termasuk armada kapal operator yang telah dipaketkan.
                </p>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-muted-foreground">Tujuan Rute</span>
                    <span className="font-semibold text-slate-900">{pkg.destination}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-muted-foreground">Estimasi Durasi</span>
                    <span className="font-semibold text-slate-900">{pkg.durationLabel}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-muted-foreground">Kapasitas Maksimal</span>
                    <span className="font-semibold text-slate-900">{pkg.maxParticipants} Penumpang</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-muted-foreground">Pembayaran</span>
                    <span className="font-semibold text-primary">DP 30%, Pelunasan di Lokasi</span>
                  </div>
                </div>

                {/* Rincian DP */}
                <div className="bg-muted/50 p-4 rounded-xl text-xs space-y-1.5 text-slate-600">
                  <p className="font-semibold text-slate-900">Skema Pembayaran Transparan:</p>
                  <div className="flex justify-between">
                    <span>Uang Muka (DP 30%):</span>
                    <span className="font-bold text-slate-900">Rp {(pkg.price * 0.3).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pelunasan di dermaga (70%):</span>
                    <span className="font-bold text-slate-900">Rp {(pkg.price * 0.7).toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Tombol Booking Sekarang dengan Auth Gate */}
                <div className="pt-2 space-y-2">
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleBookingClick}
                    className="w-full text-base font-bold py-6 shadow-md cursor-pointer"
                  >
                    Booking Sekarang
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground">
                    Semua aktivitas booking wajib masuk / login akun terlebih dahulu.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Kartu Syahbandar Notice */}
            <Card className="border border-slate-200 bg-slate-50/50 shadow-xs">
              <CardContent className="p-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Kepatuhan Regulasi KSOP</span>
                </div>
                <p className="leading-relaxed">
                  Jadwal pelayaran disesuaikan secara dinamis dengan indeks keselamatan maritim BMKG. Bila terjadi
                  cuaca buruk, keberangkatan dapat dijadwalkan ulang demi keselamatan.
                </p>
              </CardContent>
            </Card>
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

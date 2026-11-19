import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/authRoles";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  ShieldCheck,
  Ship,
  Users,
  CalendarCheck,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  LogOut,
  SlidersHorizontal,
  Compass,
  FileCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface OperatorItem {
  id: string;
  name: string;
  contact?: string | null;
  ksop_permit_number?: string | null;
  verified?: boolean | null;
  created_at?: string;
}

interface BoatItem {
  id: string;
  name: string;
  type: string;
  capacity: number;
  is_available: boolean;
  operator_id?: string;
  operators?: { name: string } | null;
}

interface TourPackageItem {
  id: string;
  title: string;
  price: number;
  duration?: string | null;
  is_active: boolean;
  operator_id?: string;
  operators?: { name: string } | null;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  boats?: { name: string } | null;
}

interface BookingItem {
  id: string;
  booking_date: string;
  departure_time: string;
  passengers: number;
  total_price: number;
  booking_status: string;
  boats?: { name: string } | null;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("verifikasi");

  // Data State
  const [operators, setOperators] = useState<OperatorItem[]>([]);
  const [boats, setBoats] = useState<BoatItem[]>([]);
  const [tourPackages, setTourPackages] = useState<TourPackageItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Status Override Berlayar Otoritas
  const [sailingOverride, setSailingOverride] = useState<"auto" | "waspada" | "tunda">("auto");

  // Validasi Role Admin
  useEffect(() => {
    let isMounted = true;

    const verifyAdminRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (!user || !checkIsAdmin(user.user_metadata)) {
          toast.error("Akses ditolak: halaman ini khusus pengelola platform SUAR.");
          navigate("/");
          return;
        }

        setCurrentUser(user);
        setIsLoadingAuth(false);
      } catch (err) {
        if (!isMounted) return;
        toast.error("Gagal memvalidasi sesi admin.");
        navigate("/");
      }
    };

    verifyAdminRole();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Fetch seluruh data platform untuk pengawasan
  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [
        { data: opsData },
        { data: boatsData },
        { data: toursData },
        { data: reviewsData },
        { data: bookingsData },
      ] = await Promise.all([
        supabase.from("operators").select("*").order("created_at", { ascending: false }),
        supabase.from("boats").select("id, name, type, capacity, is_available, operator_id, operators(name)").order("name", { ascending: true }),
        supabase.from("tour_packages").select("id, title, price, duration, is_active, operator_id, operators(name)").order("title", { ascending: true }),
        supabase.from("reviews").select("id, rating, comment, created_at, boats(name)").order("created_at", { ascending: false }),
        supabase.from("bookings").select("id, booking_date, departure_time, passengers, total_price, booking_status, boats(name)").order("booking_date", { ascending: false }),
      ]);

      if (opsData) setOperators(opsData as OperatorItem[]);
      if (boatsData) setBoats(boatsData as unknown as BoatItem[]);
      if (toursData) setTourPackages(toursData as unknown as TourPackageItem[]);
      if (reviewsData) setReviews(reviewsData as unknown as ReviewItem[]);
      if (bookingsData) setBookings(bookingsData as unknown as BookingItem[]);
    } catch (err) {
      console.error("Gagal memuat data platform admin:", err);
      toast.error("Gagal memuat sebagian data platform.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoadingAuth && currentUser) {
      fetchData();
    }
  }, [isLoadingAuth, currentUser, fetchData]);

  // AKSI 1: Verifikasi / Cabut Verifikasi Operator
  const handleToggleVerifyOperator = async (operatorId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const { error } = await supabase
        .from("operators")
        .update({ verified: newStatus })
        .eq("id", operatorId);

      if (error) throw error;

      setOperators((prev) =>
        prev.map((op) => (op.id === operatorId ? { ...op, verified: newStatus } : op))
      );
      toast.success(
        newStatus
          ? "Operator berhasil diverifikasi sebagai mitra resmi SUAR!"
          : "Verifikasi operator telah dicabut."
      );
    } catch (err) {
      toast.error("Gagal memperbarui status verifikasi operator.");
    }
  };

  // AKSI 2: Moderasi Ketersediaan Kapal
  const handleToggleBoatAvailability = async (boatId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const { error } = await supabase
        .from("boats")
        .update({ is_available: newStatus })
        .eq("id", boatId);

      if (error) throw error;

      setBoats((prev) =>
        prev.map((b) => (b.id === boatId ? { ...b, is_available: newStatus } : b))
      );
      toast.success(
        newStatus
          ? "Kapal kembali diaktifkan untuk reservasi."
          : "Kapal dinonaktifkan sementara dari pencarian publik."
      );
    } catch (err) {
      toast.error("Gagal memperbarui status ketersediaan kapal.");
    }
  };

  // AKSI 3: Moderasi Status Paket Tour
  const handleToggleTourPackage = async (tourId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const { error } = await supabase
        .from("tour_packages")
        .update({ is_active: newStatus })
        .eq("id", tourId);

      if (error) throw error;

      setTourPackages((prev) =>
        prev.map((t) => (t.id === tourId ? { ...t, is_active: newStatus } : t))
      );
      toast.success(
        newStatus
          ? "Paket wisata diaktifkan."
          : "Paket wisata dinonaktifkan."
      );
    } catch (err) {
      toast.error("Gagal memperbarui status paket wisata.");
    }
  };

  // AKSI 4: Moderasi Penghapusan Ulasan Tidak Pantas
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Hapus ulasan ini dari platform secara permanen?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Ulasan berhasil dihapus dari platform.");
    } catch (err) {
      toast.error("Gagal menghapus ulasan.");
    }
  };

  // AKSI 5: Override Status Keselamatan Berlayar Otoritas
  const handleApplySailingOverride = (status: "auto" | "waspada" | "tunda") => {
    setSailingOverride(status);
    if (status === "tunda") {
      toast.success("Status pelayaran diubah: SEMUA PELAYANAN DITUNDA OTORITAS KSOP.");
    } else if (status === "waspada") {
      toast.success("Status pelayaran diubah: WASPADA CUACA MARITIM AKTIF.");
    } else {
      toast.success("Status pelayaran dikembalikan ke otomatisasi sensor cuaca BMKG.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-sm font-medium text-slate-300">Memverifikasi otoritas pengelola...</p>
        </div>
      </div>
    );
  }

  const verifiedOperatorsCount = operators.filter((o) => o.verified).length;
  const activeBoatsCount = boats.filter((b) => b.is_available).length;
  const filteredBookings =
    bookingFilter === "all"
      ? bookings
      : bookings.filter((b) => b.booking_status === bookingFilter);

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#090F1C]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Konsol Pengelola Platform SUAR
                </h1>
                <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-400/30 text-[11px] font-semibold">
                  Administrator
                </Badge>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Pengawasan, Verifikasi Mitra, & Moderasi Bahari Pesisir Cilacap
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isRefreshing}
              className="bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 text-xs rounded-xl"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Segarkan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs rounded-xl"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 sm:px-8 py-6 flex-1 space-y-6">
        {/* Ringkasan Metrik Platform */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#0D1527]/80 border-white/10 text-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Mitra Operator
              </CardTitle>
              <Users className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{operators.length}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                <span className="text-emerald-400 font-semibold">{verifiedOperatorsCount}</span> Terverifikasi KSOP
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0D1527]/80 border-white/10 text-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Armada Kapal
              </CardTitle>
              <Ship className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{boats.length}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                <span className="text-cyan-300 font-semibold">{activeBoatsCount}</span> Siap Berlayar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0D1527]/80 border-white/10 text-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Booking
              </CardTitle>
              <CalendarCheck className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{bookings.length}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Seluruh pemesanan platform</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0D1527]/80 border-white/10 text-white shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ulasan Publik
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{reviews.length}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Ulasan pasca-trip wisatawan</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Manajemen */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-[#0D1527] border border-white/10 p-1 rounded-2xl flex flex-wrap gap-1">
            <TabsTrigger
              value="verifikasi"
              className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-xs font-semibold"
            >
              <FileCheck className="h-3.5 w-3.5 mr-1.5" />
              Verifikasi Operator ({operators.length})
            </TabsTrigger>
            <TabsTrigger
              value="kapal"
              className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-xs font-semibold"
            >
              <Ship className="h-3.5 w-3.5 mr-1.5" />
              Moderasi Kapal & Paket ({boats.length + tourPackages.length})
            </TabsTrigger>
            <TabsTrigger
              value="ulasan"
              className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-xs font-semibold"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Moderasi Ulasan ({reviews.length})
            </TabsTrigger>
            <TabsTrigger
              value="booking"
              className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-xs font-semibold"
            >
              <CalendarCheck className="h-3.5 w-3.5 mr-1.5" />
              Pantauan Booking ({bookings.length})
            </TabsTrigger>
            <TabsTrigger
              value="override"
              className="rounded-xl data-[state=active]:bg-cyan-500 data-[state=active]:text-white text-xs font-semibold"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
              Kontrol Berlayar
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Verifikasi Operator */}
          <TabsContent value="verifikasi" className="space-y-4">
            <Card className="bg-[#090F1C]/80 border-white/10 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-cyan-400" />
                  Daftar Pengajuan & Status Legalitas Operator
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Tinjau nomor izin resmi KSOP dan status keanggotaan operator sebelum memberikan badge terverifikasi.
                </p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-white/5 uppercase text-[10px] text-slate-400 tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Nama Operator / Koperasi</th>
                      <th className="px-4 py-3">Kontak</th>
                      <th className="px-4 py-3">Nomor Registrasi KSOP</th>
                      <th className="px-4 py-3">Status Verifikasi</th>
                      <th className="px-4 py-3 text-right rounded-r-xl">Aksi Otoritas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {operators.map((op) => (
                      <tr key={op.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-white">{op.name}</td>
                        <td className="px-4 py-3.5 text-slate-300">{op.contact || "—"}</td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-cyan-300">
                          {op.ksop_permit_number || "Belum dilampirkan"}
                        </td>
                        <td className="px-4 py-3.5">
                          {op.verified ? (
                            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Terverifikasi
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30">
                              <AlertTriangle className="h-3 w-3 mr-1" /> Menunggu Tinjauan
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleVerifyOperator(op.id, !!op.verified)}
                            className={
                              op.verified
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs rounded-xl"
                                : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs rounded-xl"
                            }
                          >
                            {op.verified ? "Cabut Verifikasi" : "Setujui"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {operators.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">
                          Belum ada data operator terdaftar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Moderasi Kapal & Paket */}
          <TabsContent value="kapal" className="space-y-6">
            {/* Sub-section: Kapal */}
            <Card className="bg-[#090F1C]/80 border-white/10 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Ship className="h-5 w-5 text-cyan-400" />
                  Moderasi Kelaikan & Ketersediaan Armada Kapal
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Admin berhak menonaktifkan kapal dari pencarian wisatawan bila ditemukan masalah keselamatan atau komplain berulang.
                </p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-white/5 uppercase text-[10px] text-slate-400 tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Nama Kapal</th>
                      <th className="px-4 py-3">Operator</th>
                      <th className="px-4 py-3">Jenis & Kapasitas</th>
                      <th className="px-4 py-3">Status Ketersediaan</th>
                      <th className="px-4 py-3 text-right rounded-r-xl">Aksi Moderasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {boats.map((boat) => (
                      <tr key={boat.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-white">{boat.name}</td>
                        <td className="px-4 py-3.5 text-slate-300">{boat.operators?.name || "—"}</td>
                        <td className="px-4 py-3.5 text-slate-300">
                          {boat.type === "speedboat" ? "Speedboat Cepat" : "Kapal Kayu Wisata"} • {boat.capacity} org
                        </td>
                        <td className="px-4 py-3.5">
                          {boat.is_available ? (
                            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                              Aktif Melayani
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-500/15 text-rose-300 border-rose-500/30">
                              Dinonaktifkan Admin
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleBoatAvailability(boat.id, boat.is_available)}
                            className={
                              boat.is_available
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs rounded-xl"
                                : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs rounded-xl"
                            }
                          >
                            {boat.is_available ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Sub-section: Paket Tour */}
            <Card className="bg-[#090F1C]/80 border-white/10 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Compass className="h-5 w-5 text-cyan-400" />
                  Moderasi Paket Wisata Bahari
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Pastikan paket wisata mematuhi standar keselamatan dan tarif batas atas KSOP Teluk Penyu.
                </p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-white/5 uppercase text-[10px] text-slate-400 tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Judul Paket</th>
                      <th className="px-4 py-3">Operator</th>
                      <th className="px-4 py-3">Durasi</th>
                      <th className="px-4 py-3">Harga</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right rounded-r-xl">Aksi Moderasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tourPackages.map((tour) => (
                      <tr key={tour.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-white">{tour.title}</td>
                        <td className="px-4 py-3.5 text-slate-300">{tour.operators?.name || "—"}</td>
                        <td className="px-4 py-3.5 text-slate-300">{tour.duration || "Fleksibel"}</td>
                        <td className="px-4 py-3.5 font-medium text-cyan-300">
                          Rp {tour.price.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3.5">
                          {tour.is_active ? (
                            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                              Tayang
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-500/20 text-slate-300 border-white/10">
                              Nonaktif
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleTourPackage(tour.id, tour.is_active)}
                            className={
                              tour.is_active
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs rounded-xl"
                                : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs rounded-xl"
                            }
                          >
                            {tour.is_active ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Moderasi Ulasan */}
          <TabsContent value="ulasan" className="space-y-4">
            <Card className="bg-[#090F1C]/80 border-white/10 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-400" />
                  Moderasi Ulasan Wisatawan
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Hapus komentar yang mengandung unsur spam, ujaran kebencian, atau penipuan demi kenyamanan komunitas.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">{rev.boats?.name || "Kapal"}</span>
                        <span className="text-amber-400 text-xs">{"★".repeat(rev.rating)}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rev.created_at).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{rev.comment || "Tidak ada komentar"}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteReview(rev.id)}
                      className="bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs rounded-xl shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Hapus Ulasan
                    </Button>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Tidak ada ulasan yang perlu dimoderasi.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Pantauan Semua Booking */}
          <TabsContent value="booking" className="space-y-4">
            <Card className="bg-[#090F1C]/80 border-white/10 text-white shadow-xl">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-emerald-400" />
                    Log Seluruh Transaksi & Booking Platform
                  </CardTitle>
                  <p className="text-xs text-slate-400">
                    Pemantauan read-only seluruh manifes reservasi penyeberangan Teluk Penyu & Nusakambangan.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Filter:</span>
                  <select
                    value={bookingFilter}
                    onChange={(e) => setBookingFilter(e.target.value)}
                    className="bg-[#0D1527] border border-white/15 text-xs text-white rounded-xl px-2.5 py-1.5 outline-none"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-white/5 uppercase text-[10px] text-slate-400 tracking-wider">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">ID Booking</th>
                      <th className="px-4 py-3">Kapal</th>
                      <th className="px-4 py-3">Jadwal Keberangkatan</th>
                      <th className="px-4 py-3">Penumpang</th>
                      <th className="px-4 py-3">Total Bayar</th>
                      <th className="px-4 py-3 text-right rounded-r-xl">Status Manifes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5 font-mono text-[11px] text-cyan-300">
                          {b.id.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-white">{b.boats?.name || "—"}</td>
                        <td className="px-4 py-3.5 text-slate-300">
                          {b.booking_date} • {b.departure_time} WIB
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">{b.passengers} Penumpang</td>
                        <td className="px-4 py-3.5 font-semibold text-emerald-300">
                          Rp {b.total_price.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Badge
                            className={
                              b.booking_status === "confirmed"
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : b.booking_status === "completed"
                                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                                : b.booking_status === "cancelled"
                                ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            }
                          >
                            {b.booking_status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          Tidak ada booking yang cocok dengan filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: Kontrol Berlayar (Harbor Emergency Override) */}
          <TabsContent value="override" className="space-y-4">
            <Card className="bg-[#090F1C]/80 border-white/10 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
                  Override Status Keselamatan Pelayaran
                </CardTitle>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gunakan kendali darurat ini bila KSOP Cilacap mengeluarkan instruksi larangan berlayar resmi (Notam/Surat Edaran Cuaca Ekstrem) yang mendahului perhitungan otomatis BMKG.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                      Mode Otoritas Saat Ini:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {sailingOverride === "auto" && "Mode Otomatis (Sensor BMKG / Open-Meteo)"}
                        {sailingOverride === "waspada" && "Waspada Khusus Otoritas KSOP"}
                        {sailingOverride === "tunda" && "DITUNDA TOTAL (Larangan Berlayar Aktif)"}
                      </span>
                      <Badge
                        className={
                          sailingOverride === "auto"
                            ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                            : sailingOverride === "waspada"
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                        }
                      >
                        {sailingOverride.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplySailingOverride("auto")}
                      className={`text-xs rounded-xl ${
                        sailingOverride === "auto"
                          ? "bg-cyan-500 text-white border-cyan-400"
                          : "bg-white/5 border-white/10 text-slate-300"
                      }`}
                    >
                      Otomatis BMKG
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplySailingOverride("waspada")}
                      className={`text-xs rounded-xl ${
                        sailingOverride === "waspada"
                          ? "bg-amber-500 text-slate-950 font-semibold border-amber-400"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      }`}
                    >
                      Peringatan Waspada
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplySailingOverride("tunda")}
                      className={`text-xs rounded-xl ${
                        sailingOverride === "tunda"
                          ? "bg-rose-600 text-white font-semibold border-rose-500"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      }`}
                    >
                      Tunda Semua Pelayaran
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                  <p className="leading-relaxed">
                    Pengubahan status berlayar ke <strong>Tunda Semua Pelayaran</strong> akan menghentikan sementara pembuatan booking baru di seluruh armada demi keselamatan penumpang sesuai regulasi KSOP.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  Ship,
  Calendar,
  DollarSign,
  Users,
  Plus,
  TrendingUp,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Anchor,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { BoatModal, type OperatorBoatData } from "@/components/BoatModal";

interface OperatorData {
  id: string;
  user_id?: string;
  company_name: string;
  ksop_certificate?: string | null;
  verified: boolean;
  phone: string;
  email: string;
}

interface OperatorBoat {
  id: string;
  operator_id: string;
  name: string;
  type: string;
  capacity: number;
  base_price: number;
  available: boolean;
  image_url?: string | null;
}

interface OperatorBooking {
  id: string;
  user_id: string;
  boat_id: string;
  booking_date: string;
  departure_time: string;
  passengers: number;
  total_price: number;
  booking_status: "pending" | "confirmed" | "completed" | "cancelled";
  payment_status: "pending" | "paid" | "dp_paid" | "refunded";
  notes?: string | null;
  created_at?: string;
  boats?: {
    id: string;
    operator_id: string;
    name: string;
    type: string;
  } | null;
}

type BookingFilterType = "all" | "pending" | "confirmed" | "completed" | "cancelled";

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const [operator, setOperator] = useState<OperatorData | null>(null);
  const [boats, setBoats] = useState<OperatorBoat[]>([]);
  const [bookings, setBookings] = useState<OperatorBooking[]>([]);
  const [bookingFilter, setBookingFilter] = useState<BookingFilterType>("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isBoatModalOpen, setIsBoatModalOpen] = useState(false);
  const [selectedBoatToEdit, setSelectedBoatToEdit] = useState<OperatorBoat | null>(null);
  const [isTogglingBoat, setIsTogglingBoat] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalBoats: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
  });

  useEffect(() => {
    const checkOperator = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // 1. Cari berdasarkan user_id
      let { data: operatorData } = await supabase
        .from("operators")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // 2. Fallback: Cari berdasarkan email dan otomatis tautkan user_id jika ada
      if (!operatorData && user.email) {
        const { data: opByEmail } = await supabase
          .from("operators")
          .select("*")
          .eq("email", user.email.trim().toLowerCase())
          .maybeSingle();

        if (opByEmail) {
          operatorData = opByEmail;
          if (!opByEmail.user_id) {
            await supabase
              .from("operators")
              .update({ user_id: user.id })
              .eq("id", opByEmail.id);
          }
        }
      }

      // 3. Fallback: Jika metadata akun bertipe operator, buatkan record baru
      if (!operatorData && user.user_metadata?.role === "operator") {
        const { data: newOp } = await supabase
          .from("operators")
          .insert({
            user_id: user.id,
            company_name:
              (user.user_metadata?.company_name as string) ||
              (user.user_metadata?.full_name as string) ||
              "Operator Mandiri",
            email: user.email || "",
            phone: (user.user_metadata?.phone as string) || "-",
            verified: true,
          })
          .select()
          .single();

        if (newOp) {
          operatorData = newOp;
        }
      }

      if (!operatorData) {
        toast.error("Anda belum terdaftar sebagai operator kapal");
        navigate("/dashboard");
        return;
      }

      setOperator(operatorData as OperatorData);
      fetchBoats(operatorData.id);
      fetchBookings(operatorData.id);
    };
    checkOperator();
  }, [navigate]);

  const fetchBoats = async (operatorId: string) => {
    const { data, error } = await supabase
      .from("boats")
      .select("*")
      .eq("operator_id", operatorId);

    if (!error && data) {
      setBoats(data as OperatorBoat[]);
      setStats((prev) => ({ ...prev, totalBoats: data.length }));
    }
  };

  const fetchBookings = async (operatorId: string) => {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        boats!inner (
          id,
          operator_id,
          name,
          type
        )
      `)
      .eq("boats.operator_id", operatorId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const typedData = data as unknown as OperatorBooking[];
      setBookings(typedData);
      const totalRevenue = typedData.reduce((sum, b) => sum + (b.total_price || 0), 0);
      const pending = typedData.filter((b) => b.booking_status === "pending").length;
      setStats((prev) => ({
        ...prev,
        totalBookings: typedData.length,
        totalRevenue,
        pendingBookings: pending,
      }));
    }
  };

  // Aksi Manajemen Armada Kapal (Tambah / Edit / Toggle Kelaikan)
  const handleOpenAddBoat = () => {
    setSelectedBoatToEdit(null);
    setIsBoatModalOpen(true);
  };

  const handleOpenEditBoat = (boat: OperatorBoat) => {
    setSelectedBoatToEdit(boat);
    setIsBoatModalOpen(true);
  };

  const handleBoatSaved = (savedBoat: OperatorBoatData) => {
    setBoats((prev) => {
      const exists = prev.some((b) => b.id === savedBoat.id);
      if (exists) {
        return prev.map((b) => (b.id === savedBoat.id ? ({ ...b, ...savedBoat } as OperatorBoat) : b));
      } else {
        return [...prev, savedBoat as OperatorBoat];
      }
    });
    setStats((prev) => ({
      ...prev,
      totalBoats: boats.some((b) => b.id === savedBoat.id) ? prev.totalBoats : prev.totalBoats + 1,
    }));
  };

  const handleToggleBoatAvailability = async (boat: OperatorBoat) => {
    const newStatus = !boat.available;
    try {
      setIsTogglingBoat(boat.id);
      const { error } = await supabase
        .from("boats")
        .update({ available: newStatus })
        .eq("id", boat.id);

      if (error) throw error;

      setBoats((prev) =>
        prev.map((b) => (b.id === boat.id ? { ...b, available: newStatus } : b))
      );

      toast.success(
        `Status kelaikan ${boat.name} diubah menjadi: ${
          newStatus ? "Tersedia Berlayar" : "Docking / Perawatan"
        }`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengubah status kelaikan kapal";
      toast.error(msg);
    } finally {
      setIsTogglingBoat(null);
    }
  };

  // Aksi persetujuan booking ke database Supabase
  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: "confirmed" | "completed" | "cancelled"
  ) => {
    try {
      setIsUpdating(bookingId);
      const { error } = await supabase
        .from("bookings")
        .update({ booking_status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, booking_status: newStatus } : b))
      );

      setStats((prev) => {
        const updated = bookings.map((b) =>
          b.id === bookingId ? { ...b, booking_status: newStatus } : b
        );
        return {
          ...prev,
          pendingBookings: updated.filter((b) => b.booking_status === "pending").length,
        };
      });

      if (newStatus === "confirmed") {
        toast.success("Booking berhasil dikonfirmasi");
      } else if (newStatus === "completed") {
        toast.success("Pelayaran berhasil diselesaikan! Wisatawan kini dapat memberikan ulasan.");
      } else if (newStatus === "cancelled") {
        toast.success("Booking telah dibatalkan / ditolak");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui status booking";
      toast.error(msg);
    } finally {
      setIsUpdating(null);
    }
  };

  // Tautan komunikasi WhatsApp langsung ke wisatawan
  const handleChatCustomer = (booking: OperatorBooking) => {
    const dateStr = new Date(booking.booking_date).toLocaleDateString("id-ID");
    const ticketCode = `SUAR-${booking.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
    const message = encodeURIComponent(
      `Halo Pelanggan SUAR, ini dari operator kapal ${
        booking.boats?.name || "wisata"
      }. Mengenai pesanan tiket ${ticketCode} untuk keberangkatan ${dateStr} jam ${booking.departure_time.slice(
        0,
        5
      )} WIB (${booking.passengers} penumpang). Ada yang bisa kami bantu informasikan sebelum keberangkatan?`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs hover:bg-amber-100">
            Menunggu Konfirmasi
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-xs hover:bg-emerald-100">
            Terkonfirmasi
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-bold text-xs hover:bg-sky-100">
            Trip Selesai
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-rose-100 text-rose-900 border-rose-300 font-bold text-xs hover:bg-rose-100">
            Dibatalkan
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Perhitungan filter
  const pendingCount = bookings.filter((b) => b.booking_status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.booking_status === "confirmed").length;
  const completedCount = bookings.filter((b) => b.booking_status === "completed").length;
  const cancelledCount = bookings.filter((b) => b.booking_status === "cancelled").length;

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "all") return true;
    return b.booking_status === bookingFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header Konsol Operator */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold mb-2">
                <Anchor className="h-3.5 w-3.5 text-cyan-600" />
                <span>Konsol Syahbandar & Mitra Operator</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Dashboard Operator
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                {operator?.company_name || "Kelola armada kapal, persetujuan booking, dan pelayaran."}
              </p>
            </div>

            {operator?.verified && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Terverifikasi KSOP Kelas II Cilacap</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kapal</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.totalBoats}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <Ship className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Booking</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Calendar className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimasi Omzet</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Rp {(stats.totalRevenue / 1000000).toFixed(1)}jt
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Perlu Persetujuan</p>
                <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{stats.pendingBookings}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="boats" className="space-y-6">
          <TabsList className="p-1 bg-slate-200/80 rounded-2xl h-11 inline-flex">
            <TabsTrigger
              value="boats"
              className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
            >
              Kapal Saya
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <span>Booking</span>
              {pendingCount > 0 && (
                <span className="h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
            >
              Analitik
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Kapal Saya */}
          <TabsContent value="boats" className="space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">Daftar Armada Kapal</h2>
                <p className="text-xs text-slate-500">Kelola spesifikasi, kapasitas, dan tarif sewa kapal Anda.</p>
              </div>
              <Button
                variant="hero"
                onClick={handleOpenAddBoat}
                className="rounded-xl text-xs font-bold gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Kapal
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boats.map((boat) => (
                <Card key={boat.id} className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
                  <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold text-slate-900">{boat.name}</CardTitle>
                      <Badge variant="outline" className="text-[11px] font-semibold capitalize">
                        {boat.type.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Kapasitas Maksimal:</span>
                        <span className="font-bold text-slate-800">{boat.capacity} Orang</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Tarif Dasar Sewa:</span>
                        <span className="font-bold text-cyan-800">Rp {boat.base_price.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Status Kelaikan:</span>
                        <span
                          className={`font-bold ${
                            boat.available ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {boat.available ? "Tersedia Berlayar" : "Docking / Perawatan"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditBoat(boat)}
                        className="flex-1 rounded-xl text-xs font-bold border-slate-200"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isTogglingBoat === boat.id}
                        onClick={() => handleToggleBoatAvailability(boat)}
                        className={`flex-1 rounded-xl text-xs font-bold ${
                          boat.available
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {boat.available ? "Set Docking" : "Set Tersedia"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: Konsol Booking */}
          <TabsContent value="bookings" className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">Konsol Persetujuan Booking</h2>
                <p className="text-xs text-slate-500">
                  Konfirmasi atau selesaikan pesanan wisatawan untuk menjamin kelaikan manifes kapal.
                </p>
              </div>

              {/* Filter Status Bar */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl">
                <Button
                  aria-label="Filter status: Semua"
                  variant={bookingFilter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBookingFilter("all")}
                  className={`rounded-xl text-xs font-bold gap-1.5 h-8 ${
                    bookingFilter === "all" ? "bg-[#090D16] text-white shadow-sm" : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span>Semua</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300 text-slate-800">
                    {bookings.length}
                  </span>
                </Button>
                <Button
                  aria-label="Filter status: Menunggu"
                  variant={bookingFilter === "pending" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBookingFilter("pending")}
                  className={`rounded-xl text-xs font-bold gap-1.5 h-8 ${
                    bookingFilter === "pending" ? "bg-[#090D16] text-white shadow-sm" : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span>Menunggu</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-amber-950 font-black">
                    {pendingCount}
                  </span>
                </Button>
                <Button
                  aria-label="Filter status: Terkonfirmasi"
                  variant={bookingFilter === "confirmed" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBookingFilter("confirmed")}
                  className={`rounded-xl text-xs font-bold gap-1.5 h-8 ${
                    bookingFilter === "confirmed" ? "bg-[#090D16] text-white shadow-sm" : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span>Terkonfirmasi</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-400 text-emerald-950 font-black">
                    {confirmedCount}
                  </span>
                </Button>
                <Button
                  aria-label="Filter status: Selesai"
                  variant={bookingFilter === "completed" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBookingFilter("completed")}
                  className={`rounded-xl text-xs font-bold gap-1.5 h-8 ${
                    bookingFilter === "completed" ? "bg-[#090D16] text-white shadow-sm" : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span>Selesai</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-300 text-sky-950 font-black">
                    {completedCount}
                  </span>
                </Button>
                <Button
                  aria-label="Filter status: Dibatalkan"
                  variant={bookingFilter === "cancelled" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBookingFilter("cancelled")}
                  className={`rounded-xl text-xs font-bold gap-1.5 h-8 ${
                    bookingFilter === "cancelled" ? "bg-[#090D16] text-white shadow-sm" : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span>Dibatalkan</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-300 text-rose-950 font-black">
                    {cancelledCount}
                  </span>
                </Button>
              </div>
            </div>

            {/* List Booking */}
            {filteredBookings.length === 0 ? (
              <Card className="rounded-2xl border-slate-200 border-dashed p-8 text-center bg-white">
                <Ticket className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700 text-sm">Tidak ada booking untuk filter ini</h3>
                <p className="text-xs text-slate-500 mt-1">Pilih filter lain untuk melihat pesanan lainnya.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const ticketCode = `SUAR-${booking.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
                  return (
                    <Card key={booking.id} className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
                      <CardContent className="p-5">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {ticketCode}
                              </span>
                              {getStatusBadge(booking.booking_status)}
                              <span className="text-xs text-slate-500 font-medium">
                                Pembayaran:{" "}
                                <strong className="text-slate-800 uppercase text-[11px]">
                                  {booking.payment_status}
                                </strong>
                              </span>
                            </div>

                            <h3 className="font-black text-lg text-slate-900 pt-1">
                              {booking.boats?.name || "Kapal Wisata"}
                            </h3>
                            <p className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                              <span>
                                Jadwal:{" "}
                                <strong className="text-slate-900">
                                  {new Date(booking.booking_date).toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Jam: <strong className="text-slate-900">{booking.departure_time.slice(0, 5)} WIB</strong>
                              </span>
                              <span>•</span>
                              <span>
                                Penumpang: <strong className="text-slate-900">{booking.passengers} Orang</strong>
                              </span>
                            </p>
                          </div>

                          <div className="text-right sm:self-center">
                            <span className="text-xs text-slate-500 block">Total Tarif Pelayaran</span>
                            <span className="text-xl font-black text-cyan-800 block">
                              Rp {booking.total_price.toLocaleString("id-ID")}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              DP 30%: Rp {(booking.total_price * 0.3).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mt-3 bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl text-xs text-amber-900">
                            <strong className="block font-bold">Catatan Wisatawan:</strong>
                            <span>{booking.notes}</span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                          {booking.booking_status === "pending" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                disabled={isUpdating === booking.id}
                                onClick={() => handleUpdateBookingStatus(booking.id, "confirmed")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Terima Booking</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isUpdating === booking.id}
                                onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")}
                                className="rounded-xl text-xs font-semibold border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 gap-1.5"
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Tolak Booking</span>
                              </Button>
                            </>
                          )}

                          {booking.booking_status === "confirmed" && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                disabled={isUpdating === booking.id}
                                onClick={() => handleUpdateBookingStatus(booking.id, "completed")}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
                              >
                                <Anchor className="h-4 w-4" />
                                <span>Selesaikan Trip</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isUpdating === booking.id}
                                onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")}
                                className="rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                              >
                                <span>Batalkan Booking</span>
                              </Button>
                            </>
                          )}

                          {booking.booking_status === "completed" && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100">
                              <CheckCircle2 className="h-4 w-4 text-sky-600" />
                              <span>Pelayaran Telah Selesai</span>
                            </div>
                          )}

                          {booking.booking_status === "cancelled" && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
                              <XCircle className="h-4 w-4 text-rose-600" />
                              <span>Booking Telah Dibatalkan</span>
                            </div>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChatCustomer(booking)}
                            className="rounded-xl text-xs font-semibold border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 gap-1.5 ml-auto"
                          >
                            <MessageCircle className="h-4 w-4 text-emerald-600" />
                            <span>Chat Wisatawan</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: Analitik */}
          <TabsContent value="analytics" className="space-y-4 animate-in fade-in duration-200">
            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <TrendingUp className="h-5 w-5 text-cyan-600" />
                  Statistik Performa Pelayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-5 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border border-cyan-100">
                    <h4 className="font-bold text-sm text-slate-900 mb-3">Ringkasan Bulan Ini</h4>
                    <div className="grid md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="text-slate-500 font-medium">Total Booking Diterima</div>
                        <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalBookings} Trip</div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">Estimasi Omzet</div>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          Rp {(stats.totalRevenue / 1000000).toFixed(1)}jt
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">Tingkat Utilisasi Armada</div>
                        <div className="text-2xl font-black text-cyan-800 mt-1">
                          {stats.totalBoats > 0
                            ? Math.round((stats.totalBookings / stats.totalBoats) * 100)
                            : 0}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Tambah / Edit Armada Kapal */}
      <BoatModal
        open={isBoatModalOpen}
        onOpenChange={setIsBoatModalOpen}
        operatorId={operator?.id || ""}
        boatToEdit={selectedBoatToEdit}
        onSaveSuccess={handleBoatSaved}
      />
    </div>
  );
};

export default OperatorDashboard;

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar,
  Ship,
  DollarSign,
  MessageCircle,
  Ticket,
  Bot,
  Waves,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  User as UserIcon,
  LogOut,
  Phone,
  Mail,
  Menu,
  X,
  Compass,
  Star,
  QrCode,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { checkIsOperator, checkIsAdmin } from "@/lib/authRoles";
import { FullPageAssistant } from "@/components/assistant/FullPageAssistant";
import { ETicketModal, type ETicketData } from "@/components/ETicketModal";
import { isTicketExpired } from "@/lib/ticketExpiry";
import { ReviewModal } from "@/components/ReviewModal";
import type { User } from "@supabase/supabase-js";
import {
  loadMidtransSnapScript,
  requestSnapToken,
  openSnapPayment,
} from "@/lib/midtrans";

interface UserBooking extends ETicketData {
  user_id: string;
  boat_id: string;
  created_at?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "ai-chat" || tabParam === "tickets" || tabParam === "profile") {
      return tabParam;
    }
    return "tickets";
  });
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [reviewedBookings, setReviewedBookings] = useState<Record<string, { rating: number }>>({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<UserBooking | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);

  useEffect(() => {
    loadMidtransSnapScript().catch((err) => {
      console.warn("Midtrans snap preload in Dashboard error:", err);
    });
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Bila terdeteksi sebagai admin platform SUAR, otomatis arahkan ke dashboard admin
      if (checkIsAdmin(user.user_metadata)) {
        navigate("/admin", { replace: true });
        return;
      }

      // Bila terdeteksi sebagai operator kapal, otomatis arahkan ke dashboard operator
      const isOp = await checkIsOperator(user.id, user.email, user.user_metadata);
      if (isOp) {
        navigate("/operator-dashboard", { replace: true });
        return;
      }

      setCurrentUser(user);
      setProfileName(user.user_metadata?.full_name || "");
      setProfilePhone(user.user_metadata?.phone || "");
      fetchBookings(user.id);

      // Cek apakah ada tab ai-chat atau prompt tertunda yang memicu pembukaan tab AI chat secara otomatis
      try {
        const tabParam = searchParams.get("tab");
        const pendingPrompt = sessionStorage.getItem("pending_assistant_prompt");
        if (tabParam === "ai-chat" || pendingPrompt) {
          setActiveTab("ai-chat");
        }
      } catch (err) {
        console.warn("Gagal mengecek pending prompt:", err);
      }
    };
    checkAuth();
  }, [navigate, searchParams]);

  const fetchBookings = async (userId: string) => {
    const [bookingsRes, reviewsRes] = await Promise.all([
      supabase
        .from("bookings")
        .select(`
          *,
          boats (
            name,
            type,
            image_url
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("reviews")
        .select("booking_id, rating")
        .eq("user_id", userId),
    ]);

    if (bookingsRes.error) {
      toast.error("Gagal memuat booking");
    } else {
      setBookings((bookingsRes.data as unknown as UserBooking[]) || []);
    }

    if (reviewsRes.data) {
      const reviewMap: Record<string, { rating: number }> = {};
      reviewsRes.data.forEach((r: { booking_id: string; rating: number }) => {
        if (r.booking_id) reviewMap[r.booking_id] = { rating: r.rating };
      });
      setReviewedBookings(reviewMap);
    }
  };

  const getStatusBadge = (booking: UserBooking) => {
    if (isTicketExpired(booking)) {
      return <Badge variant="destructive">Hangus</Badge>;
    }
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      pending: "secondary",
      confirmed: "default",
      completed: "default",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[booking.booking_status] || "default"}>
        {booking.booking_status}
      </Badge>
    );
  };

  const handleOpenTicket = (booking: UserBooking) => {
    setSelectedBooking(booking);
    setIsTicketModalOpen(true);
  };

  const handleChatOperator = (booking: UserBooking) => {
    const boatName = booking.boats?.name || "Kapal Wisata";
    const dateStr = new Date(booking.booking_date).toLocaleDateString("id-ID");
    const ticketCode = `SUAR-${booking.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
    const message = encodeURIComponent(
      `Halo Nakhoda/Operator ${boatName}, saya pemesan tiket ${ticketCode} atas nama ${
        currentUser?.user_metadata?.full_name || currentUser?.email || "Wisatawan"
      } untuk jadwal keberangkatan ${dateStr} jam ${booking.departure_time.slice(
        0,
        5
      )} WIB (${booking.passengers} orang). Mohon konfirmasi kesiapan kapal di dermaga.`
    );
    window.open(`https://wa.me/6281234567890?text=${message}`, "_blank");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: profileName,
          phone: profilePhone,
        },
      });
      if (error) throw error;
      if (data?.user) {
        setCurrentUser(data.user);
        toast.success("Profil wisatawan berhasil disimpan!");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui profil");
    } finally {
      setIsSavingProfile(false);
    }
  };
  const activeTripsCount = bookings.filter(
    (b) =>
      (b.booking_status === "confirmed" || b.booking_status === "pending") &&
      !isTicketExpired(b)
  ).length;

  const pendingTripsCount = bookings.filter(
    (b) => b.payment_status === "pending" && !isTicketExpired(b)
  ).length;

  const completedTripsCount = bookings.filter(
    (b) => b.booking_status === "completed"
  ).length;

  const totalSpent = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

  const handleResumePayment = async (booking: UserBooking) => {
    try {
      setPayingBookingId(booking.id);
      toast.info("Menghubungkan ke gerbang pembayaran Midtrans...");

      // Default pembayaran DP 30%
      const payableAmount = Math.round(booking.total_price * 0.3);
      const orderId = `SUAR-${booking.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

      const snapRes = await requestSnapToken({
        orderId,
        grossAmount: payableAmount,
        customerDetails: {
          first_name: currentUser?.user_metadata?.full_name || "Wisatawan",
          email: currentUser?.email,
          phone: currentUser?.user_metadata?.phone,
        },
        itemDetails: [
          {
            id: booking.boat_id,
            name: `DP Tiket ${booking.boats?.name || "Kapal Wisata"}`,
            price: payableAmount,
            quantity: 1,
          },
        ],
      });

      if (snapRes?.token) {
        openSnapPayment(snapRes.token, {
          onSuccess: async () => {
            try {
              await supabase.rpc("confirm_booking_payment", {
                p_booking_id: booking.id,
                p_payment_status: "dp_paid",
              });
            } catch (rpcErr) {
              console.warn("RPC confirm_booking_payment error:", rpcErr);
              await supabase
                .from("bookings")
                .update({ payment_status: "dp_paid", booking_status: "confirmed" })
                .eq("id", booking.id);
            }
            toast.success("Pembayaran berhasil dikonfirmasi! Tiket Anda telah aktif.");
            if (currentUser?.id) {
              await fetchBookings(currentUser.id);
            }
          },
          onPending: () => {
            toast.info("Pembayaran masih berstatus Pending. Silakan selesaikan scan QRIS atau transfer Anda.");
            if (currentUser?.id) {
              fetchBookings(currentUser.id);
            }
          },
          onError: () => {
            toast.error("Pembayaran Midtrans dibatalkan atau gagal.");
          },
          onClose: () => {
            toast.info("Pembayaran belum diselesaikan. Tiket tetap berstatus Menunggu Pembayaran.");
          },
        });
      } else {
        toast.error("Gagal mendapatkan sesi pembayaran Midtrans. Silakan coba sesaat lagi.");
      }
    } catch (err: unknown) {
      toast.error(
        "Gagal memproses pembayaran: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setPayingBookingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          setIsMobileSidebarOpen(false);
        }}
        className="flex-1 flex flex-col md:flex-row pt-20"
      >
        {/* Mobile Header Bar & Toggle Sidebar */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-primary/20">
              <AvatarFallback className="bg-primary text-white font-bold text-xs">
                {(profileName || currentUser?.email || "W").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-bold text-slate-900 line-clamp-1">
                {profileName || currentUser?.email || "Wisatawan"}
              </p>
              <span className="text-[10px] text-primary font-semibold block">Wisatawan SUAR</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
            className="p-1.5 h-9 w-9 rounded-xl"
            aria-label="Toggle Menu Sidebar"
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Sidebar Navigasi & Profil (Desktop & Mobile Drawer) */}
        <aside
          className={`
            fixed md:sticky top-20 inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out md:translate-x-0
            ${isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
            min-h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] overflow-y-auto
          `}
        >
          <div className="space-y-6">
            {/* Kartu Profil Wisatawan */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md relative overflow-hidden">

              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-light/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <Avatar className="h-12 w-12 border-2 border-primary-light shadow-sm">
                  <AvatarFallback className="bg-primary text-white font-black text-sm">
                    {(profileName || currentUser?.email || "W").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-white truncate">
                    {profileName || "Wisatawan Bahari"}
                  </h3>
                  <p className="text-[11px] text-slate-300 truncate">
                    {currentUser?.email || "wisatawan@suar.id"}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Badge className="bg-primary-light/20 text-primary-light border border-primary-light/30 text-[9px] px-1.5 py-0 font-semibold">
                      Wisatawan
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Navigasi Tabs Sidebar */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
                Menu Utama
              </span>
              <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1.5">
                <TabsTrigger
                  value="tickets"
                  className="w-full justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-primary hover:bg-slate-100 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 transition-all flex items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <Ticket className="h-4 w-4 text-primary" />
                    <span>Tiket & Riwayat</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {pendingTripsCount > 0 && (
                      <span className="h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {pendingTripsCount} Pending
                      </span>
                    )}
                    {activeTripsCount > 0 && (
                      <span className="h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                        {activeTripsCount}
                      </span>
                    )}
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="ai-chat"
                  className="w-full justify-start px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-primary hover:bg-slate-100 data-[state=active]:bg-[#090D16] data-[state=active]:text-white transition-all flex items-center gap-2.5"
                >
                  <Bot className="h-4 w-4 text-primary-light" />
                  <span>Juru Mudi AI</span>
                </TabsTrigger>

                <TabsTrigger
                  value="profile"
                  className="w-full justify-start px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-primary hover:bg-slate-100 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 transition-all flex items-center gap-2.5"
                >
                  <UserIcon className="h-4 w-4 text-primary" />
                  <span>Profil Wisatawan</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Pintasan Eksternal */}
            <div className="pt-2 border-t border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
                Pintasan Bahari
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  navigate("/#weather-map-section");
                }}
                className="w-full justify-start text-xs font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 gap-2.5 rounded-xl px-3"
              >
                <Waves className="h-4 w-4 text-primary" />
                <span>Pantau Peta Cuaca</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  navigate("/boats");
                }}
                className="w-full justify-start text-xs font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 gap-2.5 rounded-xl px-3"
              >
                <Ship className="h-4 w-4 text-primary" />
                <span>Katalog Armada Kapal</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  navigate("/tour-packages");
                }}
                className="w-full justify-start text-xs font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 gap-2.5 rounded-xl px-3"
              >
                <Compass className="h-4 w-4 text-primary" />
                <span>Katalog Paket Tour</span>
              </Button>
            </div>
          </div>

          {/* Tombol Logout di Footer Sidebar */}
          <div className="pt-4 border-t border-slate-200/80">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-center text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 gap-2 rounded-xl"
            >
              <LogOut className="h-4 w-4 text-rose-500" />
              <span>Keluar dari Akun</span>
            </Button>
          </div>
        </aside>

        {/* Konten Utama Dashboard (Sebelah Kanan Sidebar) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full">
          {/* TAB 1: Tiket & Riwayat Saya */}
          <TabsContent value="tickets" className="space-y-6 mt-0 animate-in fade-in duration-200">
            {/* Kartu Ringkasan Aktivitas (Trip Stats) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Pelayaran Aktif
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
                      {activeTripsCount} Tiket
                    </span>
                    <span className="text-[11px] text-emerald-600 font-medium">
                      Siap Berlayar & Menunggu
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Ship className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Trip Selesai
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
                      {completedTripsCount} Pelayaran
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Wisata Teluk & Nusakambangan
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200/80 shadow-sm bg-white">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Total Biaya
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
                      Rp {totalSpent.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Termasuk DP Terverifikasi
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daftar Tiket & Booking */}
            {bookings.length === 0 ? (
              <Card className="rounded-3xl border-slate-200 bg-white shadow-sm overflow-hidden">
                <CardContent className="py-16 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-primary/5 text-primary flex items-center justify-center mx-auto mb-4">
                    <Ship className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada booking pelayaran</h3>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    Mulai petualangan bahari Anda di pesisir Cilacap dengan mengecek kapal tersedia atau konsultasikan ke Juru Mudi AI.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="hero"
                      onClick={() => navigate("/#armada-siap-berlayar")}
                      className="rounded-xl font-bold text-xs"
                    >
                      Jelajahi Armada
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("ai-chat")}
                      className="rounded-xl font-bold text-xs gap-1.5"
                    >
                      <Bot className="h-4 w-4 text-primary" />
                      <span>Tanya Juru Mudi AI</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {bookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="bg-slate-900 text-white p-5 sm:p-6">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono text-xs font-bold text-primary-light uppercase tracking-wider">
                              SUAR-{booking.id.replace(/-/g, "").slice(0, 8).toUpperCase()}
                            </span>
                            <Badge className="bg-white/10 text-slate-200 border-white/20 text-[10px]">
                              {booking.boats?.type === "speedboat" ? "Speedboat Fiber" : "Kapal Kayu"}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl sm:text-2xl font-black text-white">
                            {booking.boats?.name || "Kapal Wisata SUAR"}
                          </CardTitle>
                          <span className="text-xs text-slate-400 mt-1 block">
                            Rute: Teluk Penyu ⇄ Nusakambangan (Perairan Pesisir Cilacap)
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-black text-white">
                            Rp {booking.total_price.toLocaleString("id-ID")}
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-1">
                            {getStatusBadge(booking)}
                            <Badge
                              variant="outline"
                              className={
                                booking.payment_status === "pending"
                                  ? "border-amber-400/80 bg-amber-500/20 text-amber-300 text-[10px] font-bold"
                                  : booking.payment_status === "dp_paid"
                                    ? "border-emerald-400/50 text-emerald-300 text-[10px]"
                                    : "border-teal-400/50 text-teal-300 text-[10px]"
                              }
                            >
                              {booking.payment_status === "pending"
                                ? "Menunggu Pembayaran"
                                : booking.payment_status === "dp_paid"
                                  ? "DP Terbayar (30%)"
                                  : "Lunas Terverifikasi"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 sm:p-6 space-y-5">
                      {/* Grid Detail Pelayaran */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm shrink-0">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 font-medium block">
                              Tanggal Berangkat
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                              {new Date(booking.booking_date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Pukul {booking.departure_time.slice(0, 5)} WIB
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm shrink-0">
                            <Ship className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 font-medium block">
                              Kapasitas & Keselamatan
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                              {booking.passengers} Orang Penumpang
                            </span>
                            <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" />
                              <span>Jaket Pelampung Tersedia</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm shrink-0">
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 font-medium block">
                              Rincian Uang Muka (DP 30%)
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                              Rp {(booking.total_price * 0.3).toLocaleString("id-ID")}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Sisa Rp {(booking.total_price * 0.7).toLocaleString("id-ID")} di dermaga
                            </span>
                          </div>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                          <span className="text-slate-900 font-bold block mb-0.5">Catatan Khusus:</span>
                          <span className="text-slate-700">{booking.notes}</span>
                        </div>
                      )}

                      {/* Tombol Aksi Tiket */}
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        {/* Tombol Bayar Sekarang jika belum lunas/dibayar */}
                        {booking.payment_status === "pending" && !isTicketExpired(booking) && (
                          <Button
                            data-testid={`pay-booking-${booking.id}`}
                            variant="hero"
                            size="sm"
                            onClick={() => handleResumePayment(booking)}
                            disabled={payingBookingId === booking.id}
                            className="rounded-xl text-xs font-bold gap-2 px-4 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                          >
                            <QrCode className="h-4 w-4" />
                            <span>{payingBookingId === booking.id ? "Memproses..." : "Bayar Sekarang"}</span>
                          </Button>
                        )}

                        <Button
                          variant={booking.payment_status === "pending" ? "outline" : "hero"}
                          size="sm"
                          onClick={() => handleOpenTicket(booking)}
                          className={`rounded-xl text-xs font-bold gap-2 px-4 shadow-sm ${
                            booking.payment_status === "pending"
                              ? "border-slate-300 text-slate-700 hover:bg-slate-50"
                              : ""
                          }`}
                        >
                          <Ticket className="h-4 w-4" />
                          <span>E-Tiket & Boarding Pass</span>
                        </Button>

                        {/* Aksi Ulasan jika Pelayaran Telah Selesai (completed) */}
                        {booking.booking_status === "completed" && (
                          reviewedBookings[booking.id] ? (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span>Ulasan Terkirim ({reviewedBookings[booking.id].rating}/5)</span>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReviewBooking(booking);
                                setIsReviewModalOpen(true);
                              }}
                              className="rounded-xl text-xs font-bold gap-1.5 border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 hover:text-amber-950 shadow-sm"
                            >
                              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                              <span>Beri Ulasan Pelayaran</span>
                            </Button>
                          )
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChatOperator(booking)}
                          className="rounded-xl text-xs font-bold gap-2 border-slate-300 text-slate-800 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                        >
                          <MessageCircle className="h-4 w-4 text-primary" />
                          <span>Chat Nakhoda / Operator</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            sessionStorage.setItem(
                              "pending_assistant_prompt",
                              `Bagaimana prakiraan cuaca dan tinggi gelombang untuk pelayaran saya dengan kapal ${
                                booking.boats?.name || "wisata"
                              } pada tanggal ${new Date(booking.booking_date).toLocaleDateString(
                                "id-ID"
                              )}?`
                            );
                            setActiveTab("ai-chat");
                          }}
                          className="rounded-xl text-xs font-semibold text-primary hover:bg-primary/5 gap-1.5 ml-auto"
                        >
                          <Bot className="h-4 w-4 text-primary" />
                          <span>Cek Cuaca Pelayaran Ini</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Juru Mudi AI (Full-Page ChatGPT/Gemini Style) */}
          <TabsContent value="ai-chat" className="mt-0 animate-in fade-in duration-200">
            <FullPageAssistant />
          </TabsContent>

          {/* TAB 3: Profil Wisatawan */}
          <TabsContent value="profile" className="space-y-6 mt-0 animate-in fade-in duration-200">
            <div className="pb-2 border-b border-slate-200">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Profil & Akun Wisatawan
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                Kelola identitas diri dan informasi kontak resmi untuk lembar manifes pelayaran KSOP.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kartu Ringkasan Akun */}
              <Card className="rounded-2xl border-slate-200 bg-white shadow-sm p-6 space-y-4">
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto border-4 border-primary/20 shadow-md">
                    <AvatarFallback className="bg-primary text-white font-black text-2xl">
                      {(profileName || currentUser?.email || "W").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg text-slate-900 mt-3">
                    {profileName || "Wisatawan Bahari"}
                  </h3>
                  <p className="text-xs text-slate-500">{currentUser?.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Akun Wisatawan Aktif</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>ID Pengguna:</span>
                    <span className="font-mono text-slate-900 font-semibold truncate max-w-[150px]">
                      {currentUser?.id.slice(0, 12)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Status Verifikasi:</span>
                    <span className="font-semibold text-emerald-600">Terdaftar Resmi</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Total Booking:</span>
                    <span className="font-bold text-slate-900">{bookings.length} Pesanan</span>
                  </div>
                </div>
              </Card>

              {/* Form Pengaturan Data Profil */}
              <Card className="lg:col-span-2 rounded-2xl border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Informasi Kontak & Manifes
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Pastikan nama dan nomor WhatsApp sesuai untuk verifikasi manifes di Pos Dermaga Pandanarang.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullname" className="text-xs font-bold text-slate-700">
                        Nama Lengkap Sesuai KTP
                      </Label>
                      <Input
                        id="fullname"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="rounded-xl text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-bold text-slate-700">
                        Alamat Email
                      </Label>
                      <Input
                        id="email"
                        value={currentUser?.email || ""}
                        disabled
                        className="rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
                      />
                      <span className="text-[10px] text-slate-400">
                        Alamat email terikat pada otentikasi akun.
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-bold text-slate-700">
                        Nomor WhatsApp Aktif
                      </Label>
                      <div className="relative">
                        <Phone className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="phone"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          placeholder="Contoh: 081234567890"
                          className="rounded-xl text-sm pl-9"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Digunakan oleh nakhoda kapal untuk koordinasi penjemputan dermaga.
                      </span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSavingProfile}
                        className="rounded-xl font-bold text-xs px-5 shadow-sm"
                      >
                        {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </main>
      </Tabs>

      {/* Modal Digital E-Tiket */}
      <ETicketModal
        booking={selectedBooking}
        open={isTicketModalOpen}
        onOpenChange={setIsTicketModalOpen}
      />

      {/* Modal Beri Ulasan Pelayaran */}
      <ReviewModal
        booking={selectedReviewBooking}
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        onSuccess={() => {
          if (currentUser) {
            fetchBookings(currentUser.id);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { toast } from "sonner";
import { checkIsOperator } from "@/lib/authRoles";
import { FullPageAssistant } from "@/components/assistant/FullPageAssistant";
import { ETicketModal, type ETicketData } from "@/components/ETicketModal";
import type { User } from "@supabase/supabase-js";

interface UserBooking extends ETicketData {
  user_id: string;
  boat_id: string;
  created_at?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>("tickets");
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Bila terdeteksi sebagai operator kapal, otomatis arahkan ke dashboard operator
      const isOp = await checkIsOperator(user.id, user.email, user.user_metadata);
      if (isOp) {
        navigate("/operator-dashboard", { replace: true });
        return;
      }

      setCurrentUser(user);
      fetchBookings(user.id);

      // Cek apakah ada prompt tertunda yang memicu pembukaan tab AI chat secara otomatis
      try {
        const pendingPrompt = sessionStorage.getItem("pending_assistant_prompt");
        if (pendingPrompt) {
          setActiveTab("ai-chat");
        }
      } catch (err) {
        console.warn("Gagal mengecek pending prompt:", err);
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchBookings = async (userId: string) => {
    const { data, error } = await supabase
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
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat booking");
    } else {
      setBookings((data as unknown as UserBooking[]) || []);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      pending: "secondary",
      confirmed: "default",
      completed: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
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

  // Kalkulasi statistik ringkas perjalanan wisatawan
  const activeTripsCount = bookings.filter(
    (b) => b.booking_status === "confirmed" || b.booking_status === "pending"
  ).length;

  const completedTripsCount = bookings.filter(
    (b) => b.booking_status === "completed"
  ).length;

  const totalSpent = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="container mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header Dashboard */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold mb-2">
                <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                <span>Portal Wisatawan Terintegrasi</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Dashboard Wisatawan
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Kelola tiket penyeberangan, cek status cuaca, dan konsultasi pelayaran dengan AI.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate("/#weather-map-section")}
              className="gap-2 bg-white text-xs font-bold border-slate-300 hover:bg-slate-100 rounded-xl shadow-sm"
            >
              <Waves className="h-4 w-4 text-cyan-600" />
              <span>Pantau Peta Cuaca</span>
            </Button>
          </div>
        </div>

        {/* Tabs Utama Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-slate-200/80 rounded-2xl h-11">
            <TabsTrigger
              value="tickets"
              className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Ticket className="h-4 w-4 text-cyan-600" />
              <span>Tiket & Riwayat</span>
            </TabsTrigger>
            <TabsTrigger
              value="ai-chat"
              className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-[#090D16] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Bot className="h-4 w-4 text-cyan-400" />
              <span>Juru Mudi AI</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Tiket & Riwayat Saya */}
          <TabsContent value="tickets" className="space-y-6 animate-in fade-in duration-200">
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
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
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
                  <div className="w-16 h-16 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto mb-4">
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
                      <Bot className="h-4 w-4 text-cyan-600" />
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
                            <span className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-wider">
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
                          <div className="text-2xl font-black text-cyan-300">
                            Rp {booking.total_price.toLocaleString("id-ID")}
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-1">
                            {getStatusBadge(booking.booking_status)}
                            <Badge
                              variant="outline"
                              className={
                                booking.payment_status === "pending"
                                  ? "border-amber-400/50 text-amber-300 text-[10px]"
                                  : "border-emerald-400/50 text-emerald-300 text-[10px]"
                              }
                            >
                              {booking.payment_status === "pending" ? "DP Pending" : "DP Terverifikasi"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 sm:p-6 space-y-5">
                      {/* Grid Detail Pelayaran */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-cyan-700 shadow-sm shrink-0">
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
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-cyan-700 shadow-sm shrink-0">
                            <Ship className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 font-medium block">
                              Kapasitas & Keselamatan
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                              {booking.passengers} Orang Penumpang
                            </span>
                            <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" />
                              <span>Pelampung SOLAS Tersedia</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-cyan-700 shadow-sm shrink-0">
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
                        <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100 text-xs">
                          <span className="text-sky-900 font-bold block mb-0.5">Catatan Khusus:</span>
                          <span className="text-sky-800">{booking.notes}</span>
                        </div>
                      )}

                      {/* Tombol Aksi Tiket */}
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={() => handleOpenTicket(booking)}
                          className="rounded-xl text-xs font-bold gap-2 px-4 shadow-sm"
                        >
                          <Ticket className="h-4 w-4" />
                          <span>E-Tiket & Boarding Pass</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChatOperator(booking)}
                          className="rounded-xl text-xs font-bold gap-2 border-slate-300 text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                        >
                          <MessageCircle className="h-4 w-4 text-emerald-600" />
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
                          className="rounded-xl text-xs font-semibold text-cyan-800 hover:bg-cyan-50 gap-1.5 ml-auto"
                        >
                          <Bot className="h-4 w-4 text-cyan-600" />
                          <span>Cek Cuaca Pelayaran Ini</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Juru Mudi AI (Opsi B: Full-Page ChatGPT/Gemini Style) */}
          <TabsContent value="ai-chat" className="animate-in fade-in duration-200">
            <FullPageAssistant />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Digital E-Tiket */}
      <ETicketModal
        booking={selectedBooking}
        open={isTicketModalOpen}
        onOpenChange={setIsTicketModalOpen}
      />

      {/* Floating Assistant Widget (Tetap aktif sebagai jalan pintas cepat di pojok kanan bawah) */}
    </div>
  );
};

export default Dashboard;

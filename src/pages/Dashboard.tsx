import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { toast } from "sonner";
import { checkIsOperator } from "@/lib/authRoles";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
      setProfileName(user.user_metadata?.full_name || "");
      setProfilePhone(user.user_metadata?.phone || "");
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
    (b) => b.booking_status === "confirmed" || b.booking_status === "pending"
  ).length;

  const completedTripsCount = bookings.filter(
    (b) => b.booking_status === "completed"
  ).length;

  const totalSpent = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

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
            <Avatar className="h-9 w-9 border border-cyan-200">
              <AvatarFallback className="bg-cyan-600 text-white font-bold text-xs">
                {(profileName || currentUser?.email || "W").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-bold text-slate-900 line-clamp-1">
                {profileName || currentUser?.email || "Wisatawan"}
              </p>
              <span className="text-[10px] text-cyan-600 font-semibold block">Wisatawan SUAR</span>
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
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <Avatar className="h-12 w-12 border-2 border-cyan-400 shadow-sm">
                  <AvatarFallback className="bg-cyan-600 text-white font-black text-sm">
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
                    <Badge className="bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-[9px] px-1.5 py-0 font-semibold">
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
                  className="w-full justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-cyan-700 hover:bg-slate-100 data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-800 data-[state=active]:border data-[state=active]:border-cyan-200 transition-all flex items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <Ticket className="h-4 w-4 text-cyan-600" />
                    <span>Tiket & Riwayat</span>
                  </div>
                  {activeTripsCount > 0 && (
                    <span className="h-5 px-1.5 rounded-full bg-cyan-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {activeTripsCount}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="ai-chat"
                  className="w-full justify-start px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-cyan-700 hover:bg-slate-100 data-[state=active]:bg-[#090D16] data-[state=active]:text-white transition-all flex items-center gap-2.5"
                >
                  <Bot className="h-4 w-4 text-cyan-400" />
                  <span>Juru Mudi AI</span>
                </TabsTrigger>

                <TabsTrigger
                  value="profile"
                  className="w-full justify-start px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-cyan-700 hover:bg-slate-100 data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-800 data-[state=active]:border data-[state=active]:border-cyan-200 transition-all flex items-center gap-2.5"
                >
                  <UserIcon className="h-4 w-4 text-cyan-600" />
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
                className="w-full justify-start text-xs font-semibold text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 gap-2.5 rounded-xl px-3"
              >
                <Waves className="h-4 w-4 text-cyan-600" />
                <span>Pantau Peta Cuaca</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  navigate("/boats");
                }}
                className="w-full justify-start text-xs font-semibold text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 gap-2.5 rounded-xl px-3"
              >
                <Ship className="h-4 w-4 text-cyan-600" />
                <span>Katalog Armada Kapal</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  navigate("/tour-packages");
                }}
                className="w-full justify-start text-xs font-semibold text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 gap-2.5 rounded-xl px-3"
              >
                <Compass className="h-4 w-4 text-cyan-600" />
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
                  <Avatar className="h-20 w-20 mx-auto border-4 border-cyan-100 shadow-md">
                    <AvatarFallback className="bg-cyan-600 text-white font-black text-2xl">
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

      {/* Floating Assistant Widget */}
      <AssistantWidget />
    </div>
  );
};

export default Dashboard;

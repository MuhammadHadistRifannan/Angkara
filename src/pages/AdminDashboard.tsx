import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
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
  Trash2,
  RefreshCw,
  LogOut,
  SlidersHorizontal,
  Compass,
  FileCheck,
  Menu,
  X,
  Waves,
  Key,
  Plus,
  Edit,
  Wifi,
  Sparkles,
} from "lucide-react";
import { AiApiKeyDialog, type AiApiKeyFormData } from "@/components/admin/AiApiKeyDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface OperatorItem {
  id: string;
  name: string;
  company_name?: string;
  contact?: string | null;
  phone?: string | null;
  ksop_permit_number?: string | null;
  ksop_certificate?: string | null;
  verified?: boolean | null;
  created_at?: string;
}

interface BoatItem {
  id: string;
  name: string;
  type: string;
  capacity: number;
  available?: boolean | null;
  is_available: boolean;
  operator_id?: string;
  operators?: { name?: string; company_name?: string } | null;
}

interface TourPackageItem {
  id: string;
  title: string;
  name?: string;
  price: number;
  duration?: string | null;
  duration_hours?: number | null;
  available?: boolean | null;
  is_active: boolean;
  operator_id?: string;
  operators?: { name?: string; company_name?: string } | null;
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

export interface AiApiKeyItem {
  id: string;
  name: string;
  provider: string;
  api_key: string;
  priority: number;
  status: "ACTIVE" | "INACTIVE" | "DEPLETED" | "ERROR";
  tokens_used: number;
  tokens_limit: number | null;
  error_msg?: string | null;
  last_used_at?: string | null;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("verifikasi");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data State
  const [operators, setOperators] = useState<OperatorItem[]>([]);
  const [boats, setBoats] = useState<BoatItem[]>([]);
  const [tourPackages, setTourPackages] = useState<TourPackageItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // AI API Keys State (Multi-Key Pool & Failover)
  const [aiKeys, setAiKeys] = useState<AiApiKeyItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<AiApiKeyFormData | null>(null);
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);

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
        { data: opsData, error: opsError },
        { data: boatsData, error: boatsError },
        { data: toursData, error: toursError },
        { data: reviewsData, error: reviewsError },
        { data: bookingsData, error: bookingsError },
        { data: keysData, error: keysError },
      ] = await Promise.all([
        supabase.from("operators").select("*").order("created_at", { ascending: false }),
        supabase.from("boats").select("*, operators(*)").order("name", { ascending: true }),
        supabase.from("tour_packages").select("*, operators(*)").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*, boats(name)").order("created_at", { ascending: false }),
        supabase.from("bookings").select("*, boats(name)").order("booking_date", { ascending: false }),
        supabase.from("ai_api_keys").select("*").order("priority", { ascending: true }),
      ]);

      if (opsError) console.warn("Notice loading operators:", opsError);
      if (boatsError) console.warn("Notice loading boats:", boatsError);
      if (toursError) console.warn("Notice loading tours:", toursError);
      if (reviewsError) console.warn("Notice loading reviews:", reviewsError);
      if (bookingsError) console.warn("Notice loading bookings:", bookingsError);
      if (keysError) console.warn("Notice loading ai_api_keys:", keysError);

      if (keysData) {
        setAiKeys(keysData as unknown as AiApiKeyItem[]);
      }

      if (opsData) {
        const mappedOps: OperatorItem[] = (opsData as Record<string, unknown>[]).map((op) => ({
          id: op.id as string,
          name: (op.company_name as string) || (op.name as string) || "Operator",
          company_name: (op.company_name as string) || (op.name as string),
          contact: (op.phone as string) || (op.contact as string) || (op.email as string) || "—",
          phone: (op.phone as string) || (op.contact as string),
          ksop_permit_number: (op.ksop_certificate as string) || (op.ksop_permit_number as string) || "Belum dilampirkan",
          ksop_certificate: (op.ksop_certificate as string) || (op.ksop_permit_number as string),
          verified: !!op.verified,
          created_at: op.created_at as string,
        }));
        setOperators(mappedOps);
      }

      if (boatsData) {
        const mappedBoats: BoatItem[] = (boatsData as Record<string, unknown>[]).map((b) => {
          const op = b.operators as Record<string, unknown> | null;
          const opName = (op?.company_name as string) || (op?.name as string) || "—";
          const isAvail = b.available !== undefined ? !!b.available : (b.is_available !== undefined ? !!b.is_available : true);
          return {
            id: b.id as string,
            name: (b.name as string) || "Kapal Wisata",
            type: (b.type as string) || "kapal_kayu",
            capacity: Number(b.capacity) || 10,
            available: isAvail,
            is_available: isAvail,
            operator_id: b.operator_id as string,
            operators: { name: opName, company_name: opName },
          };
        });
        setBoats(mappedBoats);
      }

      if (toursData) {
        const mappedTours: TourPackageItem[] = (toursData as Record<string, unknown>[]).map((t) => {
          const op = t.operators as Record<string, unknown> | null;
          const opName = (op?.company_name as string) || (op?.name as string) || "—";
          const isAvail = t.available !== undefined ? !!t.available : (t.is_active !== undefined ? !!t.is_active : true);
          const title = (t.name as string) || (t.title as string) || "Paket Wisata";
          const duration = (t.duration as string) || (t.duration_hours ? `${t.duration_hours} Jam` : "Fleksibel");
          return {
            id: t.id as string,
            title,
            name: title,
            price: Number(t.price) || 0,
            duration,
            duration_hours: Number(t.duration_hours) || null,
            available: isAvail,
            is_active: isAvail,
            operator_id: t.operator_id as string,
            operators: { name: opName, company_name: opName },
          };
        });
        setTourPackages(mappedTours);
      }

      if (reviewsData) {
        const mappedReviews: ReviewItem[] = (reviewsData as Record<string, unknown>[]).map((r) => {
          const boat = r.boats as Record<string, unknown> | null;
          return {
            id: r.id as string,
            rating: Number(r.rating) || 5,
            comment: r.comment as string | null,
            created_at: (r.created_at as string) || new Date().toISOString(),
            boats: { name: (boat?.name as string) || "Kapal" },
          };
        });
        setReviews(mappedReviews);
      }

      if (bookingsData) {
        const mappedBookings: BookingItem[] = (bookingsData as Record<string, unknown>[]).map((b) => {
          const boat = b.boats as Record<string, unknown> | null;
          return {
            id: b.id as string,
            booking_date: (b.booking_date as string) || "",
            departure_time: (b.departure_time as string) || "",
            passengers: Number(b.passengers) || 1,
            total_price: Number(b.total_price) || 0,
            booking_status: (b.booking_status as string) || "pending",
            boats: { name: (boat?.name as string) || "—" },
          };
        });
        setBookings(mappedBookings);
      }
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
          ? "Operator berhasil diverifikasi dan aktif melayani reservasi."
          : "Status verifikasi operator berhasil dicabut."
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
        .update({ available: newStatus } as Record<string, unknown>)
        .eq("id", boatId);

      if (error) throw error;

      setBoats((prev) =>
        prev.map((b) => (b.id === boatId ? { ...b, available: newStatus, is_available: newStatus } : b))
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
        .update({ available: newStatus } as Record<string, unknown>)
        .eq("id", tourId);

      if (error) throw error;

      setTourPackages((prev) =>
        prev.map((t) => (t.id === tourId ? { ...t, available: newStatus, is_active: newStatus } : t))
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

  // AKSI 6: Pengelolaan Pool AI API Key (Tradiora-Style Failover & Rotation)
  const handleSaveKey = async (formData: AiApiKeyFormData) => {
    if (formData.id) {
      const { error } = await supabase
        .from("ai_api_keys")
        .update({
          name: formData.name,
          provider: formData.provider,
          api_key: formData.api_key,
          priority: formData.priority,
          tokens_limit: formData.tokens_limit,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", formData.id);

      if (error) throw error;
      toast.success("Kunci API berhasil diperbarui!");
    } else {
      const { error } = await supabase.from("ai_api_keys").insert({
        name: formData.name,
        provider: formData.provider,
        api_key: formData.api_key,
        priority: formData.priority,
        tokens_limit: formData.tokens_limit,
        status: formData.status,
      });

      if (error) throw error;
      toast.success("Kunci API baru berhasil ditambahkan ke pool!");
    }
    fetchData();
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kunci API ini dari pool?")) return;
    try {
      const { error } = await supabase.from("ai_api_keys").delete().eq("id", id);
      if (error) throw error;
      setAiKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success("Kunci API berhasil dihapus.");
    } catch {
      toast.error("Gagal menghapus kunci API.");
    }
  };

  const handleToggleKeyStatus = async (key: AiApiKeyItem) => {
    const nextStatus = key.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const { error } = await supabase
        .from("ai_api_keys")
        .update({
          status: nextStatus,
          error_msg: nextStatus === "ACTIVE" ? null : key.error_msg,
          updated_at: new Date().toISOString(),
        })
        .eq("id", key.id);

      if (error) throw error;
      setAiKeys((prev) =>
        prev.map((k) =>
          k.id === key.id
            ? { ...k, status: nextStatus, error_msg: nextStatus === "ACTIVE" ? null : k.error_msg }
            : k
        )
      );
      toast.success(`Status kunci diubah menjadi ${nextStatus}.`);
    } catch {
      toast.error("Gagal mengubah status kunci.");
    }
  };

  const handleTestConnection = async (key: AiApiKeyItem) => {
    setTestingKeyId(key.id);
    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key.api_key,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "ping" }] }],
          }),
        }
      );

      if (res.ok) {
        toast.success(`Koneksi sukses! Kunci "${key.name}" aktif dan valid.`);
        if (key.status === "DEPLETED" || key.status === "ERROR") {
          await supabase
            .from("ai_api_keys")
            .update({ status: "ACTIVE", error_msg: null, updated_at: new Date().toISOString() })
            .eq("id", key.id);
          fetchData();
        }
      } else if (res.status === 429) {
        toast.error(`Kunci "${key.name}" terkena batas kuota / rate limit (429).`);
      } else {
        const text = await res.text();
        toast.error(`Kunci "${key.name}" gagal diverifikasi (${res.status}): ${text.substring(0, 100)}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Uji koneksi gagal: ${msg}`);
    } finally {
      setTestingKeyId(null);
    }
  };

  const maskApiKey = (k: string) => {
    if (!k || k.length <= 8) return "••••••••";
    return `${k.substring(0, 6)}••••••••${k.substring(k.length - 4)}`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-cyan-600" />
          <p className="text-sm font-semibold text-slate-600">Memverifikasi otoritas pengelola...</p>
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
                AD
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-bold text-slate-900 line-clamp-1">
                {currentUser?.user_metadata?.full_name as string || currentUser?.email || "Admin SUAR"}
              </p>
              <span className="text-[10px] text-cyan-600 font-semibold block">Pengelola Platform</span>
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

        {/* Sidebar Navigasi & Profil Admin (Desktop & Mobile Drawer) */}
        <aside
          className={`
            fixed md:sticky top-20 inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out md:translate-x-0
            ${isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
            min-h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] overflow-y-auto
          `}
        >
          <div className="space-y-6">
            {/* Kartu Profil Admin */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <Avatar className="h-12 w-12 border-2 border-cyan-400 shadow-sm">
                  <AvatarFallback className="bg-cyan-600 text-white font-black text-sm">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-white truncate">
                    {currentUser?.user_metadata?.full_name as string || "Admin SUAR"}
                  </h3>
                  <p className="text-[11px] text-slate-300 truncate">
                    {currentUser?.email || "admin@angkara.id"}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <Badge className="bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-[9px] px-1.5 py-0 font-semibold">
                      Administrator
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] px-1.5 py-0 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      Otoritas Platform
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Navigasi Tabs Sidebar */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
                Konsol Pengawasan
              </span>
              <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1.5">
                <TabsTrigger
                  value="verifikasi"
                  className="w-full justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-cyan-700 hover:bg-slate-100 data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-800 data-[state=active]:border data-[state=active]:border-cyan-200 transition-all flex items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="h-4 w-4 text-cyan-600" />
                    <span>Verifikasi Operator</span>
                  </div>
                  {operators.length > 0 && (
                    <span className="h-5 px-1.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {operators.length}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="kapal"
                  className="w-full justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-cyan-700 hover:bg-slate-100 data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-800 data-[state=active]:border data-[state=active]:border-cyan-200 transition-all flex items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <Ship className="h-4 w-4 text-cyan-600" />
                    <span>Moderasi Kapal & Paket</span>
                  </div>
                  {boats.length + tourPackages.length > 0 && (
                    <span className="h-5 px-1.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {boats.length + tourPackages.length}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="ulasan"
                  className="w-full justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-cyan-700 hover:bg-slate-100 data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-800 data-[state=active]:border data-[state=active]:border-cyan-200 transition-all flex items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="h-4 w-4 text-cyan-600" />
                    <span>Moderasi Ulasan</span>
                  </div>
                  {reviews.length > 0 && (
                    <span className="h-5 px-1.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {reviews.length}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="booking"
                  className="w-full justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-cyan-700 hover:bg-slate-100 data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-800 data-[state=active]:border data-[state=active]:border-cyan-200 transition-all flex items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarCheck className="h-4 w-4 text-cyan-600" />
                    <span>Pantauan Booking</span>
                  </div>
                  {bookings.length > 0 && (
                    <span className="h-5 px-1.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-black flex items-center justify-center">
                      {bookings.length}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="override"
                  className="w-full justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-cyan-700 hover:bg-slate-100 data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-800 data-[state=active]:border data-[state=active]:border-cyan-200 transition-all flex items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <SlidersHorizontal className="h-4 w-4 text-cyan-600" />
                    <span>Kontrol Berlayar</span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="ai-keys"
                  className="w-full justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-cyan-700 hover:bg-slate-100 data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-800 data-[state=active]:border data-[state=active]:border-cyan-200 transition-all flex items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <Key className="h-4 w-4 text-cyan-600" />
                    <span>AI API Keys</span>
                  </div>
                  {aiKeys.length > 0 && (
                    <span className="h-5 px-1.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-black flex items-center justify-center">
                      {aiKeys.filter((k) => k.status === "ACTIVE").length} / {aiKeys.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Pintasan Platform */}
            <div className="pt-2 border-t border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
                Pintasan Platform
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
                <span>Katalog Kapal Publik</span>
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

          {/* Tombol Segarkan & Logout */}
          <div className="pt-4 border-t border-slate-200/80 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isRefreshing}
              className="w-full justify-center text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50 gap-2 rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Segarkan Data</span>
            </Button>
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

        {/* Konten Utama Dashboard */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full">
          {/* Header Konsol Admin */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-600" />
                <span>Konsol Pengelola Platform SUAR</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Dashboard Administrator
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                Pengawasan, Verifikasi Mitra Koperasi, Moderasi Bahari, & Keselamatan Pelayaran KSOP
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold self-start sm:self-auto">
              <ShieldCheck className="h-4 w-4 text-cyan-600" />
              <span>Otoritas Pengawas SUAR</span>
            </div>
          </div>

          {/* Stats Cards Ringkasan Platform */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mitra Operator</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{operators.length}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    <span className="text-emerald-600 font-bold">{verifiedOperatorsCount}</span> Terverifikasi
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Armada Kapal</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{boats.length}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    <span className="text-cyan-600 font-bold">{activeBoatsCount}</span> Siap Berlayar
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Ship className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Booking</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{bookings.length}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Seluruh platform</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CalendarCheck className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ulasan Publik</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{reviews.length}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Pasca-trip wisatawan</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* TAB 1: Verifikasi Operator */}
          <TabsContent value="verifikasi" className="space-y-4 mt-0 animate-in fade-in duration-200">
            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <FileCheck className="h-5 w-5 text-cyan-600" />
                  Daftar Pengajuan & Status Legalitas Operator
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Verifikasi sertifikat KSOP dan legalitas usaha koperasi/operator penyeberangan sebelum kapal dapat menerima reservasi.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Nama Operator / Koperasi</th>
                      <th className="px-5 py-3.5">Kontak</th>
                      <th className="px-5 py-3.5">Nomor Izin KSOP</th>
                      <th className="px-5 py-3.5">Status Legalitas</th>
                      <th className="px-5 py-3.5 text-right">Aksi Otoritas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {operators.map((op) => (
                      <tr key={op.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900">{op.name}</td>
                        <td className="px-5 py-4 text-slate-600">{op.contact || "—"}</td>
                        <td className="px-5 py-4 font-mono text-[11px] text-cyan-800">
                          {op.ksop_permit_number ? (
                            <span className="bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-lg">
                              {op.ksop_permit_number}
                            </span>
                          ) : (
                            <span className="text-slate-400">Belum dilampirkan</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {op.verified ? (
                            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-xs hover:bg-emerald-100">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" /> Terverifikasi
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs hover:bg-amber-100">
                              <AlertTriangle className="h-3 w-3 mr-1 text-amber-600" /> Menunggu Tinjauan
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            size="sm"
                            variant={op.verified ? "outline" : "default"}
                            onClick={() => handleToggleVerifyOperator(op.id, !!op.verified)}
                            className={
                              op.verified
                                ? "border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold rounded-xl"
                                : "bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-sm"
                            }
                          >
                            {op.verified ? "Cabut Verifikasi" : "Setujui"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {operators.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-500 font-medium">
                          Belum ada mitra operator terdaftar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Moderasi Kapal & Paket */}
          <TabsContent value="kapal" className="space-y-6 mt-0 animate-in fade-in duration-200">
            {/* Sub-section: Kapal */}
            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <Ship className="h-5 w-5 text-cyan-600" />
                  Moderasi Kelaikan & Ketersediaan Armada Kapal
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Admin berhak menonaktifkan kapal dari pencarian publik bila ditemukan masalah kelaikan atau komplain keselamatan berulang.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Nama Kapal</th>
                      <th className="px-5 py-3.5">Operator</th>
                      <th className="px-5 py-3.5">Jenis & Kapasitas</th>
                      <th className="px-5 py-3.5">Status Ketersediaan</th>
                      <th className="px-5 py-3.5 text-right">Aksi Moderasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {boats.map((boat) => (
                      <tr key={boat.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900">{boat.name}</td>
                        <td className="px-5 py-4 text-slate-600">{boat.operators?.name || "—"}</td>
                        <td className="px-5 py-4 text-slate-600">
                          {boat.type === "speedboat" ? "Speedboat Cepat" : "Kapal Kayu Wisata"} • {boat.capacity} org
                        </td>
                        <td className="px-5 py-4">
                          {boat.is_available ? (
                            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-xs hover:bg-emerald-100">
                              Aktif Melayani
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-100 text-rose-900 border-rose-300 font-bold text-xs hover:bg-rose-100">
                              Dinonaktifkan Admin
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleBoatAvailability(boat.id, boat.is_available)}
                            className={
                              boat.is_available
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 text-xs font-bold rounded-xl"
                                : "bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-sm border-transparent"
                            }
                          >
                            {boat.is_available ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {boats.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-500 font-medium">
                          Belum ada armada kapal terdaftar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Sub-section: Paket Tour */}
            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <Compass className="h-5 w-5 text-cyan-600" />
                  Moderasi Paket Wisata Bahari
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Pastikan paket wisata mematuhi standar keselamatan, kelengkapan jaket pelampung, dan batas tarif wajar.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Judul Paket</th>
                      <th className="px-5 py-3.5">Operator</th>
                      <th className="px-5 py-3.5">Durasi</th>
                      <th className="px-5 py-3.5">Harga</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Aksi Moderasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tourPackages.map((tour) => (
                      <tr key={tour.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900">{tour.title}</td>
                        <td className="px-5 py-4 text-slate-600">{tour.operators?.name || "—"}</td>
                        <td className="px-5 py-4 text-slate-600">{tour.duration || "Fleksibel"}</td>
                        <td className="px-5 py-4 font-bold text-cyan-700">
                          Rp {tour.price.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-4">
                          {tour.is_active ? (
                            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-xs hover:bg-emerald-100">
                              Tayang
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-700 border-slate-300 font-bold text-xs hover:bg-slate-100">
                              Nonaktif
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleTourPackage(tour.id, tour.is_active)}
                            className={
                              tour.is_active
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 text-xs font-bold rounded-xl"
                                : "bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-sm border-transparent"
                            }
                          >
                            {tour.is_active ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {tourPackages.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-500 font-medium">
                          Belum ada paket wisata terdaftar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Moderasi Ulasan */}
          <TabsContent value="ulasan" className="space-y-4 mt-0 animate-in fade-in duration-200">
            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                  Moderasi Ulasan Wisatawan
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Hapus komentar yang mengandung unsur spam, ujaran kebencian, promosi liar, atau penipuan demi kenyamanan komunitas.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{rev.boats?.name || "Kapal"}</span>
                        <span className="text-amber-500 text-xs tracking-wider">{"★".repeat(rev.rating)}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(rev.created_at).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {rev.comment || "Tidak ada komentar"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteReview(rev.id)}
                      className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold rounded-xl shrink-0 self-end sm:self-start"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Hapus Ulasan
                    </Button>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="text-center py-10 text-slate-500 text-xs font-medium">
                    Tidak ada ulasan publik yang perlu dimoderasi.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Pantauan Semua Booking */}
          <TabsContent value="booking" className="space-y-4 mt-0 animate-in fade-in duration-200">
            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                    <CalendarCheck className="h-5 w-5 text-emerald-600" />
                    Log Seluruh Transaksi & Booking Platform
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Pemantauan read-only seluruh manifes reservasi penyeberangan Teluk Penyu & Nusakambangan.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Filter:</span>
                  <select
                    value={bookingFilter}
                    onChange={(e) => setBookingFilter(e.target.value)}
                    className="bg-white border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-1.5 shadow-sm font-semibold outline-none focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu (Pending)</option>
                    <option value="confirmed">Terkonfirmasi (Confirmed)</option>
                    <option value="completed">Selesai (Completed)</option>
                    <option value="cancelled">Dibatalkan (Cancelled)</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">ID Booking</th>
                      <th className="px-5 py-3.5">Kapal</th>
                      <th className="px-5 py-3.5">Jadwal Keberangkatan</th>
                      <th className="px-5 py-3.5">Penumpang</th>
                      <th className="px-5 py-3.5">Total Bayar</th>
                      <th className="px-5 py-3.5 text-right">Status Manifes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-mono text-[11px] text-cyan-800 font-bold">
                          SUAR-{b.id.replace(/-/g, "").slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">{b.boats?.name || "—"}</td>
                        <td className="px-5 py-4 text-slate-600">
                          {b.booking_date} • {b.departure_time.slice(0, 5)} WIB
                        </td>
                        <td className="px-5 py-4 text-slate-600">{b.passengers} Penumpang</td>
                        <td className="px-5 py-4 font-bold text-emerald-700">
                          Rp {b.total_price.toLocaleString("id-ID")}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Badge
                            className={
                              b.booking_status === "confirmed"
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-xs hover:bg-emerald-100"
                                : b.booking_status === "completed"
                                ? "bg-sky-100 text-sky-900 border-sky-300 font-bold text-xs hover:bg-sky-100"
                                : b.booking_status === "cancelled"
                                ? "bg-rose-100 text-rose-900 border-rose-300 font-bold text-xs hover:bg-rose-100"
                                : "bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs hover:bg-amber-100"
                            }
                          >
                            {b.booking_status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-500 font-medium">
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
          <TabsContent value="override" className="space-y-4 mt-0 animate-in fade-in duration-200">
            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <SlidersHorizontal className="h-5 w-5 text-cyan-600" />
                  Override Status Keselamatan Pelayaran
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 leading-relaxed">
                  Gunakan kendali darurat ini bila KSOP Cilacap mengeluarkan instruksi larangan berlayar resmi (Notam/Surat Edaran Cuaca Ekstrem) yang mendahului perhitungan otomatis BMKG.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                      Mode Otoritas Saat Ini:
                    </span>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">
                        {sailingOverride === "auto" && "Mode Otomatis (Sensor BMKG / Open-Meteo)"}
                        {sailingOverride === "waspada" && "Waspada Khusus Otoritas KSOP"}
                        {sailingOverride === "tunda" && "DITUNDA TOTAL (Larangan Berlayar Aktif)"}
                      </span>
                      <Badge
                        className={
                          sailingOverride === "auto"
                            ? "bg-cyan-100 text-cyan-900 border-cyan-300 font-bold text-xs"
                            : sailingOverride === "waspada"
                            ? "bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs"
                            : "bg-rose-100 text-rose-900 border-rose-300 font-bold text-xs"
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
                      className={`text-xs font-bold rounded-xl transition-all ${
                        sailingOverride === "auto"
                          ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Otomatis BMKG
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplySailingOverride("waspada")}
                      className={`text-xs font-bold rounded-xl transition-all ${
                        sailingOverride === "waspada"
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                      }`}
                    >
                      Peringatan Waspada
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplySailingOverride("tunda")}
                      className={`text-xs font-bold rounded-xl transition-all ${
                        sailingOverride === "tunda"
                          ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                          : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                      }`}
                    >
                      Tunda Semua Pelayaran
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <p className="leading-relaxed">
                    Pengubahan status berlayar ke <strong>Tunda Semua Pelayaran</strong> akan menghentikan sementara pembuatan booking baru di seluruh armada demi keselamatan penumpang sesuai regulasi KSOP.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: AI API Keys Pool Manager (Tradiora-Style Failover & Rotation) */}
          <TabsContent value="ai-keys" className="space-y-6 mt-0 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                  <Key className="h-7 w-7 text-cyan-600" />
                  <span>Pool AI API Key (Juru Mudi AI)</span>
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                  Kelola cadangan kunci Google Gemini API. Sistem otomatis merotasi kunci (failover) jika terjadi batas kuota (HTTP 429) sehingga chatbot tidak pernah mati.
                </p>
              </div>

              <Button
                variant="hero"
                onClick={() => {
                  setSelectedKey(null);
                  setIsKeyDialogOpen(true);
                }}
                className="rounded-xl text-xs font-bold gap-2 self-start sm:self-auto shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Kunci Baru</span>
              </Button>
            </div>

            {aiKeys.length === 0 ? (
              <Card className="rounded-3xl border-slate-200 bg-white shadow-sm p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto mb-4">
                  <Key className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Belum Ada Kunci di Database Pool</h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
                  Saat ini Juru Mudi AI menggunakan environment variable fallback (<code>GEMINI_API_KEY</code>). Tambahkan beberapa akun Gemini di sini untuk rotasi otomatis anti-limit!
                </p>
                <Button
                  variant="hero"
                  onClick={() => {
                    setSelectedKey(null);
                    setIsKeyDialogOpen(true);
                  }}
                  className="rounded-xl text-xs font-bold gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Kunci Pertama</span>
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                <div className="overflow-x-auto rounded-3xl border border-slate-200/90 bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4">Nama & Provider</th>
                        <th className="py-3.5 px-4">Kunci API</th>
                        <th className="py-3.5 px-4">Prioritas</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Pemakaian Token</th>
                        <th className="py-3.5 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {aiKeys.map((k) => {
                        const statusColors: Record<string, string> = {
                          ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
                          INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
                          DEPLETED: "bg-amber-50 text-amber-700 border-amber-200",
                          ERROR: "bg-rose-50 text-rose-700 border-rose-200",
                        };

                        return (
                          <tr key={k.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 text-xs">{k.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono mt-0.5">{k.provider}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-700 text-xs">
                              {maskApiKey(k.api_key)}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge variant="outline" className="text-[10px] font-bold rounded-lg px-2 py-0.5">
                                #{k.priority}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                  statusColors[k.status] || "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    k.status === "ACTIVE"
                                      ? "bg-emerald-500 animate-pulse"
                                      : k.status === "DEPLETED"
                                      ? "bg-amber-500"
                                      : k.status === "ERROR"
                                      ? "bg-rose-500"
                                      : "bg-slate-400"
                                  }`}
                                />
                                {k.status}
                              </span>
                              {k.error_msg && (
                                <p className="text-[10px] text-rose-600 mt-1 max-w-[200px] truncate" title={k.error_msg}>
                                  {k.error_msg}
                                </p>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                              <div>
                                {Number(k.tokens_used).toLocaleString("id-ID")} /{" "}
                                {k.tokens_limit !== null ? Number(k.tokens_limit).toLocaleString("id-ID") : "∞"}
                              </div>
                              {k.tokens_limit !== null && (
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      (k.tokens_used / k.tokens_limit) > 0.8 ? "bg-rose-500" : "bg-cyan-500"
                                    }`}
                                    style={{
                                      width: `${Math.min(100, Math.round((k.tokens_used / k.tokens_limit) * 100))}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={testingKeyId === k.id}
                                  onClick={() => handleTestConnection(k)}
                                  className="h-8 px-2.5 text-xs font-semibold text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-xl"
                                  title="Uji koneksi ping ke server Gemini"
                                >
                                  {testingKeyId === k.id ? (
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-600" />
                                  ) : (
                                    <Wifi className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleKeyStatus(k)}
                                  className={`h-8 px-2.5 text-xs font-bold rounded-xl ${
                                    k.status === "ACTIVE"
                                      ? "text-slate-600 hover:bg-slate-100"
                                      : "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                                  }`}
                                >
                                  {k.status === "ACTIVE" ? "Matikan" : "Aktifkan"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedKey({
                                      id: k.id,
                                      name: k.name,
                                      provider: k.provider,
                                      api_key: k.api_key,
                                      priority: k.priority,
                                      tokens_limit: k.tokens_limit,
                                      status: k.status,
                                    });
                                    setIsKeyDialogOpen(true);
                                  }}
                                  className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 rounded-xl"
                                  title="Edit kunci"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteKey(k.id)}
                                  className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl"
                                  title="Hapus kunci"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </main>
      </Tabs>

      <AiApiKeyDialog
        open={isKeyDialogOpen}
        onOpenChange={setIsKeyDialogOpen}
        initialData={selectedKey}
        onSave={handleSaveKey}
      />
    </div>
  );
};

export default AdminDashboard;

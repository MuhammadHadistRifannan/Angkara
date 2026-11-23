import { useEffect, useState, useCallback, useMemo } from "react";
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
  Ship,
  Calendar,
  DollarSign,
  Users,
  Plus,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Copy,
  Anchor,
  ShieldCheck,
  Ticket,
  FileCheck2,
  AlertOctagon,
  Compass,
  Package,
  Trash2,
  User as UserIcon,
  LogOut,
  Phone,
  Mail,
  Menu,
  X,
  Waves,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BoatModal, type OperatorBoatData } from "@/components/BoatModal";
import { ManifestModal, type ManifestBookingData } from "@/components/ManifestModal";
import {
  TourPackageModal,
  type OperatorTourPackageData,
} from "@/components/TourPackageModal";
import {
  OperatorWeatherAdvisory,
  type SailingSafetyLevel,
  type SailingSafetyVerdict,
} from "@/components/weather/OperatorWeatherAdvisory";
import { buildDailyStats } from "@/lib/operatorStats";

interface OperatorData {
  id: string;
  user_id?: string;
  company_name: string;
  ksop_certificate?: string | null;
  verified: boolean;
  phone: string;
  email: string;
  sailing_status?: string | null;
  sailing_status_note?: string | null;
  sailing_status_updated_at?: string | null;
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
  customer_name?: string | null;
  customer_phone?: string | null;
  created_at?: string;
  boats?: {
    id: string;
    operator_id: string;
    name: string;
    type: string;
  } | null;
}

type BookingFilterType = "all" | "pending" | "confirmed" | "completed" | "cancelled";


// Tooltip grafik booking & pemasukan (format rupiah).
const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string }[];
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-1">
      <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="text-slate-600">{entry.name}</span>
          <span className="font-bold text-slate-900">
            {entry.name === "Pemasukan"
              ? `Rp ${Number(entry.value || 0).toLocaleString("id-ID")}`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};



// Uang yang sudah masuk: lunas dihitung penuh, DP dihitung 30%.
// Booking batal dan yang belum bayar tidak dihitung.
const calcRevenue = (list: OperatorBooking[]) =>
  list
    .filter((b) => b.booking_status !== "cancelled")
    .reduce((sum, b) => {
      const pay = (b.payment_status || "").toLowerCase();
      if (pay === "paid" || pay === "fully_paid") return sum + (b.total_price || 0);
      if (pay === "dp_paid") return sum + Math.round((b.total_price || 0) * 0.3);
      return sum;
    }, 0);

// Label pembayaran yang mudah dimengerti (nilai di database ada yang huruf besar).
const getPaymentLabel = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s === "paid" || s === "fully_paid") return "Lunas";
  if (s === "dp_paid") return "DP Sudah Dibayar";
  if (s === "refunded") return "Dikembalikan";
  return "DP Belum Dibayar";
};


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
  const [isManifestModalOpen, setIsManifestModalOpen] = useState(false);
  const [selectedBookingForManifest, setSelectedBookingForManifest] = useState<OperatorBooking | null>(null);
  const [packages, setPackages] = useState<OperatorTourPackageData[]>([]);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [selectedPackageToEdit, setSelectedPackageToEdit] = useState<OperatorTourPackageData | null>(null);
  const [isTogglingPackage, setIsTogglingPackage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalBoats: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
  });
  const [currentSafety, setCurrentSafety] = useState<SailingSafetyLevel>("aman");
const [sailingStatus, setSailingStatus] = useState<string>("auto");
const [sailingNote, setSailingNote] = useState("");
const [isSavingSailingStatus, setIsSavingSailingStatus] = useState(false);

  const [, setSafetyVerdict] = useState<SailingSafetyVerdict | null>(null);

  // State navigasi tab, mobile sidebar drawer, dan profil operator
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editKsopCert, setEditKsopCert] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
      setEditCompanyName(operatorData.company_name || "");
      setEditPhone(operatorData.phone || "");
      setEditKsopCert(operatorData.ksop_certificate || "");
      const opData = operatorData as OperatorData;
      setSailingStatus(opData.sailing_status || "auto");
      setSailingNote(opData.sailing_status_note || "");
      fetchBoats(operatorData.id);
      fetchBookings(operatorData.id);
      fetchPackages(operatorData.id);
    };
    checkOperator();
  }, [navigate]);

  // Langganan sinkronisasi realtime Supabase untuk booking, armada, dan paket wisata
  useEffect(() => {
    if (!operator?.id) return;
    if (typeof supabase.channel !== "function") return;

    const opId = operator.id;
    const channel = supabase
      .channel("operator-dashboard-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          fetchBookings(opId);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "boats" },
        () => {
          fetchBoats(opId);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tour_packages" },
        () => {
          fetchPackages(opId);
        }
      )
      .subscribe();

    return () => {
      if (typeof supabase.removeChannel === "function") {
        supabase.removeChannel(channel);
      }
    };
  }, [operator?.id]);

  const fetchPackages = async (operatorId: string) => {
    try {
      const { data, error } = await supabase
        .from("tour_packages")
        .select("*")
        .eq("operator_id", operatorId);

      if (!error && data) {
        setPackages(data as OperatorTourPackageData[]);
      }
    } catch {
      // Handle gracefully
    }
  };

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
  // Ambil nama + nomor HP wisatawan dari profiles (bisa dibaca operator
  // untuk wisatawan yang booking kapalnya - lihat migrasi O5).
  // Best-effort: kalau gagal (mis. migrasi belum diterapkan), booking
  // tetap tampil dan tombol chat memakai fallback salin.
  try {
    const userIds = [...new Set(typedData.map((b) => b.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);
      if (profiles) {
        const byId = new Map<string, { full_name: string | null; phone: string | null }>();
        for (const p of profiles) {
          byId.set(p.id, { full_name: p.full_name, phone: p.phone });
        }
        for (const b of typedData) {
          const p = byId.get(b.user_id);
          b.customer_name = p?.full_name ?? null;
          b.customer_phone = p?.phone ?? null;
        }
      }
    }
  } catch {
    // Abaikan: info wisatawan tidak tampil, tombol chat pakai fallback.
  }
  setBookings(typedData);

      
      const totalRevenue = calcRevenue(typedData);
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
        `Status ${boat.name} diubah menjadi: ${
          newStatus ? "Siap Berlayar" : "Lagi Diperbaiki"
        }`
      );
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err instanceof Error ? err.message : "Gagal mengubah status kapal");
      toast.error(msg);
    } finally {
      setIsTogglingBoat(null);
    }
  };

  // Aksi Manajemen Paket Wisata (Tambah / Edit / Toggle Status / Hapus)
  const handleOpenAddPackage = () => {
    setSelectedPackageToEdit(null);
    setIsPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg: OperatorTourPackageData) => {
    setSelectedPackageToEdit(pkg);
    setIsPackageModalOpen(true);
  };

  const handlePackageSaved = (savedPkg: OperatorTourPackageData) => {
    setPackages((prev) => {
      const exists = prev.some((p) => p.id === savedPkg.id);
      if (exists) {
        return prev.map((p) => (p.id === savedPkg.id ? ({ ...p, ...savedPkg } as OperatorTourPackageData) : p));
      } else {
        return [savedPkg, ...prev];
      }
    });
  };

  const handleTogglePackageAvailability = async (pkg: OperatorTourPackageData) => {
    if (!pkg.id) return;
    const newStatus = !(pkg.available ?? true);
    try {
      setIsTogglingPackage(pkg.id);
      const { error } = await supabase
        .from("tour_packages")
        .update({ available: newStatus })
        .eq("id", pkg.id);

      if (error) throw error;

      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, available: newStatus } : p))
      );

      toast.success(
        `Status paket "${pkg.name}" diubah menjadi: ${
          newStatus ? "Aktif" : "Nonaktif"
        }`
      );
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err instanceof Error ? err.message : "Gagal mengubah status paket");
      toast.error(msg);
    } finally {
      setIsTogglingPackage(null);
    }
  };

  const handleDeletePackage = async (pkg: OperatorTourPackageData) => {
    if (!pkg.id) return;
    const confirmDelete = window.confirm(`Hapus paket "${pkg.name}"? Paket yang dihapus tidak bisa kembali.`);
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("tour_packages")
        .delete()
        .eq("id", pkg.id);

      if (error) throw error;

      setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
      toast.success(`Paket "${pkg.name}" sudah dihapus`);
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err instanceof Error ? err.message : "Gagal menghapus paket");
      toast.error(msg);
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
          totalRevenue: calcRevenue(updated),
          pendingBookings: updated.filter((b) => b.booking_status === "pending").length,
        };
      });

      if (newStatus === "confirmed") {
        toast.success("Booking sudah diterima");
      } else if (newStatus === "completed") {
        toast.success("Perjalanan selesai. Wisatawan sekarang bisa memberi ulasan.");
      } else if (newStatus === "cancelled") {
        toast.success("Booking sudah dibatalkan");
      }
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err instanceof Error ? err.message : "Gagal mengubah status booking");
      toast.error(msg);
    } finally {
      setIsUpdating(null);
    }
  };

// Salin info booking supaya operator bisa menempelkannya ke chat WA wisatawan.
// (Nomor HP wisatawan tidak tersimpan di booking, jadi tombol chat langsung tidak bisa jalan.)
const handleCopyBooking = async (booking: OperatorBooking) => {
  const dateStr = new Date(booking.booking_date).toLocaleDateString("id-ID");
  const ticketCode = `SUAR-${booking.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  const text =
    `${ticketCode} • ${booking.boats?.name || "Kapal Wisata"} • ${dateStr} ${booking.departure_time.slice(0, 5)} WIB • ` +
    `${booking.passengers} penumpang • Total Rp ${booking.total_price.toLocaleString("id-ID")}`;
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Info booking disalin, tempel ke chat WA wisatawan");
  } catch {
    toast.error("Gagal menyalin info booking");
  }
};

// Buka dialog daftar penumpang
const handleOpenManifest = (booking: OperatorBooking) => {
  setSelectedBookingForManifest(booking);
  setIsManifestModalOpen(true);
};

// Check-in dari daftar penumpang: tandai penumpang sudah naik.
// (Memakai status "Selesai" yang sudah ada; belum ada status "Sudah Berangkat" sendiri.)
const handleCheckInFromManifest = async (booking: ManifestBookingData) => {
  await handleUpdateBookingStatus(booking.id, "completed");
  setIsManifestModalOpen(false);
};


  // Handler update status keselamatan maritim dari papan telemetri
const handleWeatherStatusChange = useCallback((verdict: SailingSafetyVerdict) => {
  setCurrentSafety(verdict.level);
  setSafetyVerdict(verdict);
}, []);

// Simpan status berlayar hari ini (diisi operator tiap pagi).
// "auto" = ikut cuaca otomatis; selain itu status manual operator yang dipakai.
const handleSaveSailingStatus = async () => {
  if (!operator?.id) return;
  setIsSavingSailingStatus(true);
  try {
    // "as never": kolom baru belum ada di tipe Supabase yang digenerate
    // (tipe diperbarui setelah migrasi diterapkan). Saat runtime, kalau kolom
    // belum ada, update gagal dan ditangkap di catch di bawah.
    const { error } = await supabase
      .from("operators")
      .update({
        sailing_status: sailingStatus,
        sailing_status_note: sailingNote.trim() || null,
        sailing_status_updated_at: new Date().toISOString(),
      } as never)
      .eq("id", operator.id);
    if (error) throw error;
    setOperator((prev) =>
      prev
        ? {
            ...prev,
            sailing_status: sailingStatus,
            sailing_status_note: sailingNote.trim() || null,
            sailing_status_updated_at: new Date().toISOString(),
          }
        : null
    );
    toast.success("Status berlayar hari ini sudah disimpan");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("sailing_status")) {
      toast.error("Status belum bisa disimpan, database belum diperbarui");
    } else {
      toast.error("Gagal menyimpan status berlayar");
    }
  } finally {
    setIsSavingSailingStatus(false);
  }
};


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs hover:bg-amber-100">
            Menunggu Jawaban
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-xs hover:bg-emerald-100">
            Diterima
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-bold text-xs hover:bg-sky-100">
            Selesai
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

  // Simpan pembaharuan profil operator & registrasi KSOP
  const handleUpdateOperatorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operator?.id) return;
    if (!editCompanyName.trim()) {
      toast.error("Nama usaha harus diisi");
      return;
    }
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from("operators")
        .update({
          company_name: editCompanyName.trim(),
          phone: editPhone.trim(),
          ksop_certificate: editKsopCert.trim() || null,
        })
        .eq("id", operator.id);

      if (error) throw error;

      setOperator((prev) =>
        prev
          ? {
              ...prev,
              company_name: editCompanyName.trim(),
              phone: editPhone.trim(),
              ksop_certificate: editKsopCert.trim() || null,
            }
          : null
      );
      toast.success("Profil berhasil disimpan");
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err instanceof Error ? err.message : "Gagal menyimpan profil");
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Logout akun operator
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Anda sudah keluar");
      navigate("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal keluar";
      toast.error(msg);
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

// Status berlayar yang dipakai: kalau operator sudah isi manual, pakai itu.
// Kalau tidak, ikut cuaca otomatis (Open-Meteo).
const effectiveSafety: SailingSafetyLevel =
  operator?.sailing_status && operator.sailing_status !== "auto"
    ? (operator.sailing_status as SailingSafetyLevel)
    : currentSafety;

const dailyStats = useMemo(() => buildDailyStats(bookings), [bookings]);
const hasChartData = dailyStats.some((s) => s.booking > 0);


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
                {operator?.company_name ? operator.company_name.charAt(0).toUpperCase() : "O"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-bold text-slate-900 line-clamp-1">
                {operator?.company_name || "Operator Kapal"}
              </p>
              <span className="text-[10px] text-primary font-semibold block">Operator SUAR</span>
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
        {/* Sidebar Navigasi & Profil Operator (Desktop & Mobile Drawer) - Full dari atas ke bawah */}
        <aside
          className={`
            fixed md:sticky top-20 inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out md:translate-x-0
            ${isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
            min-h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] overflow-y-auto
          `}
        >
          <div className="space-y-6">
            {/* Kartu Profil Operator */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-light/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 relative z-10">
                <Avatar className="h-12 w-12 border-2 border-primary-light shadow-sm">
                  <AvatarFallback className="bg-primary text-white font-black text-sm">
                    {operator?.company_name ? operator.company_name.slice(0, 2).toUpperCase() : "OP"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-white truncate">
                    {operator?.company_name || "Operator Kapal"}
                  </h3>
                  <p className="text-[11px] text-slate-300 truncate">
                    {operator?.email || "-"}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <Badge className="bg-primary-light/20 text-primary-light border border-primary-light/30 text-[9px] px-1.5 py-0 font-semibold">
                      Operator
                    </Badge>
                    {operator?.verified ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] px-1.5 py-0 font-semibold flex items-center gap-1">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        Terverifikasi
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] px-1.5 py-0 font-semibold">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {operator?.ksop_certificate && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 text-[10px] text-slate-300 flex items-center justify-between">
                  <span className="text-slate-400">No. Sertifikat:</span>
                  <span className="font-mono text-primary-light truncate ml-2">{operator.ksop_certificate}</span>
                </div>
              )}
            </div>

            {/* Menu Navigasi Tabs Sidebar */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
                Menu
              </span>
              <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1.5">
                <TabsTrigger
                  value="overview"
                  className="w-full justify-start px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-primary hover:bg-slate-100 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 transition-all flex items-center gap-2.5"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  <span>Dashboard</span>
                </TabsTrigger>

                <TabsTrigger
                  value="boats"
                  className="w-full justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-primary hover:bg-slate-100 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 transition-all flex items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <Ship className="h-4 w-4 text-primary" />
                    <span>Kapal Saya</span>
                  </div>
                  {boats.length > 0 && (
                    <span className="h-5 px-1.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {boats.length}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="packages"
                  className="w-full justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-primary hover:bg-slate-100 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 transition-all flex items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="h-4 w-4 text-primary" />
                    <span>Paket Wisata</span>
                  </div>
                  {packages.length > 0 && (
                    <span className="h-5 px-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">
                      {packages.length}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="bookings"
                  className="w-full justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-primary hover:bg-slate-100 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 transition-all flex items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <Ticket className="h-4 w-4 text-primary" />
                    <span>Booking</span>
                  </div>
                  {pendingCount > 0 && (
                    <span className="h-5 px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="profile"
                  className="w-full justify-start px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-primary hover:bg-slate-100 data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/20 transition-all flex items-center gap-2.5"
                >
                  <UserIcon className="h-4 w-4 text-primary" />
                  <span>Profil & Legalitas</span>
                </TabsTrigger></TabsList>
            </div>

            {/* Pintasan */}
            <div className="pt-2 border-t border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
                Pintasan
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
                <span>Lihat Peta Cuaca</span>
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
                <span>Lihat Semua Kapal</span>
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
                <span>Lihat Semua Paket</span>
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
              <span>Keluar</span>
            </Button>
          </div>
        </aside>

        {/* Konten Utama Dashboard (Sebelah Kanan Sidebar) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full">
          {/* TAB 1: Dashboard (Ringkasan, Keselamatan Maritim, Stats & Analitik) */}
          <TabsContent value="overview" className="space-y-6 mt-0 animate-in fade-in duration-200">
            {/* Header Dashboard Operator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Dashboard Operator
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                  Ringkasan kapal, booking, dan pemasukan Anda.
                </p>
              </div>

              {operator?.verified && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start sm:self-auto">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Operator Terverifikasi</span>
                </div>
              )}
            </div>

            {/* Cuaca Laut Hari Ini */}
<div>
  <OperatorWeatherAdvisory onStatusChange={handleWeatherStatusChange} />
</div>

{/* Status Berlayar Hari Ini (diisi operator tiap pagi) */}
<Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
      <Anchor className="h-5 w-5 text-primary" />
      Status Berlayar Hari Ini
    </CardTitle>
    <CardDescription className="text-xs text-slate-500">
      Isi tiap pagi sebelum kapal berangkat. Kalau diisi manual, status ini yang tampil di kapal Anda.
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="flex flex-wrap gap-2">
      {(
        [
          ["auto", "Ikut Cuaca Otomatis"],
          ["aman", "Aman"],
          ["waspada", "Waspada"],
          ["tunda", "Tunda"],
        ] as const
      ).map(([value, label]) => (
        <Button
          key={value}
          type="button"
          variant={sailingStatus === value ? "default" : "outline"}
          size="sm"
          onClick={() => setSailingStatus(value)}
          className="rounded-xl text-xs font-bold"
        >
          {label}
        </Button>
      ))}
    </div>
    <div className="space-y-1.5">
      <Label htmlFor="sailingNote" className="text-xs font-bold text-slate-700">
        Catatan (boleh kosong)
      </Label>
      <Input
        id="sailingNote"
        value={sailingNote}
        onChange={(e) => setSailingNote(e.target.value)}
        placeholder="cth. Ombak besar di luar Teluk Penyu"
        className="rounded-xl border-slate-200 text-sm"
      />
    </div>
    <Button
      type="button"
      variant="hero"
      size="sm"
      disabled={isSavingSailingStatus}
      onClick={handleSaveSailingStatus}
      className="rounded-xl text-xs font-bold"
    >
      {isSavingSailingStatus ? "Menyimpan..." : "Simpan Status Hari Ini"}
    </Button>
    {operator?.sailing_status_updated_at && (
      <p className="text-[11px] text-slate-400">
        Terakhir disimpan:{" "}
        {new Date(operator.sailing_status_updated_at).toLocaleString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        WIB
      </p>
    )}
  </CardContent>
</Card>


            {/* Stats Cards Ringkasan */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kapal</p>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats.totalBoats}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
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
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Perkiraan Pemasukan</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                      Rp {stats.totalRevenue.toLocaleString("id-ID")}
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
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menunggu Jawaban</p>
                    <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{stats.pendingBookings}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistik Performa Pelayaran (Analitik) */}
            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Ringkasan Usaha
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Total booking dan pemasukan dari semua kapal Anda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20">
                  <h4 className="font-bold text-sm text-slate-900 mb-3">Total Selama Ini</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-slate-500 font-medium">Booking Masuk</div>
                      <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalBookings} Trip</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-medium">Perkiraan Pemasukan</div>
                      <div className="text-2xl font-black text-slate-900 mt-1">
                        Rp {stats.totalRevenue.toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-medium">Booking per Kapal</div>
                      <div className="text-2xl font-black text-primary mt-1">
                        {stats.totalBoats > 0
                          ? (stats.totalBookings / stats.totalBoats).toFixed(1).replace(".", ",")
                          : 0}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Grafik Booking & Pemasukan 14 Hari Terakhir */}
  <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
        <TrendingUp className="h-5 w-5 text-primary" />
        Booking 14 Hari Terakhir
      </CardTitle>
      <CardDescription className="text-xs text-slate-500">
        Jumlah booking masuk dan pemasukan tiap hari.
      </CardDescription>
    </CardHeader>
    <CardContent>
      {hasChartData ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyStats} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000000 ? `${(v / 1000000).toFixed(1)} jt` : `${Math.round(v / 1000)} rb`
                }
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="booking" name="Booking Masuk" fill="#0b4f9c" radius={[6, 6, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="pemasukan" name="Pemasukan" stroke="#059669" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-xs text-slate-500 py-8 text-center">Belum ada booking masuk 14 hari terakhir.</p>
      )}
    </CardContent>
  </Card>
          </TabsContent>

          {/* TAB 1: Kapal Saya */}
          <TabsContent value="boats" className="space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">Kapal Saya</h2>
                <p className="text-xs text-slate-500">Atur kapal, jumlah penumpang, dan harganya.</p>
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
                        <span className="text-slate-500">Jumlah Penumpang:</span>
                        <span className="font-bold text-slate-800">{boat.capacity} Orang</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Harga Sewa:</span>
                        <span className="font-bold text-primary">Rp {boat.base_price.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Status Kapal:</span>
                        <span
                          className={`font-bold ${
                            boat.available ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {boat.available ? "Siap Berlayar" : "Lagi Diperbaiki"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500">Cuaca Hari Ini:</span>
                        <span>
                          {effectiveSafety === "aman" ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                              ● Aman Berlayar
                            </Badge>
                          ) : effectiveSafety === "waspada" ? (
                            <Badge className="bg-amber-50 text-amber-800 border-amber-300 text-[10px] font-bold">
                              ▲ Waspada
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-50 text-rose-800 border-rose-300 text-[10px] font-bold">
                              ✖ Tunda Berlayar
                            </Badge>
                          )}
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
                        {boat.available ? "Tandai Diperbaiki" : "Tandai Siap"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: Paket Wisata */}
          <TabsContent value="packages" className="space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">Daftar Paket Wisata</h2>
                <p className="text-xs text-slate-500">
                  Atur paket tour dan harganya untuk wisatawan.
                </p>
              </div>
              <Button
                variant="hero"
                onClick={handleOpenAddPackage}
                className="rounded-xl text-xs font-bold gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Paket
              </Button>
            </div>

            {packages.length === 0 ? (
              <Card className="rounded-2xl border-slate-200 border-dashed p-8 text-center bg-white">
                <Compass className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700 text-sm">Belum ada paket wisata</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Buat paket tour pertama Anda, misalnya trip ke Teluk Penyu atau Nusakambangan.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenAddPackage}
                  className="mt-4 rounded-xl text-xs font-bold gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah Paket Pertama
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <Card key={pkg.id} className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col justify-between">
                    <div>
                      <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base font-bold text-slate-900 leading-snug">
                            {pkg.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold shrink-0 ${
                              pkg.available ?? true
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-slate-100 text-slate-600 border-slate-300"
                            }`}
                          >
                            {pkg.available ?? true ? "● Aktif" : "○ Nonaktif"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-slate-500">Harga Paket:</span>
                            <span className="font-black text-primary text-sm">
                              Rp {pkg.price.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-slate-500">Lama Trip:</span>
                            <span className="font-bold text-slate-800">{pkg.duration_hours} Jam</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-slate-500">Kapal:</span>
                            <span className="font-bold text-slate-800">
                              {boats.find((b) => b.id === pkg.boat_id)?.name || "Kapal dari operator"}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-50">
                            <span className="text-slate-500">Jumlah Penumpang:</span>
                            <span className="font-bold text-slate-800">
                              {pkg.max_participants ? `${pkg.max_participants} Orang` : "-"}
                            </span>
                          </div>
                        </div>

                        {pkg.description && (
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                            {pkg.description}
                          </p>
                        )}

                        {pkg.includes && pkg.includes.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {pkg.includes.map((inc) => (
                              <span
                                key={inc}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                              >
                                {inc}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </div>

                    <CardContent className="pt-0 pb-4">
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditPackage(pkg)}
                          className="flex-1 rounded-xl text-xs font-bold border-slate-200"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isTogglingPackage === pkg.id}
                          onClick={() => handleTogglePackageAvailability(pkg)}
                          className={`flex-1 rounded-xl text-xs font-bold ${
                            pkg.available ?? true
                              ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {pkg.available ?? true ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePackage(pkg)}
                          className="h-9 px-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                          title="Hapus Paket"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: Konsol Booking */}
          <TabsContent value="bookings" className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">Booking Masuk</h2>
                <p className="text-xs text-slate-500">
                  Konfirmasi atau selesaikan pesanan wisatawan dan siapkan manifes kapal.
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
                  aria-label="Filter status: Diterima"
                  variant={bookingFilter === "confirmed" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBookingFilter("confirmed")}
                  className={`rounded-xl text-xs font-bold gap-1.5 h-8 ${
                    bookingFilter === "confirmed" ? "bg-[#090D16] text-white shadow-sm" : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span>Diterima</span>
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

            {/* Peringatan bila cuaca Tunda */}
            {effectiveSafety === "tunda" && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3">
                <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <p className="font-bold">Peringatan cuaca: status "TUNDA"</p>
                  <p className="mt-0.5 text-rose-800">
                    Gelombang atau angin saat ini melebihi ambang batas aman. Seluruh keberangkatan disarankan ditunda. Hubungi wisatawan untuk koordinasi penjadwalan ulang.
                  </p>
                </div>
              </div>
            )}

            {/* List Booking */}
            {filteredBookings.length === 0 ? (
              <Card className="rounded-2xl border-slate-200 border-dashed p-8 text-center bg-white">
                <Ticket className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700 text-sm">Tidak ada booking di sini</h3>
                <p className="text-xs text-slate-500 mt-1">Coba pilih yang lain di atas.</p>
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
                                <strong className="text-slate-800 text-[11px]">
                                  {getPaymentLabel(booking.payment_status)}
                                </strong>
                              </span>
                              {effectiveSafety === "tunda" &&
                                (booking.booking_status === "pending" ||
                                  booking.booking_status === "confirmed") && (
                                  <Badge className="bg-rose-100 text-rose-900 border-rose-300 font-bold text-[10px]">
                                    Tunda Berlayar
                                  </Badge>
                                )}
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
                            <span className="text-xs text-slate-500 block">Total Harga</span>
                            <span className="text-xl font-black text-primary block">
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
                                className="bg-primary hover:bg-primary text-white rounded-xl text-xs font-bold gap-1.5 shadow-sm"
                              >
                                <Anchor className="h-4 w-4" />
                                <span>Selesaikan Perjalanan</span>
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
                              <span>Perjalanan Selesai</span>
                            </div>
                          )}

                          {booking.booking_status === "cancelled" && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
                              <XCircle className="h-4 w-4 text-rose-600" />
                              <span>Booking Dibatalkan</span>
                            </div>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenManifest(booking)}
                            className="rounded-xl text-xs font-semibold border-slate-200 text-slate-800 hover:bg-primary/5 hover:text-primary hover:border-primary/30 gap-1.5 ml-auto"
                          >
                            <FileCheck2 className="h-4 w-4 text-primary" />
                            <span>Daftar Penumpang</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyBooking(booking)}
                            className="rounded-xl text-xs font-semibold border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 gap-1.5"
                          >
                            <Copy className="h-4 w-4 text-emerald-600" />
                            <span>Salin Info Booking</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 4: Profil & Legalitas KSOP */}
          <TabsContent value="profile" className="space-y-4 animate-in fade-in duration-200">
            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Profil Usaha
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Atur nama usaha, nomor HP, dan nomor sertifikat Anda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateOperatorProfile} className="space-y-4 max-w-xl">
                  <div className="space-y-1.5">
                    <Label htmlFor="companyName" className="text-xs font-bold text-slate-700">
                      Nama Usaha
                    </Label>
                    <Input
                      id="companyName"
                      value={editCompanyName}
                      onChange={(e) => setEditCompanyName(e.target.value)}
                      placeholder="cth. Koperasi Nelayan Pandanarang"
                      className="rounded-xl border-slate-200 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="operatorEmail" className="text-xs font-bold text-slate-700">
                      Email Akun
                    </Label>
                    <Input
                      id="operatorEmail"
                      value={operator?.email || ""}
                      disabled
                      className="rounded-xl border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-slate-400">Email ini tidak bisa diubah.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="operatorPhone" className="text-xs font-bold text-slate-700">
                      Nomor HP / WhatsApp
                    </Label>
                    <Input
                      id="operatorPhone"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="cth. 081234567890"
                      className="rounded-xl border-slate-200 text-sm"
                    />
                    <p className="text-[11px] text-slate-400">Nomor ini dipakai wisatawan untuk menghubungi Anda.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="operatorKsopCert" className="text-xs font-bold text-slate-700">
                      Nomor Sertifikat
                    </Label>
                    <Input
                      id="operatorKsopCert"
                      value={editKsopCert}
                      onChange={(e) => setEditKsopCert(e.target.value)}
                      placeholder="cth. KSOP.CLP/2026/04-A"
                      className="rounded-xl border-slate-200 text-sm font-mono"
                    />
                    <p className="text-[11px] text-slate-400">Nomor sertifikat kapal Anda dari KSOP.</p>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Button
                      type="submit"
                      variant="hero"
                      disabled={isSavingProfile}
                      className="rounded-xl font-bold text-xs"
                    >
                      {isSavingProfile ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </main>
      </Tabs>

      {/* Modal Tambah / Edit Armada Kapal */}
      <BoatModal
        open={isBoatModalOpen}
        onOpenChange={setIsBoatModalOpen}
        operatorId={operator?.id || ""}
        boatToEdit={selectedBoatToEdit}
        onSaveSuccess={handleBoatSaved}
      />

      {/* Modal Daftar Penumpang & Cek Kapal */}
      <ManifestModal
        open={isManifestModalOpen}
        onOpenChange={setIsManifestModalOpen}
        booking={selectedBookingForManifest}
        operatorName={operator?.company_name}
        onCheckIn={handleCheckInFromManifest}
        isCheckingIn={isUpdating === selectedBookingForManifest?.id}
      />


      {/* Modal Tambah / Edit Paket Wisata */}
      <TourPackageModal
        open={isPackageModalOpen}
        onOpenChange={setIsPackageModalOpen}
        operatorId={operator?.id || ""}
        boats={boats}
        packageToEdit={selectedPackageToEdit}
        onSaveSuccess={handlePackageSaved}
      />
    </div>
  );
};

export default OperatorDashboard;

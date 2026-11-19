import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Ship,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  CloudSun,
  Waves,
  Compass,
  Anchor,
  BotMessageSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { signInWithGoogle } from "@/lib/auth";
import { getDashboardRedirectPath } from "@/lib/authRoles";
import googleLogo from "@/assets/google.svg";
import { Mascot, type MascotMood } from "@/components/illustrations/Mascot";

/**
 * TEMA DESAIN HALAMAN AUTENTIKASI:
 * - "suar" (default): Latar teal laut jenuh, permukaan krem pasir, tombol kuning matahari, aksen seafoam & koral.
 * - "velin" (alternatif terinspirasi Gambar 2): Latar magenta pink, permukaan ivory, kartu ungu & peach.
 * Aktifkan tema pilihan dengan mengubah konstanta AUTH_THEME.
 */
export type AuthThemeName = "suar" | "velin";
export const AUTH_THEME: AuthThemeName = "suar";

interface ThemeConfig {
  bgPrimary: string;
  bgPolygons: [string, string, string];
  windowBg: string;
  textTitle: string;
  textBody: string;
  btnPrimary: string;
  cardTopBg: string;
  cardTopBorder: string;
  cardTopBubbleText: string;
  cardBottomBg: string;
  cardBottomBorder: string;
  cardBottomBubbleText: string;
}

const THEMES: Record<AuthThemeName, ThemeConfig> = {
  suar: {
    bgPrimary: "from-[#0F766E] via-[#0D9488] to-[#115E59]", // Teal laut jenuh
    bgPolygons: ["#042F2E", "#14B8A6", "#2DD4BF"],
    windowBg: "bg-[#FAF7F2]", // Pasir krem hangat
    textTitle: "text-slate-900",
    textBody: "text-slate-600",
    btnPrimary:
      "bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-950 shadow-[0_8px_20px_-4px_rgba(251,191,36,0.5)]",
    cardTopBg: "bg-[#E6F8F3]", // Seafoam lembut
    cardTopBorder: "border-[#A7F3D0]",
    cardTopBubbleText: "text-teal-950",
    cardBottomBg: "bg-[#FB923C]", // Koral pelampung hangat
    cardBottomBorder: "border-orange-400",
    cardBottomBubbleText: "text-slate-900",
  },
  velin: {
    bgPrimary: "from-[#FF4E9B] via-[#F43F5E] to-[#E11D48]", // Magenta pink jenuh Gambar 2
    bgPolygons: ["#881337", "#FB7185", "#FDA4AF"],
    windowBg: "bg-[#FFFDF7]", // Ivory krem
    textTitle: "text-[#1C1917]",
    textBody: "text-stone-600",
    btnPrimary:
      "bg-[#FFC700] hover:bg-[#F59E0B] text-[#1C1917] shadow-[0_8px_20px_-4px_rgba(255,199,0,0.5)]",
    cardTopBg: "bg-[#FFE4E8]", // Pastel rose
    cardTopBorder: "border-[#FDA4AF]",
    cardTopBubbleText: "text-pink-950",
    cardBottomBg: "bg-[#8B5CF6]", // Royal violet Gambar 2
    cardBottomBorder: "border-purple-400",
    cardBottomBubbleText: "text-slate-900",
  },
};

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const theme = THEMES[AUTH_THEME];

  const [loading, setLoading] = useState(false);
  const [signupRole, setSignupRole] = useState<"tourist" | "operator">("tourist");
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupPasswordVal, setSignupPasswordVal] = useState("");
  const [mascotMood, setMascotMood] = useState<MascotMood>("happy");

  const emailInputRef = useRef<HTMLInputElement>(null);

  // 1. Sinkronisasi dengan URL Query (?mode=login | ?mode=register) & Tangani Galat OAuth
  useEffect(() => {
    // Tangani kemungkinan galat OAuth dari callback Google/Supabase
    const hashStr = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    const hashParams = new URLSearchParams(hashStr);
    const searchParams = new URLSearchParams(window.location.search);
    const oauthErrorDesc = hashParams.get("error_description") || searchParams.get("error_description");
    const oauthError = hashParams.get("error") || searchParams.get("error");

    if (oauthErrorDesc || oauthError) {
      const rawMsg = oauthErrorDesc || oauthError || "Autentikasi OAuth gagal";
      const cleanMsg = decodeURIComponent(rawMsg.replace(/\+/g, " "));
      toast.error(`Gagal masuk dengan Google: ${cleanMsg}`);
      setMascotMood("worried");
      // Bersihkan hash error dari URL agar tidak berulang
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }

    const mode = searchParams.get("mode");
    if (mode === "register" || mode === "signup") {
      setActiveTab("signup");
    } else {
      setActiveTab("signin");
    }
  }, []);

  const switchTab = (tab: "signin" | "signup") => {
    setActiveTab(tab);
    setMascotMood(tab === "signup" ? "celebrate" : "happy");

    const params = new URLSearchParams(window.location.search);
    if (tab === "signup") {
      params.set("mode", "register");
    } else {
      params.delete("mode");
    }
    const newSearch = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, "", newSearch);

    // Fokus otomatis ke input pertama
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 150);
  };

  // 2. Cek sesi aktif dan arahkan ke dashboard
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const targetPath = await getDashboardRedirectPath(session.user);
        navigate(targetPath, { replace: true });
      }
    });

    const subscription =
      typeof supabase.auth?.onAuthStateChange === "function"
        ? supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              const targetPath = await getDashboardRedirectPath(session.user);
              navigate(targetPath, { replace: true });
            }
          })
        : null;

    return () => {
      if (subscription?.data?.subscription) {
        subscription.data.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  // 3. Handler Sign In (Masuk)
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMascotMood("thinking");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("signin-email") as string;
    const password = formData.get("signin-password") as string;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setMascotMood("worried");
      toast.error(error.message);
      setTimeout(() => setMascotMood("happy"), 3500);
    } else if (data.user) {
      setMascotMood("celebrate");
      toast.success("Login berhasil! Selamat berlayar.");
      const targetPath = await getDashboardRedirectPath(data.user);
      navigate(targetPath);
    }
  };

  // 4. Handler Sign Up (Daftar)
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMascotMood("thinking");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;
    const fullName = formData.get("full-name") as string;
    const companyName = (formData.get("company-name") as string) || fullName;
    const phone = (formData.get("operator-phone") as string) || "-";
    const address = (formData.get("operator-address") as string) || undefined;
    const ksopCertificate = (formData.get("ksop-certificate") as string) || undefined;
    const homePort = (formData.get("home-port") as string) || undefined;
    const boatCount = (formData.get("boat-count") as string) || undefined;

    const isOperator = signupRole === "operator";

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: fullName,
          role: isOperator ? "operator" : "tourist",
          company_name: isOperator ? companyName : undefined,
          phone: isOperator ? phone : undefined,
          address: isOperator ? address : undefined,
          ksop_certificate: isOperator ? ksopCertificate : undefined,
          home_port: isOperator ? homePort : undefined,
          boat_count: isOperator ? boatCount : undefined,
        },
      },
    });

    if (!error && isOperator && authData.user) {
      try {
        await supabase.from("operators").insert({
          user_id: authData.user.id,
          company_name: companyName,
          email: email.trim().toLowerCase(),
          phone: phone,
          address: address ?? null,
          ksop_certificate: ksopCertificate ?? null,
          verified: true,
        });
      } catch (opErr) {
        console.warn("Operator auto-insert info:", opErr);
      }
    }

    setLoading(false);
    if (error) {
      setMascotMood("worried");
      toast.error(error.message);
      setTimeout(() => setMascotMood("celebrate"), 3500);
    } else {
      setMascotMood("celebrate");
      toast.success(
        isOperator
          ? "Akun operator berhasil dibuat! Silakan masuk untuk mengelola armada kapal Anda."
          : "Akun berhasil dibuat! Silakan masuk."
      );
    }
  };

  // 5. Handler Google OAuth
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMascotMood("thinking");
    const { error } = await signInWithGoogle();
    if (error) {
      setMascotMood("worried");
      toast.error(error.message);
      setLoading(false);
      setTimeout(() => setMascotMood("happy"), 3500);
    }
  };

  // Pengukur kekuatan password 3 segmen sederhana
  const calculatePasswordStrength = (pass: string): number => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8 && /[A-Za-z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (pass.length >= 10 && /[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.max(1, score);
  };

  const passwordStrength = calculatePasswordStrength(signupPasswordVal);

  return (
    <div
      className={`min-h-screen w-full relative flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-hidden bg-gradient-to-br ${theme.bgPrimary}`}
    >
      {/* 
        A. LATAR BELAKANG POLIGON DINAMIS & GELEMBUNG LEMBUT:
        SVG inline bertingkat dengan animasi gerak drift lembut (20s GPU transform).
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover suar-bg-drift opacity-60"
          preserveAspectRatio="none"
        >
          {/* Poligon Aksen Atas Kiri */}
          <path
            d="M-100,-100 L450,-60 L380,320 L-60,400 Z"
            fill={theme.bgPolygons[0]}
            fillOpacity="0.35"
          />
          {/* Bentuk Lengkung Halus Kanan Atas */}
          <path
            d="M1100,-120 C1350,-40 1520,180 1480,480 L1600,-80 Z"
            fill={theme.bgPolygons[1]}
            fillOpacity="0.28"
          />
          {/* Poligon Dasar Bawah */}
          <path
            d="M200,980 L880,720 L1580,950 L-100,1050 Z"
            fill={theme.bgPolygons[2]}
            fillOpacity="0.22"
          />
        </svg>

        {/* Gelembung-gelembung laut naik pelan */}
        <div className="absolute left-[15%] bottom-[10%] w-8 h-8 rounded-full bg-white/25 suar-bubble" style={{ animationDelay: "0s" }} />
        <div className="absolute left-[45%] bottom-[5%] w-5 h-5 rounded-full bg-white/20 suar-bubble" style={{ animationDelay: "2.5s" }} />
        <div className="absolute right-[18%] bottom-[12%] w-10 h-10 rounded-full bg-white/20 suar-bubble" style={{ animationDelay: "4.8s" }} />
      </div>

      {/* 
        B. JENDELA KREM MEMBULAT (Radius 32px, Maks 1120px):
        Bilah atas: Logo SUAR di kiri, link 'Kembali ke beranda' di kanan.
        Dua Kolom: KIRI = Form Interaktif; KANAN = Dua Kartu Karakter Bertumpuk & Chip.
      */}
      <div
        className={`w-full max-w-[1120px] ${theme.windowBg} rounded-[28px] sm:rounded-[34px] shadow-[0_28px_65px_-15px_rgba(0,0,0,0.38)] border border-amber-900/10 overflow-hidden relative z-10 flex flex-col`}
      >
        {/* Bilah Atas Jendela */}
        <header className="px-6 sm:px-10 py-5 flex items-center justify-between border-b border-black/5">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-85 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg"
          >
            <img src="/logo.png" alt="SUAR Logo" className="h-8 sm:h-9 w-auto object-contain" />
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 transition-colors p-2 rounded-xl hover:bg-black/5 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke beranda</span>
          </Link>
        </header>

        {/* Konten Jendela (Grid 2 Kolom di Desktop >= 1024px, 1 Kolom di Mobile) */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 p-5 sm:p-8 lg:p-12 items-center">
          {/* 
            KOLOM KIRI: Form Masuk / Daftar
          */}
          <div className="lg:col-span-7 flex flex-col justify-center max-w-xl mx-auto w-full">
            {/* Header Teks Playful */}
            <div className="mb-6 text-center sm:text-left">
              <h1 className="font-playful text-[clamp(2.15rem,4.5vw,3.6rem)] leading-[1.0] text-slate-900 tracking-tight">
                {activeTab === "signin" ? "Ayo berlayar!" : "Gabung SUAR!"}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
                {activeTab === "signin"
                  ? "Masuk ke akunmu untuk memesan kapal dan cek kondisi cuaca."
                  : "Daftar sekarang untuk mulai berpetualang di pesisir Cilacap."}
              </p>
            </div>

            {/* 
              KONTROL SWITCH MASUK / DAFTAR:
              Tinggi 52px, role="tablist", spring thumb, navigasi keyboard.
            */}
            <div
              role="tablist"
              aria-label="Mode Autentikasi"
              className="relative w-full h-[52px] bg-black/5 rounded-full p-1.5 flex items-center mb-6 select-none"
            >
              <button
                type="button"
                role="tab"
                id="tab-signin"
                aria-controls="panel-signin"
                aria-selected={activeTab === "signin"}
                onClick={() => switchTab("signin")}
                className={`relative z-10 flex-1 h-full rounded-full text-sm font-bold transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  activeTab === "signin" ? "text-slate-950" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Masuk
              </button>

              <button
                type="button"
                role="tab"
                id="tab-signup"
                aria-controls="panel-signup"
                aria-selected={activeTab === "signup"}
                onClick={() => switchTab("signup")}
                className={`relative z-10 flex-1 h-full rounded-full text-sm font-bold transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  activeTab === "signup" ? "text-slate-950" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Daftar
              </button>

              {/* Spring Animated Thumb */}
              <motion.div
                layoutId="auth-tab-thumb"
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="absolute top-1.5 bottom-1.5 rounded-full bg-white shadow-md border border-black/5"
                style={{
                  left: activeTab === "signin" ? "6px" : "calc(50% + 3px)",
                  width: "calc(50% - 9px)",
                }}
              />
            </div>

            {/* KONTEN FORM INTERAKTIF */}
            <AnimatePresence mode="wait">
              {activeTab === "signin" ? (
                /* --- FORM MASUK --- */
                <motion.form
                  key="form-signin"
                  id="panel-signin"
                  role="tabpanel"
                  aria-labelledby="tab-signin"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignIn}
                  className="space-y-4"
                >
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="signin-email"
                      className="block text-xs font-bold text-slate-700"
                    >
                      Email Akun
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        ref={emailInputRef}
                        id="signin-email"
                        name="signin-email"
                        type="email"
                        autoComplete="email"
                        placeholder="nama@email.com"
                        required
                        className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-slate-300/80 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="signin-password"
                      className="block text-xs font-bold text-slate-700"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        id="signin-password"
                        name="signin-password"
                        type={showSigninPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        required
                        className="w-full h-12 pl-12 pr-12 rounded-2xl bg-white border border-slate-300/80 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-2xs [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSigninPassword((v) => !v)}
                        aria-pressed={showSigninPassword}
                        aria-label={showSigninPassword ? "Sembunyikan password" : "Lihat password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg"
                      >
                        {showSigninPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Tombol Utama Masuk (Kuning Pil Tinggi 52px) */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full h-[52px] rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${theme.btnPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <>
                        <Waves className="h-5 w-5 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <span>Masuk</span>
                    )}
                  </button>

                  {/* Pemisah "atau" */}
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-300/70" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
                      <span className={`${theme.windowBg} px-3 text-slate-500`}>atau</span>
                    </div>
                  </div>

                  {/* Tombol Google Resmi (Pil Netral) */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleGoogleSignIn}
                    className="w-full h-[50px] rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold flex items-center justify-center gap-3 transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer disabled:opacity-50"
                  >
                    <img src={googleLogo} alt="" className="h-5 w-5" />
                    <span>{loading ? "Memproses..." : "Masuk dengan Google"}</span>
                  </button>
                </motion.form>
              ) : (
                /* --- FORM DAFTAR --- */
                <motion.form
                  key="form-signup"
                  id="panel-signup"
                  role="tabpanel"
                  aria-labelledby="tab-signup"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignUp}
                  className="space-y-4"
                >
                  {/* Pilihan Peran Pendaftaran */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Tipe Akun</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignupRole("tourist")}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                          signupRole === "tourist"
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <User className="h-4 w-4" />
                        <span>Wisatawan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSignupRole("operator")}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                          signupRole === "operator"
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Ship className="h-4 w-4" />
                        <span>Operator Kapal</span>
                      </button>
                    </div>
                  </div>

                  {/* Nama Lengkap */}
                  <div className="space-y-1.5">
                    <label htmlFor="full-name" className="block text-xs font-bold text-slate-700">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        ref={emailInputRef}
                        id="full-name"
                        name="full-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Contoh: Budi Santoso"
                        required
                        className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-slate-300/80 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Field Khusus Operator Kapal */}
                  {signupRole === "operator" && (
                    <div className="p-3.5 bg-black/5 rounded-2xl space-y-3 animate-in fade-in duration-200">
                      <div className="space-y-1">
                        <label htmlFor="company-name" className="block text-xs font-bold text-slate-700">
                          Nama Perusahaan / Usaha Kapal
                        </label>
                        <input
                          id="company-name"
                          name="company-name"
                          type="text"
                          placeholder="Contoh: CV Samudra Jaya"
                          required
                          className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="operator-phone" className="block text-xs font-bold text-slate-700">
                          Nomor Telepon / WhatsApp
                        </label>
                        <input
                          id="operator-phone"
                          name="operator-phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="081234567890"
                          required
                          className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="operator-address" className="block text-xs font-bold text-slate-700">
                          Alamat Usaha / Dermaga
                        </label>
                        <input
                          id="operator-address"
                          name="operator-address"
                          type="text"
                          placeholder="Contoh: Jl. Dermaga Pandanarang, Teluk Penyu"
                          className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label htmlFor="home-port" className="block text-xs font-bold text-slate-700">
                            Dermaga Utama
                          </label>
                          <select
                            id="home-port"
                            name="home-port"
                            defaultValue="Teluk Penyu"
                            className="w-full h-11 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                          >
                            <option value="Teluk Penyu">Teluk Penyu</option>
                            <option value="Tanjung Intan">Tanjung Intan</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="boat-count" className="block text-xs font-bold text-slate-700">
                            Jumlah Kapal
                          </label>
                          <input
                            id="boat-count"
                            name="boat-count"
                            type="number"
                            min={1}
                            max={50}
                            placeholder="Contoh: 3"
                            className="w-full h-11 px-3 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="ksop-certificate" className="block text-xs font-bold text-slate-700">
                          Nomor Sertifikat KSOP (opsional)
                        </label>
                        <input
                          id="ksop-certificate"
                          name="ksop-certificate"
                          type="text"
                          placeholder="Contoh: KSOP/CLP/2026/014"
                          className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="signup-email" className="block text-xs font-bold text-slate-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        id="signup-email"
                        name="signup-email"
                        type="email"
                        autoComplete="email"
                        placeholder="nama@email.com"
                        required
                        className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-slate-300/80 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Password + Pengukur Kekuatan 3 Segmen */}
                  <div className="space-y-1.5">
                    <label htmlFor="signup-password" className="block text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        id="signup-password"
                        name="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Minimal 6 karakter"
                        required
                        minLength={6}
                        value={signupPasswordVal}
                        onChange={(e) => setSignupPasswordVal(e.target.value)}
                        className="w-full h-12 pl-12 pr-12 rounded-2xl bg-white border border-slate-300/80 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-2xs [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword((v) => !v)}
                        aria-pressed={showSignupPassword}
                        aria-label={showSignupPassword ? "Sembunyikan password" : "Lihat password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg"
                      >
                        {showSignupPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* Pengukur Kekuatan Password (3 Segmen Visual) */}
                    {signupPasswordVal.length > 0 && (
                      <div className="pt-1.5 space-y-1">
                        <div className="flex gap-1.5 h-1.5 w-full">
                          <div
                            className={`flex-1 rounded-full transition-colors ${
                              passwordStrength >= 1 ? "bg-amber-500" : "bg-slate-200"
                            }`}
                          />
                          <div
                            className={`flex-1 rounded-full transition-colors ${
                              passwordStrength >= 2 ? "bg-yellow-500" : "bg-slate-200"
                            }`}
                          />
                          <div
                            className={`flex-1 rounded-full transition-colors ${
                              passwordStrength >= 3 ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 block text-right">
                          {passwordStrength === 1 && "Password cukup (min. 6 karakter)"}
                          {passwordStrength === 2 && "Password baik (kombinasi huruf & angka)"}
                          {passwordStrength >= 3 && "Password sangat kuat"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tombol Utama Daftar */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full h-[52px] rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${theme.btnPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <>
                        <Waves className="h-5 w-5 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <span>Daftar Sekarang</span>
                    )}
                  </button>

                  {/* Pemisah "atau" */}
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-300/70" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
                      <span className={`${theme.windowBg} px-3 text-slate-500`}>atau</span>
                    </div>
                  </div>

                  {/* Tombol Google Daftar */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleGoogleSignIn}
                    className="w-full h-[50px] rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold flex items-center justify-center gap-3 transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer disabled:opacity-50"
                  >
                    <img src={googleLogo} alt="" className="h-5 w-5" />
                    <span>{loading ? "Memproses..." : "Daftar dengan Google"}</span>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Baris Kepercayaan Maritim (Trust Badges) */}
            <div className="mt-6 pt-4 border-t border-black/5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <CloudSun className="h-4 w-4 text-sky-600" />
                <span>Cuaca resmi BMKG</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <span>Nakhoda berlisensi KSOP</span>
              </span>
            </div>
          </div>

          {/* 
            KOLOM KANAN: Dua Kartu Karakter Bertumpuk & Gelembung Dialog (Desktop >= 1024px)
          */}
          <div className="lg:col-span-5 hidden lg:flex flex-col gap-5 p-6 rounded-[30px] bg-black/[0.03] border border-black/5 relative select-none">
            {/* KARTU 1 (Atas): Si Suar Panduan */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              className={`p-5 rounded-[24px] ${theme.cardTopBg} border ${theme.cardTopBorder} shadow-sm relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/70 text-slate-800 border border-black/5 flex items-center gap-1.5 shadow-2xs">
                  <Compass className="w-3.5 h-3.5 text-teal-600" />
                  <span>Teman Berlayar</span>
                </span>
              </div>

              {/* Gelembung Percakapan Pop */}
              <div className="relative bg-white rounded-2xl p-3.5 shadow-sm border border-black/5 mb-3">
                <p className={`text-xs font-bold leading-relaxed ${theme.cardTopBubbleText}`}>
                  {activeTab === "signin"
                    ? "Halo kawan! Ombak Teluk Penyu sedang bersahabat hari ini."
                    : "Selamat datang! Yuk gabung bersama kami di Pesisir Cilacap."}
                </p>
                {/* Ekor Balon Dialog */}
                <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white rotate-45 border-r border-b border-black/5" />
              </div>

              {/* Maskot Si Suar Ceria */}
              <div className="flex justify-center pt-1">
                <Mascot mood={mascotMood} size={110} animate={true} />
              </div>
            </motion.div>

            {/* KARTU 2 (Bawah): Si Suar Respon / Interaksi */}
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
              className={`p-5 rounded-[24px] ${theme.cardBottomBg} text-white border ${theme.cardBottomBorder} shadow-sm relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/20 flex items-center gap-1.5 shadow-2xs">
                  <Anchor className="w-3.5 h-3.5 text-white" />
                  <span>Siap Melaut</span>
                </span>
              </div>

              {/* Gelembung Respon */}
              <div className="relative bg-white rounded-2xl p-3.5 shadow-sm border border-black/5 mb-3">
                <p className={`text-xs font-bold leading-relaxed ${theme.cardBottomBubbleText}`}>
                  {activeTab === "signin"
                    ? "Siap! Mau cek armada kapal yang lulus uji KSOP."
                    : "Asyik! Bisa booking perahu & tanya Juru Mudi AI."}
                </p>
                <div className="absolute -bottom-2 left-10 w-4 h-4 bg-white rotate-45 border-r border-b border-black/5" />
              </div>

              {/* Maskot Respon */}
              <div className="flex justify-center pt-1">
                <Mascot mood={activeTab === "signin" ? "wave" : "happy"} size={105} animate={true} />
              </div>
            </motion.div>

            {/* Deretan 4 Chip Kecil Dekoratif di Bawah Kartu */}
            <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/80 border border-slate-200 text-slate-800 shadow-2xs flex items-center gap-1">
                <CloudSun className="w-3 h-3 text-sky-600" />
                <span>Cek Cuaca</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/80 border border-slate-200 text-slate-800 shadow-2xs flex items-center gap-1">
                <Ship className="w-3 h-3 text-teal-600" />
                <span>Pesan Kapal</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/80 border border-slate-200 text-slate-800 shadow-2xs flex items-center gap-1">
                <BotMessageSquare className="w-3 h-3 text-amber-600" />
                <span>Tanya Juru Mudi</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/80 border border-slate-200 text-slate-800 shadow-2xs flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Aman Berlayar</span>
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Auth;

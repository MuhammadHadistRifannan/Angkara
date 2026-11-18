import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/lib/auth";
import { getDashboardRedirectPath } from "@/lib/authRoles";
import { toast } from "sonner";
import googleLogo from "@/assets/google.svg";
import { Ship, User } from "lucide-react";

// ============================================================================
// AuthModal — popup login/daftar di atas landing page.
// ----------------------------------------------------------------------------
// Dipakai dari section chat (Tanya Juru Mudi AI / AskBeforeSailing) dan Hero:
// kalau pengunjung belum login lalu mau bertanya, modal ini yang muncul —
// latar landing jadi gelap, dan setelah login berhasil pengguna TETAP di
// landing (tidak pindah ke /auth atau /dashboard). Chat-nya sendiri dibuka
// oleh AssistantWidget (popup mengambang) lewat event "open-assistant".
//
// Catatan: login Google tetap meninggalkan landing sesaat, karena OAuth
// Supabase harus redirect ke /dashboard. Prompt yang tersimpan di
// sessionStorage ("pending_assistant_prompt") akan dibaca AssistantWidget
// di dashboard, jadi pertanyaan tidak hilang.
// ============================================================================

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Dipanggil setelah login email/password berhasil (di landing). */
  onSuccess?: () => void;
  /** Tab awal saat modal dibuka (dipakai Navbar: Masuk -> signin, Daftar -> signup). */
  initialTab?: "signin" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, onSuccess, initialTab = "signin" }) => {
  const [tab, setTab] = useState<"signin" | "signup">(initialTab);

  // Ikuti tab yang diminta saat modal dibuka kembali.
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);
  const [signupRole, setSignupRole] = useState<"tourist" | "operator">("tourist");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kunci scroll body + tutup dengan ESC selama modal terbuka.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("signin-email") as string;
    const password = formData.get("signin-password") as string;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.user) {
      toast.success("Login berhasil!");
      // Sengaja TIDAK navigate ke dashboard — tetap di landing.
      await getDashboardRedirectPath(data.user).catch(() => undefined);
      onSuccess?.();
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
          phone,
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
      setError(error.message);
      return;
    }
    toast.success(
      isOperator
        ? "Akun operator berhasil dibuat! Silakan masuk untuk mengelola armada kapal Anda."
        : "Akun berhasil dibuat! Silakan login."
    );
    setTab("signin");
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) setError(error.message);
    // Kalau berhasil, browser redirect ke Google lalu ke /dashboard.
    // Prompt tersimpan di sessionStorage, jadi tidak hilang.
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Masuk atau daftar SUAR"
    >
      <div
        className={`relative w-full max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-7 shadow-2xl transition-all duration-300 ${tab === "signup" && signupRole === "operator" ? "max-w-2xl" : "max-w-md"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 text-center">
          <img src="/logo.png" alt="SUAR" className="mx-auto mb-3 h-9 w-auto object-contain" />
          <h2 className="text-xl font-black tracking-tight text-slate-900">Platform SUAR</h2>
          <p className="mt-1 text-sm text-slate-500">Berlayar Aman, Berdaya Bersama di Pesisir Cilacap</p>
          <p className="mt-2 text-xs text-slate-500">
            Masuk dulu untuk bertanya ke Juru Mudi AI — kamu tetap di halaman ini setelah login.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${tab === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${tab === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            Daftar
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 border border-rose-100">{error}</p>
        )}

        {tab === "signin" ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modal-signin-email">Email</Label>
              <Input id="modal-signin-email" name="signin-email" type="email" placeholder="nama@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-signin-password">Password</Label>
              <Input id="modal-signin-password" name="signin-password" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">atau</span>
              </div>
            </div>
            <Button type="button" variant="outline" className="w-full flex items-center justify-center gap-2" disabled={loading} onClick={handleGoogle}>
              <img src={googleLogo} alt="" className="h-4 w-4" />
              <span>{loading ? "Memproses..." : "Masuk dengan Google"}</span>
            </Button>
            <p className="text-center text-[11px] text-slate-400">
              Login Google akan membawamu ke dashboard sebentar, pertanyaanmu tetap tersimpan.
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">Tipe Akun Pendaftaran</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSignupRole("tourist")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${signupRole === "tourist" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"}`}
                >
                  <User className="h-4 w-4" /> Wisatawan
                </button>
                <button
                  type="button"
                  onClick={() => setSignupRole("operator")}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${signupRole === "operator" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"}`}
                >
                  <Ship className="h-4 w-4" /> Operator Kapal
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-full-name">Nama Lengkap</Label>
              <Input id="modal-full-name" name="full-name" type="text" placeholder="John Doe" required />
            </div>
            {signupRole === "operator" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="modal-company-name">Nama Perusahaan / Usaha Kapal</Label>
                  <Input id="modal-company-name" name="company-name" type="text" placeholder="Contoh: CV Samudra Jaya" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-operator-phone">Nomor Telepon / WhatsApp</Label>
                  <Input id="modal-operator-phone" name="operator-phone" type="tel" placeholder="081234567890" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="modal-operator-address">Alamat Usaha / Dermaga</Label>
                  <Input id="modal-operator-address" name="operator-address" type="text" placeholder="Contoh: Jl. Dermaga Pandanarang, Teluk Penyu, Cilacap" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-ksop-certificate">Nomor Sertifikat KSOP (opsional)</Label>
                  <Input id="modal-ksop-certificate" name="ksop-certificate" type="text" placeholder="Contoh: KSOP/CLP/2026/014" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-home-port">Dermaga Utama</Label>
                  <select
                    id="modal-home-port"
                    name="home-port"
                    defaultValue="Teluk Penyu"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="Teluk Penyu">Teluk Penyu (Dermaga Pandanarang)</option>
                    <option value="Tanjung Intan">Pelabuhan Tanjung Intan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-boat-count">Jumlah Kapal yang Dioperasikan</Label>
                  <Input id="modal-boat-count" name="boat-count" type="number" min={1} max={50} placeholder="Contoh: 3" />
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400 md:col-span-2">
                  Data ini dipakai untuk profil operator dan verifikasi armada. Nomor sertifikat KSOP
                  dan alamat usaha tersimpan di profil operator; dermaga dan jumlah kapal tersimpan
                  di data akun.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="modal-signup-email">Email</Label>
              <Input id="modal-signup-email" name="signup-email" type="email" placeholder="nama@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-signup-password">Password</Label>
              <Input id="modal-signup-password" name="signup-password" type="password" placeholder="••••••••" required minLength={6} />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

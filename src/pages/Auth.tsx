import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { signInWithGoogle } from "@/lib/auth";
import { getDashboardRedirectPath } from "@/lib/authRoles";
import googleLogo from "@/assets/google.svg";
import { Ship, User } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signupRole, setSignupRole] = useState<"tourist" | "operator">("tourist");

  // Jika pengguna sudah memiliki sesi login aktif, arahkan langsung ke dashboard sesuai perannya
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const targetPath = await getDashboardRedirectPath(session.user);
        navigate(targetPath, { replace: true });
      }
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;
    const fullName = formData.get("full-name") as string;
    const companyName = (formData.get("company-name") as string) || fullName;
    const phone = (formData.get("operator-phone") as string) || "-";

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
        },
      },
    });

    // Jika akun operator berhasil dibuat dan session langsung aktif, masukkan ke tabel operators
    if (!error && isOperator && authData.user) {
      try {
        await supabase.from("operators").insert({
          user_id: authData.user.id,
          company_name: companyName,
          email: email.trim().toLowerCase(),
          phone: phone,
          verified: true,
        });
      } catch (opErr) {
        console.warn("Operator auto-insert info:", opErr);
      }
    }

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        isOperator
          ? "Akun operator berhasil dibuat! Silakan masuk untuk mengelola armada kapal Anda."
          : "Akun berhasil dibuat! Silakan login."
      );
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("signin-email") as string;
    const password = formData.get("signin-password") as string;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      toast.success("Login berhasil!");
      const targetPath = await getDashboardRedirectPath(data.user);
      navigate(targetPath);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
    // Jika tidak error, Supabase akan mengarahkan browser ke alur login Google lalu ke dashboard
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="SUAR Logo" className="h-9 w-auto object-contain" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-slate-900">Platform SUAR</CardTitle>
          <CardDescription>Berlayar Aman, Berdaya Bersama di Pesisir Cilacap</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="signin-email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="signin-password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading ? "Memproses..." : "Masuk"}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">atau</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                >
                  <img src={googleLogo} alt="" className="h-4 w-4" />
                  <span>{loading ? "Memproses..." : "Masuk dengan Google"}</span>
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Pilihan Peran Pendaftaran */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700">Tipe Akun Pendaftaran</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSignupRole("tourist")}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
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
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
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

                <div className="space-y-2">
                  <Label htmlFor="full-name">Nama Lengkap</Label>
                  <Input
                    id="full-name"
                    name="full-name"
                    type="text"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {signupRole === "operator" && (
                  <>
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <Label htmlFor="company-name">Nama Perusahaan / Usaha Kapal</Label>
                      <Input
                        id="company-name"
                        name="company-name"
                        type="text"
                        placeholder="Contoh: CV Samudra Jaya"
                        required
                      />
                    </div>
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <Label htmlFor="operator-phone">Nomor Telepon / WhatsApp</Label>
                      <Input
                        id="operator-phone"
                        name="operator-phone"
                        type="tel"
                        placeholder="081234567890"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="signup-email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="signup-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading ? "Memproses..." : "Daftar Sekarang"}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">atau</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                >
                  <img src={googleLogo} alt="" className="h-4 w-4" />
                  <span>{loading ? "Memproses..." : "Daftar dengan Google"}</span>
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

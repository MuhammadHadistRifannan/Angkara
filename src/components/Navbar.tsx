import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { checkIsOperator } from "@/lib/authRoles";
import logoSuar from "@/assets/LOGO SUAR WHITE-01.png";
import { AuthModal } from "@/components/AuthModal";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isOperator, setIsOperator] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("beranda");
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await supabase.auth.signOut();
    navigate("/");
  };

  useEffect(() => {
    const updateUserRole = async (currentUser: User | null) => {
      setUser(currentUser);
      if (currentUser) {
        const isOp = await checkIsOperator(
          currentUser.id,
          currentUser.email,
          currentUser.user_metadata
        );
        setIsOperator(isOp);
      } else {
        setIsOperator(false);
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      updateUserRole(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      updateUserRole(session?.user ?? null);
      if (event === "SIGNED_OUT") {
        navigate("/");
      }
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      if (location.pathname === "/" && window.scrollY < 300) {
        setActiveId("beranda");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Scroll-spy: section yang sedang terlihat di tengah layar jadi aktif.
    const sectionIds = ["features", "how-it-works", "weather-map-section", "pilihan-paket-tour"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Halaman terpisah: link yang cocok dengan URL jadi aktif.
    if (location.pathname === "/permit-info") setActiveId("permit-info");

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [navigate, location.pathname]);

  const goToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setActiveId(id);
    setIsMenuOpen(false);
    if (id === "beranda") {
      if (!isLandingPage) navigate("/");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!isLandingPage) {
      navigate(`/#${id}`);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Gaya link: aktif = teks cyan + garis bawah; biasa = abu-abu, hover cyan.
  const linkClass = (id: string) =>
    `relative px-1 py-1.5 text-sm font-medium transition-colors ${
      activeId === id
        ? "text-cyan-300 after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-cyan-400"
        : "text-slate-200/90 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
    }`;

  const dashboardPath = isOperator ? "/operator-dashboard" : "/dashboard";
  const dashboardLabel = isOperator ? "Dashboard Operator" : "Dashboard";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        !isLandingPage
          ? "bg-[#090D16] border-b border-white/10 shadow-xl shadow-black/20"
          : isScrolled
          ? "bg-[#090D16]/85 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/20"
          : "bg-[#090D16]/40 backdrop-blur-md border-b border-white/5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group py-1"
            onClick={() => navigate("/")}
          >
            <img
              src={logoSuar}
              alt="SUAR - Berlayar Aman, Berdaya Bersama"
              className="h-16 sm:h-18 w-auto object-contain group-hover:scale-105 transition-transform filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]"
            />
          </div>

          {/* Desktop Navigation — Beranda ditambahkan di paling kiri */}
          <div className="hidden md:flex items-center gap-7">
            <a href="/" onClick={(e) => goToSection(e, "beranda")} className={linkClass("beranda")}>
              Beranda
            </a>
            <a href="/#features" onClick={(e) => goToSection(e, "features")} className={linkClass("features")}>
              Fitur
            </a>
            <a href="/#how-it-works" onClick={(e) => goToSection(e, "how-it-works")} className={linkClass("how-it-works")}>
              Cara Kerja
            </a>
            <a
              href="/#weather-map-section"
              onClick={(e) => goToSection(e, "weather-map-section")}
              className={`${linkClass("weather-map-section")} flex items-center gap-1.5`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Peta Cuaca</span>
            </a>
            {/* Paket Tour mengarah ke section di landing (bukan /tour-packages
                yang masih "Gagal memuat paket tour") */}
            <a
              href="/#pilihan-paket-tour"
              onClick={(e) => goToSection(e, "pilihan-paket-tour")}
              className={linkClass("pilihan-paket-tour")}
            >
              Paket Tour
            </a>
            <a href="/permit-info" className={linkClass("permit-info")}>
              Perizinan
            </a>
          </div>

          {/* Desktop Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(dashboardPath)}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-cyan-200 rounded-xl text-sm font-semibold transition-all"
                >
                  {dashboardLabel}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20 rounded-xl text-sm font-semibold transition-all"
                >
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("signin");
                    setAuthOpen(true);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 rounded-xl shadow-sm hover:shadow-cyan-500/20 transition-all duration-200"
                >
                  Masuk
                </button>

                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => {
                    setAuthTab("signup");
                    setAuthOpen(true);
                  }}
                  className="px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.03] transition-all duration-200"
                >
                  Daftar
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-cyan-300 hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-5 px-4 mt-2 rounded-2xl bg-[#090D16]/95 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-3">
              <a href="/" onClick={(e) => goToSection(e, "beranda")} className={linkClass("beranda")}>
                Beranda
              </a>
              <a href="/#features" onClick={(e) => goToSection(e, "features")} className={linkClass("features")}>
                Fitur
              </a>
              <a href="/#how-it-works" onClick={(e) => goToSection(e, "how-it-works")} className={linkClass("how-it-works")}>
                Cara Kerja
              </a>
              <a
                href="/#weather-map-section"
                onClick={(e) => goToSection(e, "weather-map-section")}
                className={`${linkClass("weather-map-section")} flex items-center gap-2`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Peta Cuaca Maritim</span>
              </a>
              <a
                href="/#pilihan-paket-tour"
                onClick={(e) => goToSection(e, "pilihan-paket-tour")}
                className={linkClass("pilihan-paket-tour")}
              >
                Paket Tour
              </a>
              <a href="/permit-info" onClick={() => setIsMenuOpen(false)} className={linkClass("permit-info")}>
                Perizinan
              </a>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              {user ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate(dashboardPath);
                    }}
                  >
                    {dashboardLabel}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20 rounded-xl"
                    onClick={handleLogout}
                  >
                    Keluar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full bg-cyan-500/10 text-cyan-300 border-cyan-400/40 hover:bg-cyan-500/20 rounded-xl font-semibold"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setAuthTab("signin");
                      setAuthOpen(true);
                    }}
                  >
                    Masuk
                  </Button>
                  <Button
                    variant="hero"
                    className="w-full rounded-xl font-semibold shadow-lg"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setAuthTab("signup");
                      setAuthOpen(true);
                    }}
                  >
                    Daftar Sekarang
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <AuthModal
        open={authOpen}
        initialTab={authTab}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => setAuthOpen(false)}
      />
    </nav>
  );
};

export default Navbar;

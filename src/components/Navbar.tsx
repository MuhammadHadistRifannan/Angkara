import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  const [guideOpen, setGuideOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isOperator, setIsOperator] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("beranda");
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const guideRef = useRef<HTMLDivElement>(null);
  const isNavigatingRef = useRef(false);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guideRef.current && !guideRef.current.contains(event.target as Node)) {
        setGuideOpen(false);
      }
    };
    if (guideOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [guideOpen]);

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
      if (isNavigatingRef.current) return;
      if (location.pathname === "/" && window.scrollY < 200 && (!location.hash || location.hash === "#beranda")) {
        setActiveId("beranda");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Scroll-spy: section yang sedang terlihat di tengah layar jadi aktif.
    const sectionIds = ["how-it-works", "weather-map-section", "pilihan-paket-tour"];
    const observer = new IntersectionObserver(
      (entries) => {
        if (isNavigatingRef.current) return;
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

    // Inisialisasi activeId berdasarkan hash jika berada di landing page
    if (location.pathname === "/" && location.hash) {
      const hashId = location.hash.replace(/^#/, "");
      if (hashId) setActiveId(hashId);
    }

    // Halaman terpisah: link yang cocok dengan URL jadi aktif.
    if (location.pathname === "/permit-info") setActiveId("permit-info");
    if (location.pathname.startsWith("/boats")) setActiveId("boats");
    if (location.pathname.startsWith("/tour-packages")) setActiveId("tour-packages");

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [navigate, location.pathname, location.hash]);

  const goToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setActiveId(id);
    setIsMenuOpen(false);
    setGuideOpen(false);
    isNavigatingRef.current = true;
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1200);

    if (id === "beranda") {
      if (!isLandingPage) {
        navigate("/");
      } else {
        window.history.pushState(null, "", "/");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }
    if (!isLandingPage) {
      navigate(`/#${id}`);
      return;
    }
    window.history.pushState(null, "", `/#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenJuruMudi = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setGuideOpen(false);
    if (!user) {
      setAuthTab("signin");
      setAuthOpen(true);
      return;
    }
    window.dispatchEvent(
      new CustomEvent("open-assistant", {
        detail: {
          prompt: "Halo Juru Mudi, bantu saya cek rekomendasi pelayaran ke Nusakambangan",
        },
      })
    );
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

          {/* Desktop Navigation — Opsi A: 6 Menu Seragam */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/" onClick={(e) => goToSection(e, "beranda")} className={linkClass("beranda")}>
              Beranda
            </a>
            <a
              href="/boats"
              onClick={(e) => {
                e.preventDefault();
                setActiveId("boats");
                navigate("/boats");
              }}
              className={linkClass("boats")}
            >
              Armada Kapal
            </a>
            <a
              href="/tour-packages"
              onClick={(e) => {
                e.preventDefault();
                setActiveId("tour-packages");
                navigate("/tour-packages");
              }}
              className={linkClass("tour-packages")}
            >
              Paket Tour
            </a>
            <a
              href="/#weather-map-section"
              onClick={(e) => goToSection(e, "weather-map-section")}
              className={`${linkClass("weather-map-section")} flex items-center gap-1.5`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cuaca & Peta</span>
            </a>
            <button
              type="button"
              onClick={handleOpenJuruMudi}
              className={`${linkClass("juru-mudi")} flex items-center gap-1.5 cursor-pointer`}
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Juru Mudi</span>
            </button>

            {/* Dropdown Panduan (Cara Kerja & Perizinan) */}
            <div
              ref={guideRef}
              className="relative"
              onMouseEnter={() => setGuideOpen(true)}
              onMouseLeave={() => setGuideOpen(false)}
            >
              <button
                type="button"
                onClick={() => setGuideOpen((prev) => !prev)}
                className={`${linkClass("panduan")} flex items-center gap-1 cursor-pointer`}
                aria-expanded={guideOpen}
              >
                <span>Panduan</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    guideOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {guideOpen && (
                <div className="absolute top-full left-0 pt-2 w-48 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="rounded-xl bg-[#090D16]/95 backdrop-blur-xl border border-white/15 p-2 shadow-2xl space-y-1">
                    <a
                      href="/#how-it-works"
                      onClick={(e) => goToSection(e, "how-it-works")}
                      className="block px-3 py-2 text-xs font-medium text-slate-200 hover:text-cyan-300 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Cara Kerja Platform
                    </a>
                    <a
                      href="/permit-info"
                      onClick={(e) => {
                        e.preventDefault();
                        setGuideOpen(false);
                        setActiveId("permit-info");
                        navigate("/permit-info");
                      }}
                      className="block px-3 py-2 text-xs font-medium text-slate-200 hover:text-cyan-300 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Perizinan KSOP
                    </a>
                  </div>
                </div>
              )}
            </div>
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
              <a
                href="/boats"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveId("boats");
                  setIsMenuOpen(false);
                  navigate("/boats");
                }}
                className={linkClass("boats")}
              >
                Armada Kapal
              </a>
              <a
                href="/tour-packages"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveId("tour-packages");
                  setIsMenuOpen(false);
                  navigate("/tour-packages");
                }}
                className={linkClass("tour-packages")}
              >
                Paket Tour
              </a>
              <a
                href="/#weather-map-section"
                onClick={(e) => goToSection(e, "weather-map-section")}
                className={`${linkClass("weather-map-section")} flex items-center gap-2`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Cuaca & Peta</span>
              </a>
              <button
                type="button"
                onClick={handleOpenJuruMudi}
                className="text-left text-slate-200 hover:text-cyan-300 font-medium py-1 transition-colors flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Juru Mudi AI</span>
              </button>

              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Panduan
                </span>
                <div className="flex flex-col gap-2 pl-2">
                  <a
                    href="/#how-it-works"
                    onClick={(e) => goToSection(e, "how-it-works")}
                    className={linkClass("how-it-works")}
                  >
                    Cara Kerja Platform
                  </a>
                  <a
                    href="/permit-info"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMenuOpen(false);
                      setActiveId("permit-info");
                      navigate("/permit-info");
                    }}
                    className={linkClass("permit-info")}
                  >
                    Perizinan KSOP
                  </a>
                </div>
              </div>
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

import { Button } from "@/components/ui/button";
import { Menu, X, Anchor } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#090D16]/85 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/20"
          : "bg-[#090D16]/40 backdrop-blur-md border-b border-white/5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 border border-cyan-400/30 group-hover:border-cyan-400/60 transition-colors shadow-sm">
              <Anchor className="h-6 w-6 text-cyan-300 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black bg-gradient-to-r from-cyan-300 via-sky-200 to-accent bg-clip-text text-transparent tracking-tight">
                Angkara
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Bahari Cilacap
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7">
            <a
              href="/#features"
              className="text-sm font-medium text-slate-200/90 hover:text-cyan-300 transition-colors hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
            >
              Fitur
            </a>
            <a
              href="/#how-it-works"
              className="text-sm font-medium text-slate-200/90 hover:text-cyan-300 transition-colors hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
            >
              Cara Kerja
            </a>
            <a
              href="/#weather-map-section"
              className="text-sm font-medium text-slate-200/90 hover:text-cyan-300 transition-colors hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] flex items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Peta Cuaca</span>
            </a>
            <a
              href="/tour-packages"
              className="text-sm font-medium text-slate-200/90 hover:text-cyan-300 transition-colors hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
            >
              Paket Tour
            </a>
            <a
              href="/permit-info"
              className="text-sm font-medium text-slate-200/90 hover:text-cyan-300 transition-colors hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
            >
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
                  onClick={() => navigate("/dashboard")}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-cyan-200 rounded-xl text-sm font-semibold transition-all"
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => supabase.auth.signOut()}
                  className="bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20 rounded-xl text-sm font-semibold transition-all"
                >
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="px-4 py-2 text-sm font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 rounded-xl shadow-sm hover:shadow-cyan-500/20 transition-all duration-200"
                >
                  Masuk
                </button>

                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => navigate("/auth")}
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
              <a
                href="/#features"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-200 hover:text-cyan-300 font-medium py-1 transition-colors"
              >
                Fitur
              </a>
              <a
                href="/#how-it-works"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-200 hover:text-cyan-300 font-medium py-1 transition-colors"
              >
                Cara Kerja
              </a>
              <a
                href="/#weather-map-section"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-200 hover:text-cyan-300 font-medium py-1 transition-colors flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Peta Cuaca Maritim</span>
              </a>
              <a
                href="/tour-packages"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-200 hover:text-cyan-300 font-medium py-1 transition-colors"
              >
                Paket Tour
              </a>
              <a
                href="/permit-info"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-200 hover:text-cyan-300 font-medium py-1 transition-colors"
              >
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
                      navigate("/dashboard");
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20 rounded-xl"
                    onClick={() => {
                      setIsMenuOpen(false);
                      supabase.auth.signOut();
                    }}
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
                      navigate("/auth");
                    }}
                  >
                    Masuk
                  </Button>
                  <Button
                    variant="hero"
                    className="w-full rounded-xl font-semibold shadow-lg"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/auth");
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
    </nav>
  );
};

export default Navbar;

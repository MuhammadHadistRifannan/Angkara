import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Ship, CloudSun, Bot, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface LiquidNavProps {
  show: boolean;
  isReducedMotion: boolean;
  isInHero?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  isActive: boolean;
}

// Flag modul tunggal agar animasi masuk hanya diputar satu kali per kunjungan halaman
let globalHasEverEnteredNav = false;

export const LiquidNav: React.FC<LiquidNavProps> = ({
  show,
  isReducedMotion,
  isInHero = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [user, setUser] = useState<unknown>(null);

  const navGroupRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [highlightStyle, setHighlightStyle] = useState<{ x: number; width: number; ready: boolean }>({
    x: 0,
    width: 0,
    ready: false,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Beranda",
      icon: Home,
      action: () => {
        if (location.pathname === "/") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          navigate("/");
        }
      },
      isActive: location.pathname === "/" && (typeof window !== "undefined" ? window.scrollY < window.innerHeight * 1.5 : true),
    },
    {
      id: "boats",
      label: "Armada Kapal",
      icon: Ship,
      action: () => navigate("/boats"),
      isActive: location.pathname.startsWith("/boats"),
    },
    {
      id: "weather",
      label: "Cuaca & Peta",
      icon: CloudSun,
      action: () => {
        const mapEl = document.getElementById("weather-map-section");
        if (mapEl) {
          mapEl.scrollIntoView({ behavior: "smooth" });
        } else if (location.pathname !== "/") {
          navigate("/#weather-map");
        } else {
          window.scrollTo({ top: window.innerHeight * 2.8, behavior: "smooth" });
        }
      },
      isActive: false,
    },
    {
      id: "juru-mudi",
      label: "Juru Mudi",
      icon: Bot,
      action: () => {
        window.dispatchEvent(
          new CustomEvent("open-assistant", {
            detail: {
              prompt: "Halo Juru Mudi, bantu saya cek rekomendasi pelayaran ke Nusakambangan",
            },
          })
        );
      },
      isActive: false,
    },
    {
      id: "auth",
      label: user ? "Dashboard" : "Masuk / Akun",
      icon: User,
      action: () => {
        if (user) {
          navigate("/dashboard");
        } else {
          navigate("/auth");
        }
      },
      isActive: location.pathname === "/auth" || location.pathname === "/dashboard",
    },
  ];

  const activeItem = navItems.find((item) => item.isActive) || navItems[0];
  const currentHighlightedId = hoveredId || activeItem.id;

  // Ukur posisi tab aktif secara presisi menggunakan getBoundingClientRect relatif terhadap kelompok nav menu
  const updateHighlightPosition = useCallback(() => {
    const btn = buttonRefs.current.get(currentHighlightedId);
    const navGroup = navGroupRef.current;
    if (!btn || !navGroup) return;

    const btnRect = btn.getBoundingClientRect();
    const navGroupRect = navGroup.getBoundingClientRect();

    if (btnRect.width > 0 && navGroupRect.width > 0) {
      setHighlightStyle({
        x: btnRect.left - navGroupRect.left,
        width: btnRect.width,
        ready: true,
      });
    }
  }, [currentHighlightedId]);

  // Pantau perubahan ukuran layar (ResizeObserver) agar kapsul selalu tepat menempel
  useEffect(() => {
    if (!show) return;

    const timer = setTimeout(() => {
      updateHighlightPosition();
    }, 20);

    const navGroup = navGroupRef.current;
    if (!navGroup) return () => clearTimeout(timer);

    const ro = new ResizeObserver(() => {
      updateHighlightPosition();
    });

    ro.observe(navGroup);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [show, updateHighlightPosition]);

  // Tandai bahwa animasi masuk pertama kali sudah selesai
  useEffect(() => {
    if (show) {
      globalHasEverEnteredNav = true;
    }
  }, [show]);

  // Animasi ekspansi: hanya bouncy jika baru pertama kali muncul
  const shouldPlayEntrance = !globalHasEverEnteredNav && !isReducedMotion;

  const navContainerVariants = {
    hidden: isReducedMotion
      ? { opacity: 0 }
      : shouldPlayEntrance
      ? { opacity: 0, y: 30, scaleX: 0.85, scaleY: 0.85 }
      : { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transition: isReducedMotion
        ? { duration: 0 }
        : shouldPlayEntrance
        ? {
            type: "spring" as const,
            stiffness: 280,
            damping: 22,
            mass: 0.8,
          }
        : {
            duration: 0.25,
            ease: "easeOut",
          },
    },
    exit: isReducedMotion
      ? { opacity: 0, transition: { duration: 0.15 } }
      : {
          opacity: [1, 1, 0],
          y: [0, 6, -30],
          scaleX: [1, 1.02, 0.8],
          scaleY: [1, 1.02, 0.8],
          transition: {
            duration: 0.3,
            ease: "easeInOut",
          },
        },
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.nav
          variants={navContainerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="navigation"
          aria-label="Navigasi Utama Angkara"
          className="fixed top-5 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-auto origin-center"
        >
          {/* Pill Kaca Translucent Frosted Glass (Unified Floating Glass Bar) */}
          <div
            ref={containerRef}
            onMouseLeave={() => setHoveredId(null)}
            className={`relative flex items-center justify-between p-1.5 sm:p-2 rounded-full w-full max-w-[840px] md:max-w-[940px] lg:max-w-[980px] transition-all duration-300 select-none ${
              isInHero
                ? "bg-white/25 backdrop-blur-3xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.22),inset_0_1.5px_1.5px_rgba(255,255,255,0.85),inset_0_-1px_1px_rgba(0,0,0,0.08)]"
                : "bg-white/80 backdrop-blur-3xl border border-white/80 shadow-[0_18px_45px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04),inset_0_1.5px_2px_rgba(255,255,255,1),inset_0_-1px_1px_rgba(0,0,0,0.04)]"
            }`}
            style={{
              backdropFilter: "blur(32px) saturate(190%) contrast(95%)",
              WebkitBackdropFilter: "blur(32px) saturate(190%) contrast(95%)",
            }}
          >
            {/* Pantulan kilau cahaya diagonal & specular edge atas */}
            <div
              className={`absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300 ${
                isInHero
                  ? "bg-gradient-to-b from-white/30 via-white/5 to-white/10"
                  : "bg-gradient-to-b from-white/40 via-transparent to-black/[0.02]"
              }`}
            />
            <div className="absolute inset-x-10 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/95 to-transparent pointer-events-none" />

            {/* Brand Anchor (Logo & Nama) Terintegrasi di Sisi Kiri Pill */}
            <button
              type="button"
              onClick={() => {
                if (location.pathname === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  navigate("/");
                }
              }}
              aria-label="Kembali ke Beranda Angkara"
              className={`relative z-10 flex items-center gap-2 pl-3 sm:pl-4 pr-3 py-1.5 sm:py-2 rounded-full transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 min-h-[46px] sm:min-h-[52px] select-none group ${
                isInHero ? "hover:bg-white/10" : "hover:bg-black/5"
              }`}
            >
              <img
                src="/logo.png"
                alt="Logo Angkara"
                className={`h-6 w-6 sm:h-7 sm:w-7 object-contain transition-all duration-300 group-hover:scale-105 ${
                  isInHero
                    ? "brightness-0 invert drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                    : "brightness-100 invert-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                }`}
              />
              <span
                className={`hidden sm:inline text-[13.5px] sm:text-[15px] font-bold tracking-tight font-display transition-colors duration-300 ${
                  isInHero
                    ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
                    : "text-slate-900 drop-shadow-none"
                }`}
              >
                Angkara
              </span>
            </button>

            {/* Garis Pemisah Halus antara Brand & Navigasi */}
            <div
              className={`h-6 w-[1px] my-auto transition-colors duration-300 ${
                isInHero ? "bg-white/35" : "bg-slate-300/80"
              } mx-1`}
            />

            {/* Kelompok Menu Navigasi Utama */}
            <div ref={navGroupRef} className="relative flex-1 flex items-center justify-between min-w-0">
              {/* Highlight Kapsul Terukur (Measured Highlight, Tanpa layoutId detached bug N1) */}
              <div
                aria-hidden="true"
                className={`absolute top-0 bottom-0 rounded-full pointer-events-none transition-all ease-out z-0 ${
                  isReducedMotion ? "duration-0" : "duration-200"
                } ${
                  isInHero
                    ? "bg-white/90 border border-white shadow-[0_4px_18px_rgba(0,0,0,0.18),inset_0_1.5px_2px_rgba(255,255,255,1)]"
                    : "bg-white border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1.5px_2px_rgba(255,255,255,1)]"
                }`}
                style={{
                  left: `${highlightStyle.x}px`,
                  width: `${highlightStyle.width}px`,
                  opacity: highlightStyle.ready ? 1 : 0,
                }}
              />

              {navItems.map((item) => {
                const Icon = item.icon;
                const isHighlighted = currentHighlightedId === item.id;

                return (
                  <div
                    key={item.id}
                    className="relative flex-1 flex items-center justify-center min-w-0"
                  >
                    <button
                      ref={(el) => {
                        if (el) buttonRefs.current.set(item.id, el);
                        else buttonRefs.current.delete(item.id);
                      }}
                      type="button"
                      onClick={item.action}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onFocus={() => setHoveredId(item.id)}
                      onBlur={() => setHoveredId(null)}
                      aria-label={item.label}
                      className={`group relative z-10 flex flex-col items-center justify-center w-full py-1 sm:py-2 px-1 sm:px-2 rounded-full transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary/60 min-h-[46px] sm:min-h-[52px] ${
                        isHighlighted
                          ? "text-slate-950 font-semibold" // Teks gelap kontras WCAG AA di atas kapsul putih terang (Perbaikan N2)
                          : isInHero
                          ? "text-white/90 hover:text-white"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-105 ${
                          isHighlighted ? "mb-0.5 text-slate-950" : "mb-0.5"
                        } ${
                          !isHighlighted && isInHero
                            ? "drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                            : "drop-shadow-none"
                        }`}
                      />
                      <span
                        className={`text-[10px] sm:text-[11.5px] tracking-wide whitespace-nowrap truncate max-w-full ${
                          isHighlighted
                            ? "inline font-bold text-slate-950"
                            : isInHero
                            ? "hidden sm:inline font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
                            : "hidden sm:inline font-medium"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Ship, Compass, CloudSun, Bot, BookOpen, User } from "lucide-react";
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

export const LiquidNav: React.FC<LiquidNavProps> = ({
  show,
  isReducedMotion,
  isInHero = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [user, setUser] = useState<unknown>(null);
  const guideRef = useRef<HTMLDivElement>(null);

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
        setGuideOpen(false);
        if (location.pathname === "/") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          navigate("/");
        }
      },
      isActive:
        location.pathname === "/" &&
        (typeof window !== "undefined"
          ? window.scrollY < window.innerHeight * 1.5
          : true),
    },
    {
      id: "boats",
      label: "Armada Kapal",
      icon: Ship,
      action: () => {
        setGuideOpen(false);
        navigate("/boats");
      },
      isActive: location.pathname.startsWith("/boats"),
    },
    {
      id: "tours",
      label: "Paket Tour",
      icon: Compass,
      action: () => {
        setGuideOpen(false);
        navigate("/tour-packages");
      },
      isActive: location.pathname.startsWith("/tour-packages"),
    },
    {
      id: "weather",
      label: "Cuaca & Peta",
      icon: CloudSun,
      action: () => {
        setGuideOpen(false);
        const mapEl = document.getElementById("weather-map-section");
        if (mapEl) {
          mapEl.scrollIntoView({ behavior: "smooth" });
        } else if (location.pathname !== "/") {
          navigate("/#weather-map-section");
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
        setGuideOpen(false);
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
      id: "guide",
      label: "Panduan",
      icon: BookOpen,
      action: () => {
        setGuideOpen((prev) => !prev);
      },
      isActive: location.pathname === "/permit-info",
    },
    {
      id: "auth",
      label: user ? "Dashboard" : "Masuk / Akun",
      icon: User,
      action: () => {
        setGuideOpen(false);
        if (user) {
          navigate("/dashboard");
        } else {
          navigate("/auth");
        }
      },
      isActive:
        location.pathname === "/auth" ||
        location.pathname === "/dashboard" ||
        location.pathname === "/operator-dashboard",
    },
  ];

  const activeItem = navItems.find((item) => item.isActive) || navItems[0];
  const currentHighlightedId = hoveredId || activeItem.id;
  const highlightedIndex = Math.max(
    0,
    navItems.findIndex((item) => item.id === currentHighlightedId)
  );

  // Animasi ekspansi bouncy saat muncul dan dip-bounce saat menghilang
  const navContainerVariants = {
    hidden: isReducedMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          y: "14vh",
          scaleX: 0.22,
          scaleY: 0.65,
        },
    visible: {
      opacity: 1,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transition: isReducedMotion
        ? { duration: 0 }
        : {
            type: "spring" as const,
            stiffness: 240,
            damping: 18,
            mass: 0.85,
          },
    },
    exit: isReducedMotion
      ? { opacity: 0, transition: { duration: 0.15 } }
      : {
          opacity: [1, 1, 0],
          y: [0, 8, -40],
          scaleX: [1, 1.03, 0.65],
          scaleY: [1, 1.03, 0.65],
          transition: {
            duration: 0.35,
            times: [0, 0.25, 1],
            ease: "easeInOut" as const,
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
          aria-label="Navigasi Utama Suar"
          className="fixed top-5 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-auto origin-center"
        >
          {/* Pill Kaca Translucent Frosted Glass (Unified Floating Glass Bar) */}
          <div
            onMouseLeave={() => {
              setHoveredId(null);
              setGuideOpen(false);
            }}
            className={`relative flex items-center justify-between p-1 sm:p-1.5 rounded-full w-full max-w-[840px] md:max-w-[940px] lg:max-w-[980px] transition-all duration-300 select-none ${
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
              aria-label="Kembali ke Beranda Suar"
              className={`relative z-10 flex items-center gap-2 pl-3 sm:pl-4 pr-3 py-1.5 sm:py-2 rounded-full transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 min-h-[50px] sm:min-h-[54px] select-none group ${
                isInHero ? "hover:bg-white/10" : "hover:bg-black/5"
              }`}
            >
              <img
                src={isInHero ? "/logo_suar.png" : "/LOGO SUAR HORIZONTAL-01.png"}
                alt="Logo Suar"
                className={`h-7 sm:h-8 w-auto object-contain transition-all duration-300 group-hover:scale-105 ${
                  isInHero
                    ? "brightness-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                    : "drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                }`}
              />
              <span className="sr-only">Suar</span>
            </button>

            {/* Garis Pemisah Halus antara Brand & Navigasi */}
            <div
              className={`h-6 w-[1px] my-auto transition-colors duration-300 ${
                isInHero ? "bg-white/35" : "bg-slate-300/80"
              } mx-1`}
            />

            {/* Kelompok Menu Navigasi Utama */}
            <div className="relative flex-1 flex items-center justify-between min-w-0">
              {/* Highlight Kapsul Bergeser Murni Slot Flex (100% Bebas Bug Desync/Scale/Detach) */}
              <motion.div
                aria-hidden="true"
                className="absolute inset-y-0 pointer-events-none z-0 px-1 py-0.5"
                style={{
                  width: `${100 / navItems.length}%`,
                  left: 0,
                }}
                animate={{
                  x: `${highlightedIndex * 100}%`,
                }}
                transition={
                  isReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 380, damping: 30 }
                }
              >
                <div
                  className={`w-full h-full rounded-full transition-colors duration-200 ${
                    isInHero
                      ? "bg-white/90 border border-white shadow-[0_4px_18px_rgba(0,0,0,0.18),inset_0_1.5px_2px_rgba(255,255,255,1)]"
                      : "bg-white border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1.5px_2px_rgba(255,255,255,1)]"
                  }`}
                />
              </motion.div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isHighlighted = currentHighlightedId === item.id;

                return (
                  <div
                    key={item.id}
                    className="relative flex-1 flex items-center justify-center min-w-0"
                  >
                    <button
                      type="button"
                      onClick={item.action}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onFocus={() => setHoveredId(item.id)}
                      onBlur={() => setHoveredId(null)}
                      aria-label={item.label}
                      className={`group relative z-10 flex flex-col items-center justify-center w-full py-1.5 sm:py-2 px-1 sm:px-2 rounded-full transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary/60 min-h-[50px] sm:min-h-[54px] ${
                        isHighlighted
                          ? "text-slate-950 font-semibold" // Teks gelap kontras WCAG AA di atas kapsul putih terang (Perbaikan N2)
                          : isInHero
                          ? "text-white/90 hover:text-white"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform duration-200 group-hover:scale-110 ${
                          isHighlighted ? "mb-1 text-slate-950" : "mb-1"
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

            {/* Dropdown Panduan Floating Glass */}
            {guideOpen && (
              <div
                ref={guideRef}
                className="absolute top-full pt-2 right-12 sm:right-28 z-50 min-w-[170px] animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div
                  className={`py-2 px-2.5 rounded-2xl shadow-2xl space-y-1 ${
                    isInHero
                      ? "bg-slate-900/95 backdrop-blur-2xl border border-white/20 text-white"
                      : "bg-white/95 backdrop-blur-2xl border border-slate-200 text-slate-800 shadow-xl"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setGuideOpen(false);
                      const el = document.getElementById("how-it-works");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                      else navigate("/#how-it-works");
                    }}
                    className={`block w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                      isInHero
                        ? "hover:bg-white/10 hover:text-cyan-300"
                        : "hover:bg-cyan-50 hover:text-cyan-800"
                    }`}
                  >
                    Cara Kerja Platform
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGuideOpen(false);
                      navigate("/permit-info");
                    }}
                    className={`block w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                      isInHero
                        ? "hover:bg-white/10 hover:text-cyan-300"
                        : "hover:bg-cyan-50 hover:text-cyan-800"
                    }`}
                  >
                    Perizinan KSOP
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

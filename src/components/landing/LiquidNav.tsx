import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
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

export const LiquidNav: React.FC<LiquidNavProps> = ({
  show,
  isReducedMotion,
  isInHero = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [user, setUser] = useState<unknown>(null);

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
      isActive: location.pathname === "/" && window.scrollY < window.innerHeight * 1.5,
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

  // Animasi ekspansi dari tengah: objek bulat muncul di tengah lalu melebar ke kiri-kanan dengan spring bouncy
  const navContainerVariants = {
    hidden: isReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: "18vh", scaleX: 0.18, scaleY: 0.65 },
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
            damping: 20,
            mass: 0.85,
            staggerChildren: 0.04,
            delayChildren: 0.06,
          },
    },
    exit: isReducedMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          y: "14vh",
          scaleX: 0.25,
          scaleY: 0.6,
          transition: { duration: 0.2 },
        },
  };

  const navItemVariants = {
    hidden: isReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: isReducedMotion
        ? { duration: 0 }
        : { type: "spring" as const, stiffness: 360, damping: 25 },
    },
  };

  return (
    <AnimatePresence>
      {(show || isReducedMotion) && (
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
            onMouseLeave={() => setHoveredId(null)}
            className={`relative flex items-center justify-between p-1.5 sm:p-2 rounded-full w-full max-w-[840px] md:max-w-[940px] lg:max-w-[980px] transition-all duration-300 select-none ${
              isInHero
                ? "bg-white/25 backdrop-blur-3xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.22),inset_0_1.5px_1.5px_rgba(255,255,255,0.85),inset_0_-1px_1px_rgba(0,0,0,0.08)]"
                : "bg-white/75 backdrop-blur-3xl border border-white/80 shadow-[0_18px_45px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04),inset_0_1.5px_2px_rgba(255,255,255,1),inset_0_-1px_1px_rgba(0,0,0,0.04)]"
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
            <motion.button
              type="button"
              variants={navItemVariants}
              onClick={() => {
                if (location.pathname === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  navigate("/");
                }
              }}
              aria-label="Kembali ke Beranda Angkara"
              className={`relative z-10 flex items-center gap-2 pl-3 sm:pl-4 pr-3 py-1.5 sm:py-2 rounded-full transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 min-h-[48px] sm:min-h-[54px] select-none group ${
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
            </motion.button>

            {/* Garis Pemisah Halus antara Brand & Navigasi */}
            <div
              className={`h-6 w-[1px] my-auto transition-colors duration-300 ${
                isInHero ? "bg-white/35" : "bg-slate-300/80"
              } mx-1`}
            />

            {/* Kelompok Menu Navigasi Utama */}
            <div className="flex-1 flex items-center justify-between min-w-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isHighlighted = currentHighlightedId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    variants={navItemVariants}
                    className="relative flex-1 flex items-center justify-center min-w-0"
                  >
                    <button
                      type="button"
                      onClick={item.action}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onFocus={() => setHoveredId(item.id)}
                      onBlur={() => setHoveredId(null)}
                      aria-label={item.label}
                      className={`group relative z-10 flex flex-col items-center justify-center w-full py-2 sm:py-2.5 px-2 rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/60 min-h-[50px] sm:min-h-[56px] ${
                        isInHero
                          ? "text-white"
                          : isHighlighted
                          ? "text-slate-950 font-semibold"
                          : "text-slate-600 hover:text-slate-950"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 sm:w-5 sm:h-5 mb-1 transition-transform duration-200 group-hover:scale-110 ${
                          isInHero
                            ? "drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                            : "drop-shadow-none"
                        }`}
                      />
                      <span
                        className={`text-[10px] sm:text-[11.5px] tracking-wide whitespace-nowrap truncate max-w-full ${
                          isInHero
                            ? "font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
                            : isHighlighted
                            ? "font-semibold"
                            : "font-medium"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>

                    {/* Highlight kapsul kaca putih transparan (Apple Liquid Glass) yang bergeser mengikuti hover/aktif */}
                    {isHighlighted && (
                      <motion.div
                        layoutId="liquid-nav-highlight"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 28,
                        }}
                        className={`absolute inset-0 z-0 rounded-full backdrop-blur-md ${
                          isInHero
                            ? "bg-white/30 border border-white/70 shadow-[0_4px_18px_rgba(0,0,0,0.12),inset_0_1.5px_2px_rgba(255,255,255,0.95)]"
                            : "bg-white/95 border border-white shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1.5px_2px_rgba(255,255,255,1)]"
                        }`}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

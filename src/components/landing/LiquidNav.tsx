import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { Home, Ship, CloudSun, Bot, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface LiquidNavProps {
  show: boolean;
  isReducedMotion: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  isActive: boolean;
}

export const LiquidNav: React.FC<LiquidNavProps> = ({ show, isReducedMotion }) => {
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
      label: "Kapal",
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
      label: user ? "Dashboard" : "Masuk",
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

  // Variasi animasi Apple spring bouncy dengan stagger 50ms per item
  const navContainerVariants = {
    hidden: isReducedMotion
      ? { opacity: 0 }
      : { opacity: 0, y: "35vh", scale: 0.55 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: isReducedMotion
        ? { duration: 0 }
        : {
            type: "spring" as const,
            stiffness: 300,
            damping: 22,
            mass: 0.9,
            staggerChildren: 0.05,
            delayChildren: 0.08,
          },
    },
    exit: isReducedMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          y: "20vh",
          scale: 0.7,
          transition: { duration: 0.2 },
        },
  };

  const navItemVariants = {
    hidden: isReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: isReducedMotion
        ? { duration: 0 }
        : { type: "spring" as const, stiffness: 380, damping: 26 },
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
          className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-auto"
        >
          {/* Pill Kaca Liquid Glass */}
          <div
            onMouseLeave={() => setHoveredId(null)}
            className="relative flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-full max-w-[560px] w-auto bg-white/12 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/28 dark:border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.45)] select-none"
            style={{
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
            }}
          >
            {/* Pantulan kilau cahaya diagonal tipis & rim cahaya atas */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/15 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

            {navItems.map((item) => {
              const Icon = item.icon;
              const isHighlighted = currentHighlightedId === item.id;
              const isHovered = hoveredId === item.id;

              return (
                <motion.div
                  key={item.id}
                  variants={navItemVariants}
                  className="relative flex items-center"
                >
                  <button
                    type="button"
                    onClick={item.action}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onFocus={() => setHoveredId(item.id)}
                    onBlur={() => setHoveredId(null)}
                    aria-label={item.label}
                    className="relative z-10 flex items-center justify-center min-w-[44px] min-h-[44px] px-3 py-2 rounded-full text-white transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                  >
                    <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />

                    {/* Label teks di mobile untuk item aktif */}
                    {item.isActive && (
                      <span className="sm:hidden text-xs font-medium ml-1.5 pr-1">
                        {item.label}
                      </span>
                    )}
                  </button>

                  {/* Highlight kaca yang bergeser mengikuti hover/aktif */}
                  {isHighlighted && (
                    <motion.div
                      layoutId="liquid-nav-highlight"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 28,
                      }}
                      className="absolute inset-0 z-0 rounded-full bg-cyan-500/25 border border-cyan-300/40 shadow-[0_0_16px_rgba(6,182,212,0.45),inset_0_1px_0_rgba(255,255,255,0.5)]"
                    />
                  )}

                  {/* Tooltip kaca melayang saat hover desktop */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="hidden sm:block absolute -bottom-9 left-1/2 -translate-x-1/2 z-30 px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide text-white bg-slate-900/85 backdrop-blur-md border border-white/20 shadow-lg pointer-events-none whitespace-nowrap"
                      >
                        {item.label}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

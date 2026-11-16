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
          {/* Pill Kaca Lebar Sejajar Judul (Maks ~820px) */}
          <div
            onMouseLeave={() => setHoveredId(null)}
            className="relative flex items-center justify-between p-1.5 sm:p-2 rounded-full w-full max-w-[760px] md:max-w-[840px] bg-black/45 dark:bg-black/60 backdrop-blur-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] select-none"
            style={{
              backdropFilter: "blur(24px) saturate(190%)",
              WebkitBackdropFilter: "blur(24px) saturate(190%)",
            }}
          >
            {/* Pantulan kilau cahaya diagonal tipis & rim cahaya atas */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/12 via-white/5 to-transparent pointer-events-none" />
            <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

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
                    className="group relative z-10 flex flex-col items-center justify-center w-full py-2 sm:py-2.5 px-2 rounded-full text-white/90 hover:text-white transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/60 min-h-[50px] sm:min-h-[56px]"
                  >
                    <Icon className="w-5 h-5 sm:w-5 sm:h-5 mb-1 transition-transform duration-200 group-hover:scale-110 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    <span className="text-[10px] sm:text-[11.5px] font-medium tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] whitespace-nowrap truncate max-w-full">
                      {item.label}
                    </span>
                  </button>

                  {/* Highlight kaca putih transparan (Apple Liquid Glass) yang bergeser mengikuti hover/aktif */}
                  {isHighlighted && (
                    <motion.div
                      layoutId="liquid-nav-highlight"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 28,
                      }}
                      className="absolute inset-0 z-0 rounded-full bg-white/18 border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.25),inset_0_1px_1.5px_rgba(255,255,255,0.7),inset_0_-1px_1px_rgba(0,0,0,0.2)] backdrop-blur-md"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

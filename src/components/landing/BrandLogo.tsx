import React from "react";
import { Link } from "react-router-dom";

interface BrandLogoProps {
  isInHero: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ isInHero }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Link
      to="/"
      onClick={handleClick}
      aria-label="Angkara - Kembali ke Beranda"
      className={`fixed top-5 left-5 sm:left-8 z-50 flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full cursor-pointer select-none transition-all duration-300 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isInHero
          ? "bg-white/15 backdrop-blur-2xl border border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:bg-white/20"
          : "bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200/80 dark:border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:bg-white"
      }`}
    >
      <img
        src="/logo.png"
        alt="Logo Angkara"
        className={`h-7 w-7 sm:h-8 sm:w-8 object-contain transition-all duration-300 ease-in-out ${
          isInHero
            ? "brightness-0 invert drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
            : "brightness-100 invert-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
        }`}
      />
      <span
        className={`text-lg sm:text-xl font-bold tracking-tight font-display transition-colors duration-300 ease-in-out ${
          isInHero
            ? "text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
            : "text-slate-900 dark:text-white"
        }`}
      >
        Angkara
      </span>
    </Link>
  );
};

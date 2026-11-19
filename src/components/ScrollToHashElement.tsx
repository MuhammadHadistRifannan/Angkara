import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToHashElement
 * Menangani auto-scroll cerdas untuk navigasi single page application (SPA):
 * 1. Jika URL memiliki target hash (#weather-map-section, #how-it-works, dll),
 *    komponen akan mencari elemen ID tersebut dan melakukan smooth scroll.
 *    Dilengkapi mekanisme polling berkala untuk mengantisipasi lazy-load (Suspense)
 *    seperti komponen 3D atau pergeseran layout (layout shift) saat rendering.
 * 2. Jika URL tidak memiliki hash (navigasi antar halaman biasa),
 *    scroll di-reset ke posisi paling atas (top: 0).
 */
export const ScrollToHashElement: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const rawHash = location.hash;
    const hashId = rawHash ? rawHash.replace(/^#/, "") : "";

    if (hashId) {
      let isCancelled = false;

      const scrollToTarget = () => {
        if (isCancelled) return true;
        const el = document.getElementById(hashId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return true;
        }
        return false;
      };

      // Coba langsung saat mount / render
      if (!scrollToTarget()) {
        // Polling bertahap untuk menunggu komponen lazy-load (misal FeaturesStage 3D)
        const timeouts = [50, 150, 300, 600, 1000].map((delay) =>
          setTimeout(() => {
            scrollToTarget();
          }, delay)
        );

        return () => {
          isCancelled = true;
          timeouts.forEach((id) => clearTimeout(id));
        };
      } else {
        // Jika sudah ditemukan di awal, berikan 1x penyesuaian jika Suspense 3D menggeser layout halaman
        const timeout = setTimeout(() => {
          if (!isCancelled) {
            const el = document.getElementById(hashId);
            const rect = el?.getBoundingClientRect?.();
            // Bila posisi elemen tergeser lebih dari ambang batas akibat pergeseran DOM
            if (rect && (rect.top < -50 || rect.top > 120)) {
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        }, 400);

        return () => {
          isCancelled = true;
          clearTimeout(timeout);
        };
      }
    } else {
      // Halaman tanpa hash: reset ke posisi atas
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [location.pathname, location.hash, location.key]);

  return null;
};

export default ScrollToHashElement;

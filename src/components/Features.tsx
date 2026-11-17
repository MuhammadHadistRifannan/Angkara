import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { Features2DFallback } from "./features3d/Features2DFallback";

// Lazy-load panggung 3D agar bundle Three.js tidak membebani First Contentful Paint (FCP) & LCP Hero
const FeaturesStage = lazy(() => import("./features3d/FeaturesStage"));

const Features = () => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    // Muat bundle saat pengguna berada 800px sebelum section fitur agar siap sebelum mencapai panggung
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "800px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={triggerRef} id="features">
      {shouldLoad ? (
        <Suspense fallback={<Features2DFallback />}>
          <FeaturesStage />
        </Suspense>
      ) : (
        <Features2DFallback />
      )}
    </div>
  );
};

export default Features;

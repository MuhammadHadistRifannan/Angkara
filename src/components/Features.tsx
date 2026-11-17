import { lazy, Suspense } from "react";
import { Features2DFallback } from "./features3d/Features2DFallback";

// Lazy-load panggung 3D agar bundle Three.js tidak membebani First Contentful Paint (FCP) & LCP Hero
const FeaturesStage = lazy(() => import("./features3d/FeaturesStage"));

const Features = () => {
  return (
    <div>
      <Suspense fallback={<Features2DFallback />}>
        <FeaturesStage />
      </Suspense>
    </div>
  );
};

export default Features;

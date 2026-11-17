import { StageLightPool } from "./StageLightPool";

/**
 * Kompatibilitas mundur: Turntable kini mengarah ke StageLightPool
 * (tanpa wooden_plate.glb sesuai Revisi 2).
 */
export const Turntable = () => {
  return <StageLightPool />;
};

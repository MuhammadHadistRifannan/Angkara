import { ContactShadows } from "@react-three/drei";

/**
 * Kolam cahaya lembut (Soft Light Pool) di bawah model 3D:
 * Menggantikan wooden_plate.glb. Tidak ada alas, piringan kayu, atau ground apa pun.
 * Model berdiri/melayang bebas di atas kolam cahaya elips & bayangan kontak halus transparan.
 */
export const StageLightPool = () => {
  return (
    <group position={[0, -0.85, 0]}>
      {/* Bayangan kontak halus transparan berbentuk elips lembut di lantai */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.35}
        scale={3.0}
        blur={2.8}
        far={2.0}
        color="#020b17"
      />
    </group>
  );
};

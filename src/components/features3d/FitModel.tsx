import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import {
  Box3,
  Group,
  Vector3,
  type Mesh,
  type MeshStandardMaterial,
} from "three";
import { MODEL_CONFIG } from "./modelConfig";

interface FitModelProps {
  activeId: string;
  url: string;
  targetHeight?: number;
  rotationDeg?: [number, number, number];
  offsetY?: number;
  envMapIntensity?: number;
  debugRotationOffset?: [number, number, number];
}

export const FitModel = ({
  activeId,
  url,
  targetHeight: customTargetHeight,
  rotationDeg: customRotationDeg,
  offsetY: customOffsetY,
  envMapIntensity: customEnvMapIntensity,
  debugRotationOffset = [0, 0, 0],
}: FitModelProps) => {
  const { scene } = useGLTF(url);
  const loggedRef = useRef<string | null>(null);

  // Ambil konfigurasi dari MODEL_CONFIG sebagai single source of truth
  const config = MODEL_CONFIG[activeId];
  const targetHeight = customTargetHeight ?? config?.targetHeight ?? 1.45;
  const baseRotationDeg = config?.rotation ?? customRotationDeg ?? [0, 0, 0];
  const envMapIntensity = customEnvMapIntensity ?? config?.envMapIntensity ?? 1.0;
  const offsetY = customOffsetY ?? config?.offsetY ?? 0;

  // Clone scene agar tidak memutasi cache Three.js
  const cloned = useMemo(() => scene.clone(true), [scene]);

  // Primitive dependencies untuk rotasi
  const rotX = baseRotationDeg[0] + debugRotationOffset[0];
  const rotY = baseRotationDeg[1] + debugRotationOffset[1];
  const rotZ = baseRotationDeg[2] + debugRotationOffset[2];

  // Urutan pemrosesan wajib:
  // 1. Terapkan rotasi koreksi (derajat -> radian) ke grup model
  // 2. Hitung ulang bounding box setelah rotasi
  // 3. Cari titik pusat (center x, y, z)
  // 4. Hitung skala ke targetHeight berdasarkan dimensi vertikal (size.y)
  // 5. Geser pivot tepat ke pusat bounding box (x, y, z)
  const { scale, centerOffset, transformedGroup } = useMemo(() => {
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;
    const radZ = (rotZ * Math.PI) / 180;

    const rotGroup = new Group();
    rotGroup.rotation.set(radX, radY, radZ);
    rotGroup.add(cloned);
    rotGroup.updateMatrixWorld(true);

    const box = new Box3().setFromObject(rotGroup);
    const size = new Vector3();
    box.getSize(size);
    const center = new Vector3();
    box.getCenter(center);

    // Skala proporsional ke targetHeight
    const s = targetHeight / (size.y || 1);

    // Logging informatif di mode development untuk verifikasi orientasi
    if (import.meta.env.DEV && loggedRef.current !== `${activeId}-${rotX},${rotY},${rotZ}`) {
      loggedRef.current = `${activeId}-${rotX},${rotY},${rotZ}`;
      console.log(
        `%c[Features3D: ${activeId}]%c BBox Size: [${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)}] | Rot: [${rotX}°, ${rotY}°, ${rotZ}°] | Scale: ${s.toFixed(3)}`,
        "color: #38bdf8; font-weight: bold;",
        "color: #94a3b8;"
      );
    }

    return {
      scale: s,
      centerOffset: [-center.x, -center.y, -center.z] as [number, number, number],
      transformedGroup: rotGroup,
    };
  }, [cloned, rotX, rotY, rotZ, targetHeight, activeId]);

  // Tingkatkan intensitas respon material PBR agar model gelap (shield, anchor) tidak pekat
  useEffect(() => {
    cloned.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        const mat = mesh.material as MeshStandardMaterial;
        if (mat && "roughness" in mat) {
          mat.roughness = Math.max(0.2, Math.min(0.85, mat.roughness ?? 0.5));
          if (typeof envMapIntensity === "number") {
            mat.envMapIntensity = envMapIntensity;
          }
        }
      }
    });
  }, [cloned, envMapIntensity]);

  return (
    <group scale={scale} position={[0, offsetY, 0]}>
      <group position={centerOffset}>
        <primitive object={transformedGroup} />
      </group>
    </group>
  );
};

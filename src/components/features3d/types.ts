import type { ComponentType } from "react";

export interface Feature3DItem {
  id: string;
  title: string;
  description?: string;
  audience?: string;
  modelUrl: string;
  targetHeight: number;
  initialRotation?: [number, number, number];
  icon?: ComponentType<{ className?: string }>;
}

export interface SecondaryFeatureItem {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  href?: string;
  tag?: string;
  badge?: string;
  actionText?: string;
}

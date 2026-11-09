import { useState, useEffect } from "react";
import { roundCoord } from "@/lib/severityColor";

export type LocationState = {
  status: "loading" | "granted" | "denied" | "unsupported";
  lat: number;
  lon: number;
};

// Titik tengah representatif perairan Cilacap
export const CILACAP_CENTER = {
  lat: -7.73,
  lon: 109.01,
};

export function useUserLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    status: "loading",
    lat: CILACAP_CENTER.lat,
    lon: CILACAP_CENTER.lon,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !navigator?.geolocation) {
      setState({
        status: "unsupported",
        lat: CILACAP_CENTER.lat,
        lon: CILACAP_CENTER.lon,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const roundedLat = roundCoord(pos.coords.latitude);
        const roundedLon = roundCoord(pos.coords.longitude);
        setState({
          status: "granted",
          lat: roundedLat,
          lon: roundedLon,
        });
      },
      () => {
        setState({
          status: "denied",
          lat: CILACAP_CENTER.lat,
          lon: CILACAP_CENTER.lon,
        });
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, []);

  return state;
}

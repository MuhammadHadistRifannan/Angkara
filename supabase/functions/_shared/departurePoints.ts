export interface DeparturePoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  adm4: string;
  boatLocations: string[];
}

export const DEPARTURE_POINTS: DeparturePoint[] = [
  {
    id: "teluk-penyu",
    name: "Teluk Penyu",
    lat: -7.7401,
    lon: 109.017,
    adm4: "33.01.21.1002",
    boatLocations: ["Teluk Penyu"],
  },
  {
    id: "tanjung-intan",
    name: "Pelabuhan Tanjung Intan",
    lat: -7.7348,
    lon: 108.9063,
    adm4: "33.01.21.1003",
    boatLocations: ["Pelabuhan Tanjung Intan"],
  },
];

export function findPointByBoatLocation(location: string): DeparturePoint | null {
  if (!location) return null;
  const normalized = location.trim().toLowerCase();
  for (const point of DEPARTURE_POINTS) {
    if (point.boatLocations.some((loc) => loc.trim().toLowerCase() === normalized)) {
      return point;
    }
  }
  return null;
}

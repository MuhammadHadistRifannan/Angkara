import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserLocation, CILACAP_CENTER } from "@/hooks/useUserLocation";
import { levelToColor } from "@/lib/severityColor";
import { MarineChart } from "./MarineChart";
import { supabase } from "@/integrations/supabase/client";
import { DEPARTURE_POINTS } from "../../../supabase/functions/_shared/departurePoints";
import type { MarineResponse } from "../../../supabase/functions/_shared/contracts";
import type { Level } from "../../../supabase/functions/_shared/safety/rules";
import {
  MapPin,
  Anchor,
  Compass,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  MessageSquare,
  Navigation,
} from "lucide-react";

// Helper untuk membuat HTML Marker Pin Leaflet yang berwarna dan aksesibel
function createPointIcon(name: string, level: Level): L.DivIcon {
  const color = levelToColor(level);
  const iconSymbol =
    level === "aman" ? "✓" : level === "waspada" ? "!" : "✕";

  return L.divIcon({
    className: "custom-point-marker",
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%); cursor:pointer;">
        <div style="background-color:${color}; color:#fff; width:28px; height:28px; border-radius:50%; border:2px solid #fff; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-weight:bold; font-size:12px;">
          ${iconSymbol}
        </div>
        <div style="background:rgba(15,23,42,0.85); color:#fff; font-size:10px; font-weight:600; padding:2px 6px; border-radius:4px; margin-top:3px; white-space:nowrap; box-shadow:0 1px 4px rgba(0,0,0,0.2);">
          ${name}
        </div>
      </div>
    `,
    iconSize: [0, 0],
  });
}

function createUserIcon(): L.DivIcon {
  return L.divIcon({
    className: "custom-user-marker",
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%);">
        <div style="background-color:#2563eb; width:16px; height:16px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 0 4px rgba(37,99,235,0.35);"></div>
        <div style="background:rgba(15,23,42,0.8); color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; margin-top:4px; white-space:nowrap;">
          Lokasi Anda
        </div>
      </div>
    `,
    iconSize: [0, 0],
  });
}

export const WeatherMapPanel: React.FC = () => {
  const userLoc = useUserLocation();
  const [selectedPointId, setSelectedPointId] = useState<string>("teluk-penyu");
  const [marineData, setMarineData] = useState<Record<string, MarineResponse>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Ambil data maritim untuk seluruh titik keberangkatan
  useEffect(() => {
    let isMounted = true;
    async function fetchPointsData() {
      setIsLoading(true);
      setFetchError(null);
      const results: Record<string, MarineResponse> = {};

      try {
        for (const point of DEPARTURE_POINTS) {
          const { data, error } = await supabase.functions.invoke("marine-conditions", {
            body: { kind: "point", pointId: point.id },
          });

          if (error) {
            console.warn(`Gagal memuat cuaca untuk ${point.id}:`, error);
          } else if (data) {
            results[point.id] = data as MarineResponse;
          }
        }

        if (isMounted) {
          setMarineData(results);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : String(err);
          setFetchError(msg || "Gagal memuat kondisi cuaca");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPointsData();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedPoint =
    DEPARTURE_POINTS.find((p) => p.id === selectedPointId) || DEPARTURE_POINTS[0];
  const selectedData = marineData[selectedPoint.id];
  const selectedSeries = selectedData?.series?.find((s) => s.pointId === selectedPoint.id) || selectedData?.series?.[0];
  const todayVerdict = selectedSeries?.verdicts?.[0];

  // Aturan krusial: Jika sumber unavailable, status TIDAK PERNAH "aman"
  const rawLevel: Level = todayVerdict?.level || "waspada";
  const currentLevel: Level =
    selectedData?.source === "unavailable" && rawLevel === "aman"
      ? "waspada"
      : rawLevel;

  const handleAskJuruMudi = () => {
    window.dispatchEvent(
      new CustomEvent("open-assistant", {
        detail: {
          prompt: `Bagaimana kondisi cuaca maritim dan rekomendasi pelayaran di ${selectedPoint.name}?`,
        },
      })
    );
  };

  const getVerdictBadge = (level: Level) => {
    switch (level) {
      case "aman":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Aman untuk Berlayar</span>
          </Badge>
        );
      case "waspada":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 text-xs">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Perlu Kewaspadaan</span>
          </Badge>
        );
      case "tunda":
        return (
          <Badge variant="destructive" className="flex items-center gap-1 text-xs">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tunda Keberangkatan</span>
          </Badge>
        );
    }
  };

  return (
    <Card className="w-full border shadow-md overflow-hidden bg-card flex flex-col">
      <CardHeader className="p-4 bg-muted/20 border-b flex flex-row items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>Peta Cuaca Maritim Cilacap</span>
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            Pantau gelombang, angin, dan rekomendasi pelayaran terkini.
          </div>
        </div>

        {userLoc.status === "denied" && (
          <Badge variant="outline" className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Navigation className="h-3 w-3" aria-hidden="true" />
            <span>Menampilkan pusat Cilacap</span>
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Peringatan jika sumber cuaca unavailable */}
        {selectedData?.source === "unavailable" && (
          <Alert variant="destructive" className="py-2.5 text-xs">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle className="text-xs font-semibold">Sumber Data Cuaca Tidak Tersedia</AlertTitle>
            <AlertDescription className="text-[11px] mt-0.5">
              Prakiraan cuaca tidak dapat dijangkau dari sumber resmi maupun model. Sesuai protokol keselamatan maritim, status tidak dapat dinyatakan aman dan ditetapkan <strong>Waspada</strong>.
            </AlertDescription>
          </Alert>
        )}

        {/* Peringatan jika data tertunda (stale) */}
        {selectedData?.stale && selectedData?.source !== "unavailable" && (
          <Alert variant="default" className="py-2.5 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <AlertTitle className="text-xs font-semibold">Pemberitahuan Data Cuaca Tertunda</AlertTitle>
            <AlertDescription className="text-[11px] mt-0.5">
              Pembaruan langsung dari stasiun cuaca sedang tertunda. Menampilkan data cache terakhir yang tersimpan.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-3 py-2">
            <Skeleton className="w-full h-72 sm:h-80 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-36" />
            </div>
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ) : fetchError ? (
          <div className="p-4 text-center text-xs text-destructive border rounded-md">
            {fetchError}
          </div>
        ) : (
          <>
            {/* Kontainer Peta Leaflet */}
            <div className="relative w-full h-72 sm:h-80 rounded-lg overflow-hidden border shadow-inner">
              <MapContainer
                center={[CILACAP_CENTER.lat, CILACAP_CENTER.lon]}
                zoom={12}
                scrollWheelZoom={false}
                className="w-full h-full z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Marker Pengunjung */}
                {userLoc.status === "granted" && (
                  <Marker position={[userLoc.lat, userLoc.lon]} icon={createUserIcon()}>
                    <Popup>
                      <div className="text-xs font-semibold">Lokasi Pengunjung (Perkiraan)</div>
                    </Popup>
                  </Marker>
                )}

                {/* Marker Titik Keberangkatan */}
                {DEPARTURE_POINTS.map((point) => {
                  const data = marineData[point.id];
                  const series = data?.series?.find((s) => s.pointId === point.id) || data?.series?.[0];
                  let level: Level = series?.verdicts?.[0]?.level || "waspada";
                  if (data?.source === "unavailable" && level === "aman") {
                    level = "waspada";
                  }

                  return (
                    <Marker
                      key={point.id}
                      position={[point.lat, point.lon]}
                      icon={createPointIcon(point.name, level)}
                      eventHandlers={{
                        click: () => setSelectedPointId(point.id),
                      }}
                    >
                      <Popup>
                        <div className="p-1 space-y-1 text-xs">
                          <div className="font-bold">{point.name}</div>
                          <div>Status: <span className="capitalize font-semibold">{level}</span></div>
                          <button
                            type="button"
                            onClick={() => setSelectedPointId(point.id)}
                            className="text-primary hover:underline text-[11px] block mt-1"
                          >
                            Lihat Grafik Detail &rarr;
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            {/* Tab / Pemilih Titik Keberangkatan */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
              <div className="flex items-center gap-1.5">
                {DEPARTURE_POINTS.map((point) => (
                  <Button
                    key={point.id}
                    size="sm"
                    variant={selectedPointId === point.id ? "default" : "outline"}
                    className="text-xs h-8"
                    onClick={() => setSelectedPointId(point.id)}
                  >
                    <MapPin className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                    <span>{point.name}</span>
                  </Button>
                ))}
              </div>

              <Button
                size="sm"
                variant="hero"
                className="text-xs h-8"
                onClick={handleAskJuruMudi}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                <span>Tanya Juru Mudi</span>
              </Button>
            </div>

            {/* Ringkasan & Grafik Titik Terpilih */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/30 p-3 rounded-lg">
                <div>
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    <Anchor className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>{selectedPoint.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {todayVerdict?.reasons?.length
                      ? todayVerdict.reasons.join("; ")
                      : "Kondisi perairan stabil dan terpantau kondusif."}
                  </div>
                </div>
                {getVerdictBadge(currentLevel)}
              </div>

              {selectedSeries?.samples && selectedSeries.samples.length > 0 && (
                <MarineChart
                  samples={selectedSeries.samples}
                  thresholds={selectedData?.thresholds}
                  pointName={selectedPoint.name}
                />
              )}
            </div>
          </>
        )}

        {/* Footer Atribusi & Waktu Pembaruan */}
        <div className="text-[11px] text-muted-foreground border-t pt-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            Diperbarui berkala · data per{" "}
            {selectedData?.fetched_at
              ? new Date(selectedData.fetched_at).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                }) + " WIB"
              : "-"}
          </div>
          <div className="text-[10px]">
            Sumber: BMKG & Open-Meteo & OpenStreetMap
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

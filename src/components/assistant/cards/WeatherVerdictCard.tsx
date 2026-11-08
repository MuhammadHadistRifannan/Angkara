import React from "react";
import type { WeatherVerdictCard as WeatherVerdictCardType } from "../../../../supabase/functions/_shared/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Waves, Wind, CloudRain, Zap, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";

interface Props {
  card: WeatherVerdictCardType;
}

export const WeatherVerdictCard: React.FC<Props> = ({ card }) => {
  const getVerdictBadge = () => {
    switch (card.verdict) {
      case "aman":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Aman Berlayar</span>
          </Badge>
        );
      case "waspada":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 text-xs">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Waspada</span>
          </Badge>
        );
      case "tunda":
        return (
          <Badge variant="destructive" className="flex items-center gap-1 text-xs">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tunda Berlayar</span>
          </Badge>
        );
    }
  };

  return (
    <Card className="my-2 border shadow-sm bg-card w-full">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold">
              Kondisi Cuaca Maritim
            </CardTitle>
            <div className="text-xs text-muted-foreground mt-0.5">
              Titik: {card.pointId} · {card.date}
            </div>
          </div>
          {getVerdictBadge()}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1 space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 p-1.5 rounded-md bg-muted/50">
            <Waves className="h-4 w-4 text-blue-500 shrink-0" aria-hidden="true" />
            <div>
              <div className="text-[10px] text-muted-foreground">Gelombang Maks</div>
              <div className="font-medium">
                {card.metrics.waveHeightMax !== null
                  ? `${card.metrics.waveHeightMax} m`
                  : "Tidak tersedia"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 rounded-md bg-muted/50">
            <Wind className="h-4 w-4 text-teal-500 shrink-0" aria-hidden="true" />
            <div>
              <div className="text-[10px] text-muted-foreground">Angin Maks</div>
              <div className="font-medium">{card.metrics.windSpeedMax} knot</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 rounded-md bg-muted/50">
            <CloudRain className="h-4 w-4 text-indigo-500 shrink-0" aria-hidden="true" />
            <div>
              <div className="text-[10px] text-muted-foreground">Total Hujan</div>
              <div className="font-medium">{card.metrics.rainAccumulation} mm</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 rounded-md bg-muted/50">
            <Zap className="h-4 w-4 text-amber-500 shrink-0" aria-hidden="true" />
            <div>
              <div className="text-[10px] text-muted-foreground">Potensi Petir</div>
              <div className="font-medium">
                {card.metrics.thunder ? "Ada Petir" : "Nihil"}
              </div>
            </div>
          </div>
        </div>

        {card.reasons && card.reasons.length > 0 && (
          <div className="text-[11px] p-2 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
            <span className="font-semibold">Catatan: </span>
            {card.reasons.join("; ")}
          </div>
        )}

        <div className="text-[10px] text-muted-foreground text-right border-t pt-1">
          Diperbarui berkala · BMKG & Open-Meteo
        </div>
      </CardContent>
    </Card>
  );
};

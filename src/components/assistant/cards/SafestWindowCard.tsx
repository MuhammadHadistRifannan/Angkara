import React from "react";
import type { SafestWindowCard as SafestWindowCardType } from "../../../../supabase/functions/_shared/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

interface Props {
  card: SafestWindowCardType;
  onSelectDate?: (date: string) => void;
}

export const SafestWindowCard: React.FC<Props> = ({ card, onSelectDate }) => {
  const renderBadge = (level: "aman" | "waspada" | "tunda") => {
    switch (level) {
      case "aman":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-1.5 py-0.5 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            <span>Aman</span>
          </Badge>
        );
      case "waspada":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-1.5 py-0.5 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            <span>Waspada</span>
          </Badge>
        );
      case "tunda":
        return (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" aria-hidden="true" />
            <span>Tunda</span>
          </Badge>
        );
    }
  };

  return (
    <Card className="my-2 border shadow-sm bg-card w-full">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Rekomendasi Waktu Keberangkatan</span>
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          Peringkat hari paling aman di titik: {card.pointId}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1 space-y-2">
        {card.rankedDays.map((day, idx) => (
          <div
            key={day.date}
            onClick={() => onSelectDate && onSelectDate(day.date)}
            className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1 transition-colors ${
              onSelectDate ? "cursor-pointer hover:border-primary/50" : ""
            } ${idx === 0 && day.level === "aman" ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800" : "bg-muted/40"}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">
                {idx === 0 ? "⭐ Paling Disarankan: " : ""}
                {day.date}
              </span>
              {renderBadge(day.level)}
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {day.recommendation}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

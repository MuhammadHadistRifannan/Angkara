import React from "react";
import type { BoatOptionsCard as BoatOptionsCardType } from "../../../../supabase/functions/_shared/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ship, Users, MapPin } from "lucide-react";

interface Props {
  card: BoatOptionsCardType;
  onSelectBoat?: (boatName: string) => void;
}

export const BoatOptionsCard: React.FC<Props> = ({ card, onSelectBoat }) => {
  return (
    <div className="space-y-3 my-2 w-full">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Pilihan Kapal Tersedia ({card.boats.length})
      </div>
      <div className="grid gap-2">
        {card.boats.map((boat) => (
          <Card key={boat.id} className="border shadow-sm bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Ship className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>{boat.name}</span>
                  </CardTitle>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    <span>{boat.location}</span>
                  </div>
                </div>
                <Badge variant={boat.type === "speedboat" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0.5 capitalize">
                  {boat.type.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex items-center justify-between text-xs mt-2 border-t pt-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Kapasitas: {boat.capacity} org</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-primary">
                    Rp {boat.basePrice.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[10px] text-muted-foreground"> /org</span>
                </div>
              </div>
              {onSelectBoat && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 text-xs h-7"
                  onClick={() => onSelectBoat(boat.name)}
                >
                  Pilih Kapal Ini
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Users, Clock, DollarSign, AlertCircle, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { estimateFare, groupDiscountRate } from "@/lib/fare";

interface BoatOption {
  id: string;
  name: string;
  type: string;
  base_price: number;
  capacity: number;
  location: string;
}

const FareCalculator = () => {
  const [boats, setBoats] = useState<BoatOption[]>([]);
  const [selectedBoatId, setSelectedBoatId] = useState<string>("");
  const [passengers, setPassengers] = useState<number>(1);
  const [duration, setDuration] = useState<number>(2);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchBoats = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from("boats")
        .select("id, name, type, base_price, capacity, location")
        .eq("available", true)
        .order("name");

      if (error) {
        throw new Error(error.message);
      }

      const activeBoats: BoatOption[] = data || [];
      setBoats(activeBoats);
      setSelectedBoatId((prev) => (prev ? prev : activeBoats[0]?.id || ""));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || "Gagal memuat daftar kapal");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  const selectedBoat = boats.find((b) => b.id === selectedBoatId) || boats[0];

  const handleCalculateFare = () => {
    if (!selectedBoat) return;
    const safePax = Math.min(100, Math.max(1, passengers || 1));
    const safeDur = Math.min(12, Math.max(0.5, duration || 0.5));
    const calculated = estimateFare(selectedBoat.base_price, safePax, safeDur);
    setTotal(calculated);
  };

  const currentDiscountRate = groupDiscountRate(Math.min(100, Math.max(1, passengers || 1)));
  const discountPercent =
    currentDiscountRate === 0.85 ? 15 : currentDiscountRate === 0.9 ? 10 : 0;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Calculator className="h-6 w-6 text-primary" aria-hidden="true" />
          <span>Kalkulator Tarif</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-4 py-4" data-testid="fare-calculator-loading">
            <Skeleton className="h-10 w-full" />
            <div className="grid md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ) : errorMessage ? (
          <div className="p-6 text-center space-y-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" aria-hidden="true" />
            <div className="text-sm font-semibold text-destructive">
              Gagal memuat data kapal: {errorMessage}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBoats}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>Coba Lagi</span>
            </Button>
          </div>
        ) : boats.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
            <p className="font-semibold text-sm">Belum ada kapal tersedia</p>
            <p className="text-xs mt-1">Silakan periksa kembali nanti atau hubungi operator pelayaran.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="boat-select" className="text-sm font-medium">
                  Pilih Kapal
                </Label>
                <Select
                  value={selectedBoatId || selectedBoat?.id}
                  onValueChange={setSelectedBoatId}
                >
                  <SelectTrigger id="boat-select" className="w-full">
                    <SelectValue placeholder="Pilih kapal yang tersedia" />
                  </SelectTrigger>
                  <SelectContent>
                    {boats.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name} ({b.type === "speedboat" ? "Speedboat" : "Kapal Kayu"} — Rp {b.base_price.toLocaleString("id-ID")}/pax, maks {b.capacity} org)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passengers" className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>Jumlah Penumpang</span>
                </Label>
                <Input
                  id="passengers"
                  type="number"
                  min="1"
                  max="100"
                  value={passengers}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (Number.isNaN(val)) setPassengers(1);
                    else setPassengers(Math.min(100, Math.max(1, val)));
                  }}
                />
                <span className="text-[11px] text-muted-foreground block">
                  Batas pemesanan: 1 - 100 penumpang
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>Durasi Sewa (jam)</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={duration}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (Number.isNaN(val)) setDuration(2);
                    else setDuration(Math.min(12, Math.max(0.5, val)));
                  }}
                />
                <span className="text-[11px] text-muted-foreground block">
                  Rentang sewa: 0,5 - 12 jam (dasar standar 2 jam)
                </span>
              </div>
            </div>

            <Button
              variant="hero"
              className="w-full mb-6 font-semibold"
              onClick={handleCalculateFare}
            >
              Hitung Estimasi
            </Button>

            {total > 0 && selectedBoat && (
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">Estimasi Total</span>
                  <DollarSign className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-primary">
                  Rp {total.toLocaleString("id-ID")}
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-muted-foreground border-t pt-4">
                  <div className="flex justify-between">
                    <span>Kapal terpilih</span>
                    <span className="font-medium text-foreground">{selectedBoat.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Harga dasar per orang</span>
                    <span className="font-medium text-foreground">
                      Rp {selectedBoat.base_price.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jumlah penumpang</span>
                    <span className="font-medium text-foreground">{passengers} orang</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Durasi sewa</span>
                    <span className="font-medium text-foreground">{duration} jam</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diskon grup</span>
                    <span className={discountPercent > 0 ? "font-semibold text-emerald-600 dark:text-emerald-400" : "font-medium text-foreground"}>
                      {discountPercent}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground border-t pt-3 leading-relaxed">
                  Ini hanya estimasi. Harga final saat booking = harga dasar x jumlah penumpang; diskon grup dan durasi pada kalkulator ini belum diterapkan pada booking.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FareCalculator;

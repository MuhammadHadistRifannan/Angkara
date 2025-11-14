import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Users, Clock, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FareCalculator = () => {
  const [passengers, setPassengers] = useState(1);
  const [boatType, setBoatType] = useState("speedboat");
  const [duration, setDuration] = useState(2);
  const [total, setTotal] = useState(0);

  const basePrices: { [key: string]: number } = {
    speedboat: 50000,
    kapal_kayu: 35000,
    ferry: 25000,
  };

  const calculateFare = () => {
    const basePrice = basePrices[boatType] || 50000;
    const durationMultiplier = duration / 2;
    const groupDiscount = passengers >= 10 ? 0.9 : passengers >= 20 ? 0.85 : 1;
    
    const calculatedTotal = basePrice * passengers * durationMultiplier * groupDiscount;
    setTotal(Math.round(calculatedTotal));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Calculator className="h-6 w-6 text-primary" />
          Kalkulator Tarif
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Label htmlFor="passengers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Jumlah Penumpang
            </Label>
            <Input
              id="passengers"
              type="number"
              min="1"
              value={passengers}
              onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="boat-type">Tipe Kapal</Label>
            <Select value={boatType} onValueChange={setBoatType}>
              <SelectTrigger id="boat-type">
                <SelectValue placeholder="Pilih tipe kapal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="speedboat">Speedboat (Rp 50.000/pax)</SelectItem>
                <SelectItem value="kapal_kayu">Kapal Kayu (Rp 35.000/pax)</SelectItem>
                <SelectItem value="ferry">Ferry (Rp 25.000/pax)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Durasi (jam)
            </Label>
            <Input
              id="duration"
              type="number"
              min="1"
              step="0.5"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value) || 1)}
            />
          </div>
        </div>

        <Button variant="hero" className="w-full mb-6" onClick={calculateFare}>
          Hitung Estimasi
        </Button>

        {total > 0 && (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Estimasi Total</span>
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div className="text-4xl font-bold text-primary mb-4">
              Rp {total.toLocaleString('id-ID')}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground border-t pt-4">
              <div className="flex justify-between">
                <span>Harga dasar per orang</span>
                <span>Rp {basePrices[boatType].toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Jumlah penumpang</span>
                <span>{passengers} orang</span>
              </div>
              <div className="flex justify-between">
                <span>Durasi</span>
                <span>{duration} jam</span>
              </div>
              {passengers >= 10 && (
                <div className="flex justify-between text-primary">
                  <span>Diskon grup</span>
                  <span>{passengers >= 20 ? '15%' : '10%'}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * Harga dapat berubah tergantung musim dan ketersediaan. Harga final akan dikonfirmasi saat booking.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FareCalculator;

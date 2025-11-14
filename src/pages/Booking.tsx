import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { Calendar as CalendarIcon, Users, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const boatId = searchParams.get("boatId");
  
  const [date, setDate] = useState<Date>();
  const [boat, setBoat] = useState<any>(null);
  const [passengers, setPassengers] = useState(1);
  const [departureTime, setDepartureTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBoat = async () => {
      if (!boatId) return;
      const { data } = await supabase
        .from("boats")
        .select("*")
        .eq("id", boatId)
        .single();
      setBoat(data);
    };
    fetchBoat();
  }, [boatId]);

  const handleBooking = async () => {
    if (!date || !boat) {
      toast.error("Mohon lengkapi semua data");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      navigate("/auth");
      return;
    }

    setLoading(true);
    const totalPrice = boat.base_price * passengers;

    const { error } = await supabase.from("bookings").insert({
      boat_id: boat.id,
      user_id: user.id,
      booking_date: date.toISOString().split('T')[0],
      departure_time: departureTime,
      passengers,
      total_price: totalPrice,
      notes,
    });

    setLoading(false);
    if (error) {
      toast.error("Gagal membuat booking: " + error.message);
    } else {
      toast.success("Booking berhasil dibuat!");
      navigate("/dashboard");
    }
  };

  const totalPrice = boat ? boat.base_price * passengers : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-6">Booking Kapal</h1>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Pilih Tanggal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detail Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="passengers">Jumlah Penumpang</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="passengers"
                      type="number"
                      min="1"
                      max={boat?.capacity || 100}
                      value={passengers}
                      onChange={(e) => setPassengers(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="time">Waktu Keberangkatan</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Tambahkan catatan untuk operator..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {boat && (
                  <>
                    <div>
                      <h3 className="font-semibold text-lg">{boat.name}</h3>
                      <p className="text-sm text-muted-foreground">{boat.description}</p>
                    </div>

                    <div className="space-y-2 py-4 border-y">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Harga per orang</span>
                        <span>Rp {boat.base_price.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jumlah penumpang</span>
                        <span>{passengers} orang</span>
                      </div>
                      {date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tanggal</span>
                          <span>{date.toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Waktu</span>
                        <span>{departureTime}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        Rp {totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold mb-1">Pembayaran DP 30%</p>
                          <p className="text-muted-foreground">
                            Bayar DP: Rp {(totalPrice * 0.3).toLocaleString('id-ID')}
                          </p>
                          <p className="text-muted-foreground">
                            Pelunasan di lokasi: Rp {(totalPrice * 0.7).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="hero" 
                      className="w-full" 
                      size="lg"
                      onClick={handleBooking}
                      disabled={loading || !date}
                    >
                      {loading ? "Memproses..." : "Lanjut ke Pembayaran"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;

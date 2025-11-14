import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Ship, DollarSign, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      fetchBookings(user.id);
    };
    checkAuth();
  }, [navigate]);

  const fetchBookings = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        boats (
          name,
          type,
          image_url
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Gagal memuat booking");
    } else {
      setBookings(data || []);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      pending: "secondary",
      confirmed: "default",
      completed: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Saya</h1>
          <p className="text-muted-foreground">Kelola semua booking Anda</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ship className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Belum ada booking</h3>
              <p className="text-muted-foreground mb-6">
                Mulai petualangan Anda dengan menjelajahi kapal yang tersedia
              </p>
              <Button variant="hero" onClick={() => navigate("/#boats")}>
                Jelajahi Kapal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">
                        {booking.boats?.name || "Kapal"}
                      </CardTitle>
                      <div className="flex gap-2">
                        {getStatusBadge(booking.booking_status)}
                        <Badge variant="outline">{booking.boats?.type}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        Rp {booking.total_price.toLocaleString('id-ID')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.payment_status === 'pending' ? 'Menunggu pembayaran' : 'Lunas'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Tanggal</div>
                        <div className="font-medium">
                          {new Date(booking.booking_date).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ship className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Penumpang</div>
                        <div className="font-medium">{booking.passengers} orang</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">DP Dibayar</div>
                        <div className="font-medium">
                          Rp {(booking.total_price * 0.3).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>
                  {booking.notes && (
                    <div className="bg-muted/50 p-3 rounded-lg mb-4">
                      <div className="text-sm text-muted-foreground mb-1">Catatan:</div>
                      <div className="text-sm">{booking.notes}</div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat Operator
                    </Button>
                    <Button variant="outline" size="sm">Detail</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

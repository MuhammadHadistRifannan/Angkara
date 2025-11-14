import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Ship, Calendar, DollarSign, Users, Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const [operator, setOperator] = useState<any>(null);
  const [boats, setBoats] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBoats: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
  });

  useEffect(() => {
    const checkOperator = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: operatorData } = await supabase
        .from("operators")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!operatorData) {
        toast.error("Anda belum terdaftar sebagai operator");
        navigate("/");
        return;
      }

      setOperator(operatorData);
      fetchBoats(operatorData.id);
      fetchBookings(operatorData.id);
    };
    checkOperator();
  }, [navigate]);

  const fetchBoats = async (operatorId: string) => {
    const { data, error } = await supabase
      .from("boats")
      .select("*")
      .eq("operator_id", operatorId);

    if (!error && data) {
      setBoats(data);
      setStats((prev) => ({ ...prev, totalBoats: data.length }));
    }
  };

  const fetchBookings = async (operatorId: string) => {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        boats!inner (
          operator_id,
          name
        )
      `)
      .eq("boats.operator_id", operatorId);

    if (!error && data) {
      setBookings(data);
      const totalRevenue = data.reduce((sum, b) => sum + b.total_price, 0);
      const pending = data.filter((b) => b.booking_status === "pending").length;
      setStats((prev) => ({
        ...prev,
        totalBookings: data.length,
        totalRevenue,
        pendingBookings: pending,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Operator</h1>
          <p className="text-muted-foreground">
            {operator?.company_name || "Kelola kapal dan booking Anda"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Kapal</p>
                  <p className="text-3xl font-bold">{stats.totalBoats}</p>
                </div>
                <Ship className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Booking</p>
                  <p className="text-3xl font-bold">{stats.totalBookings}</p>
                </div>
                <Calendar className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendapatan</p>
                  <p className="text-2xl font-bold">
                    Rp {(stats.totalRevenue / 1000000).toFixed(1)}jt
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold">{stats.pendingBookings}</p>
                </div>
                <Users className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="boats" className="space-y-6">
          <TabsList>
            <TabsTrigger value="boats">Kapal Saya</TabsTrigger>
            <TabsTrigger value="bookings">Booking</TabsTrigger>
            <TabsTrigger value="analytics">Analitik</TabsTrigger>
          </TabsList>

          <TabsContent value="boats" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Daftar Kapal</h2>
              <Button variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kapal
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boats.map((boat) => (
                <Card key={boat.id}>
                  <CardHeader>
                    <CardTitle>{boat.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipe:</span>
                        <span>{boat.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kapasitas:</span>
                        <span>{boat.capacity} orang</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Harga:</span>
                        <span>Rp {boat.base_price.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{boat.available ? "Tersedia" : "Tidak Tersedia"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Detail
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <h2 className="text-xl font-semibold">Booking Terbaru</h2>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{booking.boats?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.booking_date).toLocaleDateString('id-ID')} • {booking.passengers} penumpang
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          Rp {booking.total_price.toLocaleString('id-ID')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.booking_status}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">Terima</Button>
                      <Button variant="outline" size="sm">Tolak</Button>
                      <Button variant="outline" size="sm">Chat</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Statistik Performa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                    <h4 className="font-semibold mb-2">Ringkasan Bulan Ini</h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Booking</div>
                        <div className="text-2xl font-bold">{stats.totalBookings}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Pendapatan</div>
                        <div className="text-2xl font-bold">
                          Rp {(stats.totalRevenue / 1000000).toFixed(1)}jt
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Tingkat Hunian</div>
                        <div className="text-2xl font-bold">
                          {stats.totalBoats > 0 ? Math.round((stats.totalBookings / stats.totalBoats) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OperatorDashboard;

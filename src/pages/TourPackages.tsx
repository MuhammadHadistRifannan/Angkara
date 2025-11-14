import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Users, Package as PackageIcon, Star } from "lucide-react";
import { toast } from "sonner";

const TourPackages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const { data, error } = await supabase
      .from("tour_packages")
      .select("*")
      .eq("available", true);

    if (error) {
      toast.error("Gagal memuat paket tour");
    } else {
      setPackages(data || []);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Paket Wisata Tersedia
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pilih paket wisata siap pakai dengan harga terbaik dan pengalaman tak terlupakan
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-xl transition-all border-2 hover:border-primary/50">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex justify-between items-start mb-2">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                    <PackageIcon className="h-3 w-3 mr-1" />
                    Paket Tour
                  </Badge>
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1 fill-secondary" />
                    Populer
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">{pkg.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Durasi: {pkg.duration_hours} jam</span>
                  </div>
                  {pkg.max_participants && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Maksimal {pkg.max_participants} peserta</span>
                    </div>
                  )}
                </div>

                {pkg.includes && pkg.includes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-sm">Termasuk:</h4>
                    <div className="space-y-1">
                      {pkg.includes.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-primary">✓</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Harga mulai dari</div>
                      <div className="text-3xl font-bold text-primary">
                        Rp {pkg.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                  <Button variant="hero" className="w-full" onClick={() => navigate(`/booking?packageId=${pkg.id}`)}>
                    Booking Sekarang
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {packages.length === 0 && (
          <Card className="mt-8">
            <CardContent className="py-12 text-center">
              <PackageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Belum ada paket tour</h3>
              <p className="text-muted-foreground">
                Paket tour akan segera tersedia. Silakan cek kembali nanti.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TourPackages;

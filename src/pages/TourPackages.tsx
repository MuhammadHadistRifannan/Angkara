import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Users, Package as PackageIcon, Star, MapPin } from "lucide-react";
import { DEMO_PACKAGES } from "@/lib/demoFallback";

interface PagePackage {
  id: string;
  name: string;
  description: string | null;
  durationLabel: string;
  price: number;
  unit: string;
  includes: string[];
  destination: string;
  maxParticipants: number | null;
}

const mapRowToPackage = (row: any): PagePackage => ({
  id: row.id,
  name: row.name,
  description: row.description ?? null,
  durationLabel: row.duration_hours != null ? `${row.duration_hours} jam` : "-",
  price: row.price,
  unit: "/ orang",
  includes: row.includes || [],
  destination: row.destination || "",
  maxParticipants: row.max_participants ?? null,
});

const TourPackages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<PagePackage[]>([]);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("tour_packages")
        .select("*")
        .eq("available", true);
      if (!error && data && data.length > 0) {
        setPackages(data.map(mapRowToPackage));
        return;
      }
    } catch {
      // Supabase gagal — pakai data demo di bawah, jangan tampilkan toast error.
    }
    // PERBAIKAN 2026-11-18: fallback ke 8 paket demo yang sama dengan
    // section landing. Sebelumnya halaman ini menampilkan toast
    // "Gagal memuat paket tour" + grid kosong saat Supabase gagal, sehingga
    // semua tombol "Detail Rute" (8 kartu paket + 4 kartu destinasi) mati.
    setPackages(
      DEMO_PACKAGES.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        durationLabel: d.durationLabel,
        price: d.price,
        unit: d.unit,
        includes: d.includes,
        destination: d.destination,
        maxParticipants: null,
      }))
    );
  };

  return (
    <div className="min-h-screen bg-background">
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
                {pkg.destination && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 pt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Tujuan: {pkg.destination}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">{pkg.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Durasi: {pkg.durationLabel}</span>
                  </div>
                  {pkg.maxParticipants && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Maksimal {pkg.maxParticipants} peserta</span>
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
                        <span className="text-base font-semibold text-muted-foreground"> {pkg.unit}</span>
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

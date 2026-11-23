import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuthModal } from "@/components/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Users, Package as PackageIcon, Star, MapPin, Compass } from "lucide-react";
import { DEMO_PACKAGES } from "@/lib/demoFallback";
import { toast } from "sonner";
import imgTourPesisir from "@/assets/tour-pesisir-nusakambangan.jpg";
import imgTourMangroveSegara from "@/assets/dest-segara-anakan.png";
import imgTourFishingBoat from "@/assets/tour-fishing-boat.jpg";
import imgTourKarangRocks from "@/assets/tour-karang-bolong.png";
import imgTourKarangBeach from "@/assets/tour-karang-bolong-beach.jpg";
import imgTourMangroveBoat from "@/assets/tour-mangrove-boat.jpg";
import imgSunriseBoats from "@/assets/tour-sunrise-boats.jpg";
import imgKarangBolongSouth from "@/assets/tour-karang-bolong-south.jpg";

interface PagePackage {
  id: string;
  name: string;
  description: string | null;
  durationLabel: string;
  price: number;
  unit: string;
  includes: string[];
  destination: string;
  category: string | null;
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
  category: row.category ?? null,
  maxParticipants: row.max_participants ?? null,
});

// BATCH-6 2026-11-23: foto kartu paket — foto yang sama dengan kartu paket
// di landing dan halaman detail rute, dikunci ke UUID tetap paket (dipakai
// jalur Supabase seed maupun fallback demo).
const PKG_IMAGES_BY_ID: Record<string, string> = {
  "20000000-0000-4000-8000-000000000001": imgTourPesisir,
  "20000000-0000-4000-8000-000000000002": imgTourMangroveSegara,
  "20000000-0000-4000-8000-000000000003": imgTourFishingBoat,
  "20000000-0000-4000-8000-000000000004": imgTourKarangRocks,
  "20000000-0000-4000-8000-000000000005": imgTourKarangBeach,
  "20000000-0000-4000-8000-000000000006": imgTourMangroveBoat,
  "20000000-0000-4000-8000-000000000007": imgSunriseBoats,
  "20000000-0000-4000-8000-000000000008": imgKarangBolongSouth,
};

const CATEGORY_LABELS: Record<string, string> = {
  keluarga: "Wisata Keluarga",
  mangrove: "Ekowisata Mangrove",
  mancing: "Mancing & Mercusuar",
};

const getPackageImage = (pkg: PagePackage): string =>
  PKG_IMAGES_BY_ID[pkg.id] ?? imgTourPesisir;

const getCategoryLabel = (category: string | null): string =>
  (category && CATEGORY_LABELS[category]) || "Paket Tour";

const TourPackages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<PagePackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingPackageId, setPendingPackageId] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleBookingClick = async (pkgId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Silakan masuk ke akun Anda terlebih dahulu untuk memesan paket ini.");
      setPendingPackageId(pkgId);
      setAuthOpen(true);
      return;
    }
    navigate(`/booking?packageId=${encodeURIComponent(pkgId)}`);
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    if (pendingPackageId) {
      navigate(`/booking?packageId=${encodeURIComponent(pendingPackageId)}`);
      setPendingPackageId(null);
    }
  };

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("tour_packages")
        .select("*")
        .eq("available", true);
      if (!error && data && data.length > 0) {
        setPackages(data.map(mapRowToPackage));
        setIsLoading(false);
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
        category: d.category,
        maxParticipants: null,
      }))
    );
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-slate-900">
            Paket Wisata Tersedia
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pilih paket wisata siap pakai dengan harga terbaik dan pengalaman tak terlupakan
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-xl transition-all border-2 hover:border-primary/50 overflow-hidden">
              <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={getPackageImage(pkg)}
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-white">
                    <PackageIcon className="h-3 w-3 mr-1" />
                    {getCategoryLabel(pkg.category)}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1 fill-secondary" />
                    Populer
                  </Badge>
                </div>
              </div>
              <CardHeader>
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
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="w-full text-xs sm:text-sm font-semibold border-primary/30 hover:bg-primary/10"
                      onClick={() => navigate(`/route/${pkg.id}`)}
                    >
                      <Compass className="w-3.5 h-3.5 mr-1 text-primary" />
                      Detail Rute
                    </Button>
                    <Button
                      variant="hero"
                      className="w-full text-xs sm:text-sm font-semibold"
                      onClick={() => handleBookingClick(pkg.id)}
                    >
                      Booking Sekarang
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <Card className="mt-8">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Memuat paket tour…</p>
            </CardContent>
          </Card>
        ) : (
          packages.length === 0 && (
            <Card className="mt-8">
            <CardContent className="py-12 text-center">
              <PackageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Belum ada paket tour</h3>
              <p className="text-muted-foreground">
                Paket tour akan segera tersedia. Silakan cek kembali nanti.
              </p>
            </CardContent>
          </Card>
          )
        )}
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default TourPackages;

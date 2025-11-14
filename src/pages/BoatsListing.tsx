import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Users, Clock, MapPin, Shield, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
// import boatSpeedboat1 from "@/assets/boat-speedboat-1.jpg";
// import boatTraditional1 from "@/assets/boat-traditional-1.jpg";
// import boatSpeedboat2 from "@/assets/boat-speedboat-2.jpg";
// import boatTraditional2 from "@/assets/boat-traditional-2.jpg";
// import boatSpeedboat3 from "@/assets/boat-speedboat-3.jpg";
import boatSpeedboat1 from "@/assets/boat-speedboat-1.jpg";
import boatSpeedboat2 from "@/assets/boat-speedboat-2.jpg";
import boatSpeedboat3 from "@/assets/boat-speedboat-3.jpg";

import boatTraditional1 from "@/assets/boat-traditional-1.jpg";
import boatTraditional2 from "@/assets/boat-traditional-2.jpg";


type Boat = {
  id: string;
  name: string;
  description: string;
  type: string;
  capacity: number;
  base_price: number;
  location: string;
  features: string[];
  image_url?: string;
};

// const imageMap: Record<string, string> = {
//   '/src/assets/boat-speedboat-1.jpg': boatSpeedboat1,
//   '/src/assets/boat-traditional-1.jpg': boatTraditional1,
//   '/src/assets/boat-speedboat-2.jpg': boatSpeedboat2,
//   '/src/assets/boat-traditional-2.jpg': boatTraditional2,
//   '/src/assets/boat-speedboat-3.jpg': boatSpeedboat3,
// };

const imageMap: Record<string, string> = {
  "boat-speedboat-1.jpg": boatSpeedboat1,
  "boat-speedboat-2.jpg": boatSpeedboat2,
  "boat-speedboat-3.jpg": boatSpeedboat3,
  "boat-traditional-1.jpg": boatTraditional1,
  "boat-traditional-2.jpg": boatTraditional2,
};


const BoatsListing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [boats, setBoats] = useState<Boat[]>([]);
  const [filteredBoats, setFilteredBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  useEffect(() => {
    fetchBoats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [boats, searchTerm, typeFilter, locationFilter]);

  const fetchBoats = async () => {
    try {
      const { data, error } = await supabase
        .from("boats")
        .select("*")
        .eq("available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBoats(data || []);
    } catch (error: any) {
      toast.error("Gagal memuat kapal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = boats;

    if (searchTerm) {
      filtered = filtered.filter(
        (boat) =>
          boat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          boat.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((boat) => boat.type === typeFilter);
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter((boat) => boat.location === locationFilter);
    }

    setFilteredBoats(filtered);
  };

  const uniqueLocations = Array.from(new Set(boats.map((b) => b.location)));
  const uniqueTypes = Array.from(new Set(boats.map((b) => b.type)));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Semua Kapal Tersedia
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Temukan kapal yang sempurna untuk perjalanan Anda
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 bg-card border rounded-lg p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Cari kapal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Jenis Kapal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "speedboat" ? "Speedboat" : "Kapal Kayu"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Lokasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Lokasi</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Menampilkan {filteredBoats.length} dari {boats.length} kapal
          </p>
        </div>

        {/* Boats Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Memuat kapal...</p>
          </div>
        ) : filteredBoats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada kapal yang ditemukan</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBoats.map((boat) => (
              <Card
                key={boat.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer"
                onClick={() => navigate(`/boat/${boat.id}`)}
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden bg-muted">
                  {boat.image_url ? (
                    <img
                      src={imageMap[boat.image_url] || boat.image_url}
                      alt={boat.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <Badge className="absolute top-4 right-4 bg-accent text-white border-0">
                    <Shield className="h-3 w-3 mr-1" />
                    Terverifikasi
                  </Badge>
                  <Badge className="absolute top-4 left-4 bg-white text-primary">
                    {boat.type === "speedboat" ? "Speedboat" : "Kapal Kayu"}
                  </Badge>
                </div>

                <CardContent className="p-6">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-1">{boat.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {boat.description}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Kapasitas {boat.capacity} penumpang</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{boat.location}</span>
                    </div>
                  </div>

                  {/* Features */}
                  {boat.features && boat.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {boat.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {boat.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{boat.features.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <div className="text-sm text-muted-foreground">Mulai dari</div>
                      <div className="text-2xl font-bold text-primary">
                        Rp {boat.base_price.toLocaleString("id-ID")}
                        <span className="text-sm font-normal text-muted-foreground">/pax</span>
                      </div>
                    </div>
                    <Button
                      variant="hero"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/booking?boatId=${boat.id}`);
                      }}
                    >
                      Booking
                    </Button>
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

export default BoatsListing;

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock, MapPin, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import boatImage1 from "@/assets/boat-card-1.jpg";
import boatImage2 from "@/assets/boat-card-2.jpg";


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

const BoatListings = () => {
  const navigate = useNavigate();
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoats();
  }, []);

  const fetchBoats = async () => {
    try {
      const { data, error } = await supabase
        .from("boats")
        .select("*")
        .eq("available", true)
        .limit(3)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBoats(data || []);
    } catch (error: any) {
      toast.error("Gagal memuat kapal: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <section id="boats" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Kapal Populer di Cilacap
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pilihan terbaik dari operator terverifikasi dengan rating tertinggi
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Memuat kapal...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boats.map((boat) => (
              <Card
                key={boat.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer"
                onClick={() => navigate(`/boat/${boat.id}`)}
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  {boat.image_url ? (
                    <img
                      src={boat.image_url}
                      alt={boat.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src={boatImage1}
                      alt={boat.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
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
                        Rp {boat.base_price.toLocaleString('id-ID')}
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

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
            onClick={() => navigate('/boats')}
          >
            Lihat Semua Kapal
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BoatListings;

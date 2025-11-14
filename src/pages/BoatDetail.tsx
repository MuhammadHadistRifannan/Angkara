import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Star,
  Users,
  MapPin,
  Shield,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import boatSpeedboat1 from "@/assets/boat-speedboat-1.jpg";
import boatTraditional1 from "@/assets/boat-traditional-1.jpg";
import boatSpeedboat2 from "@/assets/boat-speedboat-2.jpg";
import boatTraditional2 from "@/assets/boat-traditional-2.jpg";
import boatSpeedboat3 from "@/assets/boat-speedboat-3.jpg";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReviewForm } from "@/components/ReviewForm";

type Boat = {
  id: string;
  name: string;
  description: string;
  type: string;
  capacity: number;
  base_price: number;
  location: string;
  features: string[];
  min_passengers: number;
  image_url?: string;
};

type Review = {
  id: string;
  rating: number;
  service_rating: number;
  safety_rating: number;
  comment: string;
  created_at: string;
  user_id: string;
};

const imageMap: Record<string, string> = {
  '/src/assets/boat-speedboat-1.jpg': boatSpeedboat1,
  '/src/assets/boat-traditional-1.jpg': boatTraditional1,
  '/src/assets/boat-speedboat-2.jpg': boatSpeedboat2,
  '/src/assets/boat-traditional-2.jpg': boatTraditional2,
  '/src/assets/boat-speedboat-3.jpg': boatSpeedboat3,
};

const BoatDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [boat, setBoat] = useState<Boat | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check user auth status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    if (id) {
      fetchBoatDetail();
      fetchReviews();
    }
  }, [id]);

  const fetchBoatDetail = async () => {
    try {
      const { data, error } = await supabase
        .from("boats")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setBoat(data);
    } catch (error: any) {
      toast.error("Gagal memuat detail kapal: " + error.message);
      navigate("/boats");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("boat_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <p className="text-center text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!boat) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative h-96 rounded-lg overflow-hidden bg-muted">
              {boat.image_url ? (
                <img
                  src={imageMap[boat.image_url] || boat.image_url}
                  alt={boat.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              <Badge className="absolute top-4 right-4 bg-accent text-white border-0">
                <Shield className="h-3 w-3 mr-1" />
                Terverifikasi KSOP
              </Badge>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">
                {boat.type === "speedboat" ? "Speedboat" : "Kapal Kayu"}
              </Badge>
              <h1 className="text-4xl font-bold mb-2">{boat.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{boat.location}</span>
              </div>
              <p className="text-muted-foreground">{boat.description}</p>
            </div>

            <Separator />

            {/* Specifications */}
            <div>
              <h3 className="font-semibold mb-4">Spesifikasi</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Kapasitas</p>
                    <p className="font-semibold">{boat.capacity} penumpang</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Minimum</p>
                    <p className="font-semibold">{boat.min_passengers} penumpang</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Features */}
            {boat.features && boat.features.length > 0 && (
              <>
                <div>
                  <h3 className="font-semibold mb-4">Fasilitas</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {boat.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Price & Booking */}
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Harga per orang</p>
                  <p className="text-4xl font-bold text-primary">
                    Rp {boat.base_price.toLocaleString("id-ID")}
                  </p>
                </div>
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate(`/booking?boatId=${boat.id}`)}
                >
                  Booking Sekarang
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Pembayaran DP 30%, pelunasan di lokasi
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Ulasan Pelanggan</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {renderStars(Math.round(Number(calculateAverageRating())))}
                </div>
                <span className="text-xl font-semibold">
                  {calculateAverageRating()}
                </span>
                <span className="text-muted-foreground">
                  ({reviews.length} ulasan)
                </span>
              </div>
            )}
          </div>

          {/* Review Form */}
          {user && (
            <div className="mb-8">
              <ReviewForm boatId={id!} onSuccess={fetchReviews} />
            </div>
          )}

          {!user && (
            <Card className="mb-8 p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Login untuk memberikan ulasan
              </p>
              <Button variant="hero" onClick={() => navigate("/auth")}>
                Login
              </Button>
            </Card>
          )}

          {reviewsLoading ? (
            <p className="text-center text-muted-foreground py-8">Memuat ulasan...</p>
          ) : reviews.length === 0 ? (
            <Card className="p-8">
              <p className="text-center text-muted-foreground">
                Belum ada ulasan untuk kapal ini. Jadilah yang pertama memberikan ulasan!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-white">
                        {review.user_id.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <p className="text-foreground mb-3">{review.comment}</p>

                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Layanan:</span>
                          <div className="flex items-center">
                            {renderStars(review.service_rating)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Keamanan:</span>
                          <div className="flex items-center">
                            {renderStars(review.safety_rating)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoatDetail;

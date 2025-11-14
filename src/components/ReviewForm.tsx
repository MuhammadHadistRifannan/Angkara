import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating harus minimal 1 bintang").max(5, "Rating maksimal 5 bintang"),
  service_rating: z.number().min(1, "Rating layanan harus minimal 1 bintang").max(5, "Rating maksimal 5 bintang"),
  safety_rating: z.number().min(1, "Rating keamanan harus minimal 1 bintang").max(5, "Rating maksimal 5 bintang"),
  comment: z.string()
    .trim()
    .min(10, "Komentar minimal 10 karakter")
    .max(1000, "Komentar maksimal 1000 karakter"),
});

type ReviewFormProps = {
  boatId: string;
  onSuccess: () => void;
};

export const ReviewForm = ({ boatId, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [safetyRating, setSafetyRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate inputs
      reviewSchema.parse({
        rating,
        service_rating: serviceRating,
        safety_rating: safetyRating,
        comment,
      });

      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Anda harus login terlebih dahulu");
        return;
      }

      // Check if user has completed booking for this boat
      const { data: bookings, error: bookingError } = await supabase
        .from("bookings")
        .select("id")
        .eq("user_id", user.id)
        .eq("boat_id", boatId)
        .eq("booking_status", "completed")
        .limit(1);

      if (bookingError) throw bookingError;

      if (!bookings || bookings.length === 0) {
        toast.error("Anda harus menyelesaikan booking terlebih dahulu untuk memberikan ulasan");
        return;
      }

      // Check if user already reviewed this boat
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", user.id)
        .eq("boat_id", boatId)
        .single();

      if (existingReview) {
        toast.error("Anda sudah memberikan ulasan untuk kapal ini");
        return;
      }

      // Insert review
      const { error: insertError } = await supabase
        .from("reviews")
        .insert({
          boat_id: boatId,
          user_id: user.id,
          booking_id: bookings[0].id,
          rating,
          service_rating: serviceRating,
          safety_rating: safetyRating,
          comment: comment.trim(),
        });

      if (insertError) throw insertError;

      toast.success("Ulasan berhasil ditambahkan!");
      setRating(0);
      setServiceRating(0);
      setSafetyRating(0);
      setComment("");
      onSuccess();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Gagal menambahkan ulasan: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(index + 1)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                index < value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Tulis Ulasan Anda</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <StarRating
                value={rating}
                onChange={setRating}
                label="Rating Keseluruhan *"
              />
              <StarRating
                value={serviceRating}
                onChange={setServiceRating}
                label="Rating Layanan *"
              />
              <StarRating
                value={safetyRating}
                onChange={setSafetyRating}
                label="Rating Keamanan *"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Komentar Anda *</Label>
            <Textarea
              id="comment"
              placeholder="Bagikan pengalaman Anda dengan kapal ini... (minimal 10 karakter)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-32"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/1000 karakter
            </p>
          </div>

          <Button
            type="submit"
            variant="hero"
            disabled={isSubmitting || !rating || !serviceRating || !safetyRating || !comment.trim()}
            className="w-full"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            * Anda hanya dapat memberikan ulasan jika sudah menyelesaikan booking
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

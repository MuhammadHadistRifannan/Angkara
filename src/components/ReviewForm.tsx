import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, ShieldCheck, CheckCircle2 } from "lucide-react";
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
  const [eligibility, setEligibility] = useState<"checking" | "eligible" | "already_reviewed" | "not_completed">("checking");
  const [completedBookingId, setCompletedBookingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkEligibility = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (!user) {
          setEligibility("not_completed");
          return;
        }

        // 1. Cek apakah user sudah pernah mengulas kapal ini
        const { data: existingReview } = await supabase
          .from("reviews")
          .select("id")
          .eq("user_id", user.id)
          .eq("boat_id", boatId)
          .maybeSingle();

        if (!isMounted) return;
        if (existingReview) {
          setEligibility("already_reviewed");
          return;
        }

        // 2. Cek apakah ada booking completed untuk kapal ini
        const { data: bookings } = await supabase
          .from("bookings")
          .select("id")
          .eq("user_id", user.id)
          .eq("boat_id", boatId)
          .eq("booking_status", "completed")
          .limit(1);

        if (!isMounted) return;
        if (bookings && bookings.length > 0) {
          setCompletedBookingId(bookings[0].id);
          setEligibility("eligible");
        } else {
          setEligibility("not_completed");
        }
      } catch {
        if (isMounted) setEligibility("not_completed");
      }
    };

    checkEligibility();

    return () => {
      isMounted = false;
    };
  }, [boatId]);

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

      const bookingIdToUse = completedBookingId;
      if (!bookingIdToUse) {
        // Fallback cek booking completed
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
      }

      // Insert review
      const { error: insertError } = await supabase
        .from("reviews")
        .insert({
          boat_id: boatId,
          user_id: user.id,
          booking_id: bookingIdToUse || undefined,
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
      setEligibility("already_reviewed");
      onSuccess();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        const msg = error instanceof Error ? error.message : String(error);
        toast.error("Gagal menambahkan ulasan: " + msg);
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

  if (eligibility === "checking") {
    return <p className="text-xs text-muted-foreground text-center py-4">Memeriksa riwayat pelayaran Anda...</p>;
  }

  if (eligibility === "already_reviewed") {
    return (
      <Card className="rounded-2xl border-emerald-200 bg-emerald-50/70 p-6 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
        <h4 className="font-bold text-sm text-emerald-950 mb-1">Ulasan Anda Telah Terdaftar</h4>
        <p className="text-xs text-emerald-700 max-w-md mx-auto">
          Terima kasih! Anda telah memberikan ulasan terverifikasi untuk armada kapal ini.
        </p>
      </Card>
    );
  }

  if (eligibility === "not_completed") {
    return (
      <Card className="rounded-2xl border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
        <ShieldCheck className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
        <h4 className="font-bold text-sm text-slate-900 mb-1">Ulasan Terverifikasi KSOP</h4>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Untuk menjaga transparansi dan reputasi nahkoda lokal, hanya wisatawan yang telah menyelesaikan trip/sewa dengan kapal ini yang dapat memberikan ulasan.
        </p>
      </Card>
    );
  }

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
            * Ulasan terverifikasi setelah pelayaran selesai
          </p>
        </form>
      </CardContent>
    </Card>
  );
};


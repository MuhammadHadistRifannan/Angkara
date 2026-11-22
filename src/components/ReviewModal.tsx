import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, ShieldCheck, HeartHandshake, Ship } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1, "Berikan rating keseluruhan minimal 1 bintang").max(5),
  safety_rating: z.number().min(1, "Berikan rating keselamatan minimal 1 bintang").max(5),
  service_rating: z.number().min(1, "Berikan rating layanan minimal 1 bintang").max(5),
  comment: z
    .string()
    .trim()
    .min(10, "Ulasan minimal 10 karakter agar bermanfaat bagi wisatawan lain")
    .max(1000, "Ulasan maksimal 1000 karakter"),
});

export interface ReviewBookingInfo {
  id: string;
  boat_id: string;
  booking_date: string;
  boats?: {
    name?: string;
    type?: string;
  } | null;
}

interface ReviewModalProps {
  booking: ReviewBookingInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [safetyRating, setSafetyRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      reviewSchema.parse({
        rating,
        safety_rating: safetyRating,
        service_rating: serviceRating,
        comment,
      });

      setIsSubmitting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Sesi telah berakhir, silakan login kembali.");
        return;
      }

      const { error } = await supabase.from("reviews").insert({
        booking_id: booking.id,
        boat_id: booking.boat_id,
        user_id: user.id,
        rating,
        safety_rating: safetyRating,
        service_rating: serviceRating,
        comment: comment.trim(),
      });

      if (error) {
        // Cek jika error duplicate unique constraint
        if (error.code === "23505" || error.message?.includes("unique")) {
          toast.error("Anda sudah pernah memberikan ulasan untuk pelayaran ini.");
        } else {
          toast.error(`Gagal mengirim ulasan: ${error.message}`);
        }
        return;
      }

      toast.success("Ulasan pelayaran berhasil dikirim! Terima kasih atas feedback Anda.");
      onOpenChange(false);
      onSuccess?.();
      setComment("");
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Terjadi kesalahan saat menyimpan ulasan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarInput = ({
    value,
    onChange,
    label,
    icon: Icon,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
    icon: React.ElementType;
  }) => {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-cyan-600" />
            <span>{label}</span>
          </Label>
          <span className="text-xs font-bold text-amber-500 font-mono">
            {value} / 5
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 hover:scale-110 transition-transform focus:outline-none"
              aria-label={`${label} ${star} Bintang`}
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= value
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300 hover:text-amber-200"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl bg-white border-slate-200 shadow-2xl">
        <DialogHeader className="p-6 bg-slate-900 text-white relative">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold uppercase tracking-wider">
              Ulasan Pelayaran Selesai
            </span>
          </div>
          <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
            <span>Beri Ulasan: {booking.boats?.name || "Kapal Wisata SUAR"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-300">
            Penilaian Anda membantu menjaga standar keselamatan KSOP dan reputasi nelayan pesisir Cilacap.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Rating Section */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <StarInput
              value={rating}
              onChange={setRating}
              label="Kepuasan Pelayaran Keseluruhan"
              icon={Ship}
            />
            <div className="border-t border-slate-200/60 pt-3">
              <StarInput
                value={safetyRating}
                onChange={setSafetyRating}
                label="Standar Keamanan & Rompi SOLAS"
                icon={ShieldCheck}
              />
            </div>
            <div className="border-t border-slate-200/60 pt-3">
              <StarInput
                value={serviceRating}
                onChange={setServiceRating}
                label="Pelayanan & Keramahan Nakhoda"
                icon={HeartHandshake}
              />
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="review-comment" className="text-xs font-semibold text-slate-800">
                Pengalaman & Komentar Anda
              </Label>
              <span className="text-[10px] text-slate-400">
                {comment.length}/1.000 karakter
              </span>
            </div>
            <Textarea
              id="review-comment"
              rows={4}
              placeholder="Ceritakan pengalaman berlayar Anda (misal: keramahan nakhoda, kenyamanan kapal, kepatuhan mengenakan rompi pelampung)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="rounded-xl border-slate-200 text-xs sm:text-sm focus-visible:ring-cyan-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl text-xs font-semibold border-slate-200 hover:bg-slate-100"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="hero"
              size="sm"
              disabled={isSubmitting}
              className="rounded-xl text-xs font-bold gap-2 px-5 shadow-md"
            >
              <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
              <span>{isSubmitting ? "Mengirim..." : "Kirim Ulasan"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

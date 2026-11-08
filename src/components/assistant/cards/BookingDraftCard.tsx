import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BookingDraftCard as BookingDraftCardType } from "../../../../supabase/functions/_shared/contracts";
import { supabase } from "@/integrations/supabase/client";
import { saveDraft, clearDraft } from "@/lib/bookingDraft";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Ship,
  Calendar,
  Clock,
  Users,
  CreditCard,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface Props {
  card: BookingDraftCardType;
  onBookingSuccess?: (bookingId: string) => void;
}

export const BookingDraftCard: React.FC<Props> = ({ card, onBookingSuccess }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  const mapRpcError = (msg: string): string => {
    if (msg.includes("not_authenticated")) {
      return "Anda harus masuk (login) terlebih dahulu untuk membuat pemesanan.";
    }
    if (msg.includes("boat_unavailable")) {
      return "Kapal yang dipilih saat ini tidak tersedia.";
    }
    if (msg.includes("date_in_past")) {
      return "Tanggal keberangkatan tidak boleh di masa lampau.";
    }
    if (msg.includes("invalid_passengers")) {
      return "Jumlah penumpang tidak valid untuk kapasitas kapal ini.";
    }
    if (msg.includes("not_enough_seats")) {
      return "Sisa kursi kapal tidak mencukupi untuk jumlah penumpang yang diminta.";
    }
    return msg || "Terjadi kesalahan saat memproses pemesanan Anda.";
  };

  const handleBookNow = async () => {
    if (isSubmitting || bookingSuccess) return;
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Belum login: simpan draf ke storage lalu arahkan ke halaman /auth
        saveDraft(card);
        toast.info("Silakan login terlebih dahulu untuk menyelesaikan pesanan.");
        navigate("/auth");
        return;
      }

      // Pengguna sudah login, panggil RPC create_booking
      const { data, error } = await supabase.rpc("create_booking", {
        p_boat_id: card.boatId,
        p_date: card.date,
        p_time: card.time,
        p_passengers: card.passengers,
        p_notes: null,
      });

      if (error) {
        const readableError = mapRpcError(error.message);
        setErrorMessage(readableError);
        toast.error(readableError);
        return;
      }

      // Berhasil
      clearDraft();
      setBookingSuccess(true);
      toast.success("Pemesanan berhasil dibuat!");

      if (data && typeof data === "object" && "id" in data && onBookingSuccess) {
        onBookingSuccess(String((data as { id: string }).id));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const readable = mapRpcError(msg);
      setErrorMessage(readable);
      toast.error(readable);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTunda = card.verdict === "tunda";

  return (
    <Card className="my-2 border-2 border-primary/20 shadow-md bg-card w-full">
      <CardHeader className="p-3 pb-2 bg-muted/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Ship className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{card.boatName}</span>
            </CardTitle>
            <div className="text-[11px] text-muted-foreground capitalize">
              Draf Reservasi ({card.boatType?.replace("_", " ") || "Kapal Wisata"})
            </div>
          </div>
          <Badge
            variant={isTunda ? "destructive" : card.verdict === "waspada" ? "outline" : "default"}
            className="text-[10px] px-1.5 py-0.5 flex items-center gap-1"
          >
            {isTunda ? (
              <>
                <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                <span>Cuaca: Tunda</span>
              </>
            ) : card.verdict === "waspada" ? (
              <>
                <AlertTriangle className="h-3 w-3 text-amber-500" aria-hidden="true" />
                <span className="text-amber-600 dark:text-amber-400">Cuaca: Waspada</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                <span>Cuaca: Aman</span>
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-3 text-xs">
        {/* Peringatan Cuaca Tunda */}
        {isTunda && (
          <Alert variant="destructive" className="py-2 px-3 border-destructive/50 bg-destructive/10 text-destructive text-xs">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle className="text-xs font-bold">Peringatan Keselamatan Maritim</AlertTitle>
            <AlertDescription className="text-[11px] leading-relaxed mt-0.5">
              Kondisi cuaca pada tanggal ini berstatus <strong>TUNDA</strong>. Anda tetap dapat melanjutkan pemesanan,
              namun keberangkatan berisiko ditunda otoritas pelabuhan demi keselamatan jiwa.
            </AlertDescription>
          </Alert>
        )}

        {/* Ringkasan Parameter Booking */}
        <div className="grid grid-cols-2 gap-2 bg-muted/40 p-2.5 rounded-lg">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <div>
              <span className="text-[10px] text-muted-foreground block">Tanggal (WIB)</span>
              <span className="font-medium">{card.date}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <div>
              <span className="text-[10px] text-muted-foreground block">Waktu Berangkat</span>
              <span className="font-medium">{card.time} WIB</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <div>
              <span className="text-[10px] text-muted-foreground block">Jumlah Penumpang</span>
              <span className="font-medium">{card.passengers} Orang</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            <div>
              <span className="text-[10px] text-muted-foreground block">Estimasi DP (30%)</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Rp {card.dpPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Total Harga */}
        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-muted-foreground">Total Tarif Sewa:</span>
          <span className="font-bold text-sm text-primary">
            Rp {card.totalPrice.toLocaleString("id-ID")}
          </span>
        </div>

        {/* Pesan Kesalahan jika ada */}
        {errorMessage && (
          <div className="p-2 bg-destructive/10 text-destructive rounded text-xs">
            {errorMessage}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 pt-0">
        {bookingSuccess ? (
          <div className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded font-semibold text-xs border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            <span>Pemesanan Berhasil Dibuat!</span>
          </div>
        ) : (
          <Button
            className="w-full text-xs font-semibold"
            variant={isTunda ? "default" : "hero"}
            size="sm"
            onClick={handleBookNow}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" aria-hidden="true" />
                <span>Memproses Pemesanan...</span>
              </>
            ) : (
              <span>Pesan Sekarang</span>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

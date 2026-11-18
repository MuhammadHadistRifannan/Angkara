import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Ship,
  Calendar,
  Clock,
  Users,
  MapPin,
  ShieldCheck,
  Printer,
  QrCode,
  AlertTriangle,
} from "lucide-react";

export interface ETicketData {
  id: string;
  booking_date: string;
  departure_time: string;
  passengers: number;
  total_price: number;
  booking_status: string;
  payment_status: string;
  notes?: string | null;
  boats?: {
    name: string;
    type: string;
    image_url?: string | null;
  } | null;
}

interface ETicketModalProps {
  booking: ETicketData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ETicketModal: React.FC<ETicketModalProps> = ({
  booking,
  open,
  onOpenChange,
}) => {
  if (!booking) return null;

  const ticketCode = `SUAR-${booking.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  const formattedDate = new Date(booking.booking_date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl bg-white text-slate-900">
        {/* Header Tiket Resmi */}
        <div className="bg-[#090D16] text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <DialogHeader className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Boarding Pass Digital Resmi
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                TERVERIFIKASI KSOP
              </Badge>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Ship className="h-6 w-6 text-cyan-400" />
              <span>E-Tiket Penyeberangan Wisata</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300">
              Tunjukkan boarding pass ini kepada petugas dermaga Pandanarang atau nakhoda kapal.
            </DialogDescription>
          </DialogHeader>

          {/* Barcode / Kode Tiket Header */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Kode Booking</span>
              <span className="font-mono text-base font-bold text-cyan-200 tracking-wider">
                {ticketCode}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] uppercase block">Status Tiket</span>
              <span className="font-bold uppercase text-emerald-400">
                {booking.booking_status === "confirmed" ? "Siap Berlayar" : booking.booking_status}
              </span>
            </div>
          </div>
        </div>

        {/* Badan Tiket & Detail Manifest */}
        <div className="p-6 space-y-6">
          {/* Detail Pelayaran */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-[11px] text-slate-500 block mb-0.5">Armada Kapal</span>
              <p className="font-bold text-slate-900 text-sm sm:text-base">
                {booking.boats?.name || "Kapal Wisata SUAR"}
              </p>
              <span className="text-[10px] text-slate-600 capitalize">
                Tipe: {booking.boats?.type === "speedboat" ? "Speedboat Fiber" : "Kapal Kayu Tradisional"}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-0.5">Rute Perjalanan</span>
              <p className="font-bold text-slate-900 text-sm sm:text-base">Teluk Penyu ⇄ Nusakambangan</p>
              <span className="text-[10px] text-slate-600">Perairan Pesisir Cilacap</span>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-0.5">
                <Calendar className="h-3.5 w-3.5 text-cyan-600" />
                <span>Jadwal Keberangkatan</span>
              </span>
              <p className="font-semibold text-slate-800 text-xs sm:text-sm">{formattedDate}</p>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] text-slate-500 flex items-center gap-1 mb-0.5">
                <Clock className="h-3.5 w-3.5 text-cyan-600" />
                <span>Waktu Berangkat</span>
              </span>
              <p className="font-semibold text-slate-800 text-xs sm:text-sm">
                Pukul {booking.departure_time.slice(0, 5)} WIB
              </p>
            </div>
          </div>

          {/* Standar Keselamatan & Titik Kumpul KSOP */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Alokasi Pelampung SOLAS Lengkap</span>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Tersedia <strong>{booking.passengers} Jaket Pelampung SOLAS</strong> terverifikasi untuk seluruh manifest rombongan Anda.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs">
              <MapPin className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Titik Kumpul Keberangkatan</span>
                <p className="text-sky-800 text-[11px] mt-0.5">
                  <strong>Pos Dermaga Pandanarang</strong>, Pantai Teluk Penyu Cilacap. Harap tiba 15 menit sebelum jam keberangkatan.
                </p>
              </div>
            </div>
          </div>

          {/* Rincian Muatan & Biaya */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="font-semibold text-slate-700">Jumlah Penumpang:</span>
              <span className="font-bold text-slate-900">{booking.passengers} Orang</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[11px] block">Total Biaya Sewa</span>
              <span className="font-bold text-slate-900 text-sm">
                Rp {booking.total_price.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {booking.notes && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <span className="text-slate-500 font-medium block mb-0.5">Catatan Khusus:</span>
              <p className="text-slate-800 italic">{booking.notes}</p>
            </div>
          )}

          {/* QR Code & Warning Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <QrCode className="h-8 w-8 text-slate-700" />
              <div className="text-[10px] leading-tight">
                <span>Pindai manifest</span>
                <br />
                <span className="font-mono text-slate-400">ID: {booking.id.slice(0, 12)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 text-xs font-semibold"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak / Simpan PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

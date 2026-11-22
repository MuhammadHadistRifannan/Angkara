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
    document.body.classList.add("printing-eticket");
    const cleanup = () => {
      document.body.classList.remove("printing-eticket");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl border border-slate-200 shadow-2xl bg-white text-slate-900 printable-eticket-dialog print:!border-none print:!shadow-none print:!w-full print:!max-w-full print:!m-0">
        {/* Header Tiket Resmi - Di layar bernuansa maritim elegan, di mode cetak berlatar putih bersih tanpa blok hitam */}
        <div className="eticket-header bg-[#090D16] text-white px-5 py-3.5 relative overflow-hidden print:!bg-white print:!text-slate-900 print:!border-b-2 print:!border-slate-800 print:!px-4 print:!py-3">
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />
          <DialogHeader className="relative z-10 text-left space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 print:!text-slate-600">
                Boarding Pass Digital Resmi
              </span>
              <Badge className="badge-ksop bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 print:!bg-emerald-50 print:!text-emerald-800 print:!border-emerald-300">
                TERVERIFIKASI KSOP
              </Badge>
            </div>
            <DialogTitle className="text-base sm:text-lg font-black tracking-tight text-white print:!text-slate-900 flex items-center gap-2">
              <Ship className="h-5 w-5 text-cyan-400 print:!text-slate-800 shrink-0" />
              <span>E-Tiket Penyeberangan Wisata</span>
            </DialogTitle>
            <DialogDescription className="text-[11px] text-slate-300 print:!text-slate-600 leading-tight">
              Tunjukkan boarding pass ini kepada petugas dermaga Pandanarang atau nakhoda kapal.
            </DialogDescription>
          </DialogHeader>

          {/* Barcode / Kode Tiket Header */}
          <div className="mt-2.5 pt-2 border-t border-white/10 print:!border-slate-300 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 print:!text-slate-500 text-[9px] uppercase block leading-none mb-0.5">
                Kode Booking
              </span>
              <span className="font-mono text-sm font-bold text-cyan-200 print:!text-slate-900 tracking-wider">
                {ticketCode}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 print:!text-slate-500 text-[9px] uppercase block leading-none mb-0.5">
                Status Tiket
              </span>
              <span className="font-bold uppercase text-emerald-400 print:!text-emerald-700 text-xs">
                {booking.booking_status === "confirmed" ? "Siap Berlayar" : booking.booking_status}
              </span>
            </div>
          </div>
        </div>

        {/* Badan Tiket & Detail Manifest - Kompak & pas di layar tanpa scroll */}
        <div className="p-4 sm:p-5 space-y-3 printable-eticket-body print:p-4 print:space-y-3">
          {/* Detail Pelayaran */}
          <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs print:bg-slate-50 print:border-slate-300">
            <div>
              <span className="text-[10px] text-slate-500 block">Armada Kapal</span>
              <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                {booking.boats?.name || "Kapal Wisata SUAR"}
              </p>
              <span className="text-[10px] text-slate-600 capitalize">
                Tipe: {booking.boats?.type === "speedboat" ? "Speedboat Fiber" : "Kapal Kayu Tradisional"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Rute Perjalanan</span>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">Teluk Penyu ⇄ Nusakambangan</p>
              <span className="text-[10px] text-slate-600">Perairan Pesisir Cilacap</span>
            </div>

            <div className="pt-1.5 border-t border-slate-200 flex items-center gap-1.5 text-[11px]">
              <Calendar className="h-3.5 w-3.5 text-cyan-600 print:text-slate-700 shrink-0" />
              <span className="font-semibold text-slate-800">{formattedDate}</span>
            </div>

            <div className="pt-1.5 border-t border-slate-200 flex items-center gap-1.5 text-[11px]">
              <Clock className="h-3.5 w-3.5 text-cyan-600 print:text-slate-700 shrink-0" />
              <span className="font-semibold text-slate-800">
                Pukul {booking.departure_time.slice(0, 5)} WIB
              </span>
            </div>
          </div>

          {/* Standar Keselamatan & Titik Kumpul (Dua Kolom Hemat Ruang) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-tight">
                <span className="font-bold block text-xs">Pelampung SOLAS Lengkap</span>
                <p className="text-emerald-800 text-[10px] mt-0.5">
                  Tersedia <strong>{booking.passengers} Jaket Pelampung SOLAS</strong> terverifikasi untuk manifest rombongan Anda.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px]">
              <MapPin className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="leading-tight">
                <span className="font-bold block text-xs">Pos Dermaga Pandanarang</span>
                <p className="text-sky-800 text-[10px] mt-0.5">
                  Pantai Teluk Penyu Cilacap. Harap tiba 15 menit sebelum jam keberangkatan.
                </p>
              </div>
            </div>
          </div>

          {/* Rincian Muatan & Biaya */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-600 text-[11px]">Jumlah Penumpang:</span>
              <span className="font-bold text-slate-900 text-xs">{booking.passengers} Orang</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[10px] mr-1.5">Total Biaya Sewa:</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                Rp {booking.total_price.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {booking.notes && (
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] leading-tight">
              <span className="text-slate-500 font-medium mr-1">Catatan Khusus:</span>
              <span className="text-slate-800 italic">{booking.notes}</span>
            </div>
          )}

          {/* QR Code & Tombol Cetak Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <QrCode className="h-7 w-7 text-slate-700 shrink-0" />
              <div className="text-[9px] leading-tight">
                <span className="font-semibold text-slate-700 block">Pindai Petugas Dermaga</span>
                <span className="font-mono text-slate-400">ID: {booking.id.slice(0, 10).toUpperCase()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 text-xs font-semibold h-8 px-3 print:hidden"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak / Simpan PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

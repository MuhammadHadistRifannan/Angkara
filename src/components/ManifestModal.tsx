import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Printer,
  ShieldCheck,
  Ship,
  Calendar,
  Clock,
  Users,
  Anchor,
  FileCheck2,
} from "lucide-react";

export interface ManifestBookingData {
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
  } | null;
}

export interface ManifestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: ManifestBookingData | null;
  operatorName?: string;
}

const DEFAULT_CHECKLIST = [
  {
    id: "solas_lifejackets",
    label: "Rompi pelampung standar SOLAS/ISO tersedia lengkap sejumlah penumpang & awak kapal.",
    required: true,
  },
  {
    id: "first_aid_signals",
    label: "Kotak P3K Maritim & senter isyarat darurat dalam kondisi siap pakai.",
    required: true,
  },
  {
    id: "engine_fuel",
    label: "Kondisi mesin kapal, kemudi, dan bahan bakar cadangan laik operasi.",
    required: true,
  },
  {
    id: "weather_telemetry",
    label: "Telemetri cuaca maritim BMKG & gelombang laut diverifikasi aman (< 1,25 m / 15 knot).",
    required: true,
  },
  {
    id: "spb_permit",
    label: "Surat Persetujuan Berlayar (SPB) Syahbandar KSOP Cilacap terverifikasi aktif.",
    required: true,
  },
];

export const ManifestModal: React.FC<ManifestModalProps> = ({
  open,
  onOpenChange,
  booking,
  operatorName = "Koperasi Nelayan Pandanarang Cilacap",
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    solas_lifejackets: true,
    first_aid_signals: true,
    engine_fuel: true,
    weather_telemetry: true,
    spb_permit: true,
  });

  if (!booking) return null;

  const ticketCode = `SUAR-${booking.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  const formattedDate = new Date(booking.booking_date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = `${booking.departure_time.slice(0, 5)} WIB`;
  const boatName = booking.boats?.name || "KM Wisata Pandanarang";
  const boatTypeLabel =
    booking.boats?.type === "speedboat" ? "Speedboat Cepat" : "Kapal Kayu Tradisional";

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const allCompliant = Object.values(checkedItems).every(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 text-slate-900 border-slate-200">
        <DialogHeader className="sr-only">
          <DialogTitle>Lembar Manifes Penumpang & Checklist Kelaikan KSOP</DialogTitle>
          <DialogDescription>
            Dokumen resmi manifes keberangkatan kapal wisata Teluk Penyu dan Nusakambangan.
          </DialogDescription>
        </DialogHeader>

        {/* PRINTABLE SHEET CONTAINER */}
        <div className="space-y-6 printable-manifest">
          {/* KOP RESMI KSOP KELAS II CILACAP */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Anchor className="h-6 w-6 text-slate-900" />
              <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-slate-500">
                KEMENTERIAN PERHUBUNGAN REPUBLIK INDONESIA
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-black tracking-tight uppercase text-slate-900">
              KANTOR KESYAHBANDARAN DAN OTORITAS PELABUHAN (KSOP) KELAS II CILACAP
            </h2>
            <p className="text-[11px] font-semibold text-slate-600">
              WILAYAH KERJA POS DERMAGA PANDANARANG - TELUK PENYU & PULAU NUSAKAMBANGAN
            </p>
            <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-black tracking-wider uppercase">
              LEMBAR MANIFES PENUMPANG & CHECKLIST KELAIKAN KAPAL WISATA
            </div>
          </div>

          {/* INFORMASI TIKET & ARMADA */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Nomor Tiket / Manifes</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{ticketCode}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Armada Kapal</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Ship className="h-3.5 w-3.5 text-cyan-700" />
                {boatName}
              </span>
              <span className="text-[10px] text-slate-500">{boatTypeLabel}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Mitra Operator</span>
              <span className="font-bold text-slate-900 truncate block">{operatorName}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Hari & Tanggal</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-600" />
                {formattedDate}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Jam Keberangkatan</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-600" />
                {formattedTime}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Pangkalan Dermaga</span>
              <span className="font-bold text-slate-900 truncate block">Pos Dermaga Pandanarang</span>
            </div>
          </div>

          {/* MANIFES PENUMPANG & ALOKASI PELAMPUANG */}
          <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-100 pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-800" />
                <span className="font-bold text-cyan-950 text-sm">
                  Total Rombongan: {booking.passengers} Orang Penumpang
                </span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-[11px] flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                <span>{booking.passengers} Jaket Pelampung SOLAS Siap</span>
              </Badge>
            </div>

            <div className="pt-1">
              <span className="font-bold text-slate-700 block mb-0.5">Catatan Khusus Wisatawan:</span>
              <p className="text-slate-600 italic">
                {booking.notes ? booking.notes : "Tidak ada catatan khusus (penumpang umum)."}
              </p>
            </div>
          </div>

          {/* CHECKLIST KEPATUHAN KESELAMATAN SYAHBANDAR KSOP */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-cyan-700" />
                <span>Checklist Kelaikan Harian Syahbandar KSOP:</span>
              </h3>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  allCompliant
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {allCompliant ? "Kelaikan Lengkap (Laik Laut)" : "Ada Poin Belum Dicentang"}
              </span>
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
              {DEFAULT_CHECKLIST.map((item) => {
                const isChecked = Boolean(checkedItems[item.id]);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer select-none"
                  >
                    <Checkbox
                      id={`chk-${item.id}`}
                      checked={isChecked}
                      onCheckedChange={() => toggleCheck(item.id)}
                      className="mt-0.5 data-[state=checked]:bg-cyan-700 data-[state=checked]:border-cyan-700"
                    />
                    <label
                      htmlFor={`chk-${item.id}`}
                      className="text-xs text-slate-800 font-medium leading-relaxed cursor-pointer"
                    >
                      {item.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LEMBAR PENGESAHAN DUA PIHAK (Nakhoda & Petugas Jaga) */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-center text-xs">
            <div className="space-y-12">
              <span className="text-slate-500 font-medium block">Nakhoda / Operator Kapal</span>
              <div className="border-b border-slate-400 w-36 mx-auto" />
              <span className="font-bold text-slate-800 block text-[11px]">
                ({operatorName})
              </span>
            </div>

            <div className="space-y-12">
              <span className="text-slate-500 font-medium block">Petugas Jaga Syahbandar KSOP</span>
              <div className="border-b border-slate-400 w-36 mx-auto" />
              <span className="font-bold text-slate-800 block text-[11px]">
                (Pos Dermaga Pandanarang)
              </span>
            </div>
          </div>
        </div>

        {/* DIALOG ACTIONS */}
        <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs font-semibold border-slate-200"
          >
            Tutup
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handlePrint}
            className="rounded-xl text-xs font-bold bg-[#090D16] hover:bg-slate-800 text-white gap-2 shadow-md px-4"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Manifes (Print)</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

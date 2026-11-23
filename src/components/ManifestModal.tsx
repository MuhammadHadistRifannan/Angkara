// MANIFEST-O1C-SUAR-2026-11-23 — klik lingkaran: toggle hanya di baris; kop pakai logo SUAR; print rapi.
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
  FileCheck2,
  CheckCircle2,
} from "lucide-react";

import logoSuar from "@/assets/logo-suar.png";

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
  onCheckIn?: (booking: ManifestBookingData) => void;
  isCheckingIn?: boolean;
}


const DEFAULT_CHECKLIST = [
  {
    id: "lifejackets",
    label: "Jaket pelampung tersedia sejumlah penumpang & awak kapal.",
    required: true,
  },
  {
    id: "first_aid_signals",
    label: "Kotak P3K & senter darurat siap dipakai.",
    required: true,
  },
  {
    id: "engine_fuel",
    label: "Mesin, kemudi, dan bahan bakar cadangan sudah siap.",
    required: true,
  },
  {
    id: "weather_telemetry",
    label: "Prakiraan gelombang & angin (Open-Meteo) sudah diperiksa.",
    required: true,
  },
  {
    id: "spb_permit",
    label: "Surat Persetujuan Berlayar (SPB) sudah diurus.",
    required: true,
  },
];

export const ManifestModal: React.FC<ManifestModalProps> = ({
  open,
  onOpenChange,
  booking,
    operatorName = "Koperasi Nelayan Pandanarang Cilacap",
  onCheckIn,
  isCheckingIn,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    lifejackets: false,
    first_aid_signals: false,
    engine_fuel: false,
    weather_telemetry: false,
    spb_permit: false,
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
    document.body.classList.add("printing-manifest");
    window.print();
    window.addEventListener(
      "afterprint",
      () => {
        document.body.classList.remove("printing-manifest");
      },
      { once: true }
    );
  };

  const allCompliant = Object.values(checkedItems).every(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 text-slate-900 border-slate-200 printable-manifest-dialog print:max-h-none print:overflow-visible print:p-0 print:border-none print:shadow-none print:w-full print:max-w-full">
        <DialogHeader className="sr-only">
          <DialogTitle>Daftar Penumpang & Cek Kapal</DialogTitle>
          <DialogDescription>
            Daftar penumpang untuk keberangkatan kapal wisata Teluk Penyu dan Nusakambangan.
          </DialogDescription>
        </DialogHeader>

        {/* PRINTABLE SHEET CONTAINER */}
        <div className="space-y-6 printable-manifest">
          {/* KOP LEMBAR MANIFES — OPERATOR */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <div className="flex items-center justify-center mb-1">
              <img
                src={logoSuar}
                alt="SUAR — Berlayar Aman, Berdaya Bersama"
                className="h-11 w-auto"
              />
            </div>
            <h2 className="text-sm sm:text-base font-black tracking-tight uppercase text-slate-900">
              {operatorName}
            </h2>
            <p className="text-[11px] font-semibold text-slate-600">
              POS DERMAGA PANDANARANG — TELUK PENYU & PULAU NUSAKAMBANGAN
            </p>
            <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-black tracking-wider uppercase">
              DAFTAR PENUMPANG & CEK KAPAL
            </div>
          </div>

          {/* INFORMASI TIKET & ARMADA */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Nomor Tiket</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{ticketCode}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Kapal</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Ship className="h-3.5 w-3.5 text-primary" />
                {boatName}
              </span>
              <span className="text-[10px] text-slate-500">{boatTypeLabel}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Operator</span>
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
              <span className="text-slate-500 font-medium block">Jam Berangkat</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-600" />
                {formattedTime}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Dermaga</span>
              <span className="font-bold text-slate-900 truncate block">Pos Dermaga Pandanarang</span>
            </div>
          </div>

          {/* MANIFES PENUMPANG & ALOKASI PELAMPUANG */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-bold text-slate-900 text-sm">
                  Total Penumpang: {booking.passengers} Orang
                </span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-[11px] flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                <span>{booking.passengers} Jaket Pelampung Siap</span>
              </Badge>
            </div>

            <div className="pt-1">
              <span className="font-bold text-slate-700 block mb-0.5">Catatan Wisatawan:</span>
              <p className="text-slate-600 italic">
                {booking.notes ? booking.notes : "Tidak ada catatan khusus (penumpang umum)."}
              </p>
            </div>
          </div>

          {/* CHECKLIST KELAIKAN HARIAN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-primary" />
                <span>Cek Kapal Sebelum Berlayar:</span>
              </h3>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  allCompliant
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {allCompliant ? "Sudah Dicek Semua" : "Masih Ada yang Belum Dicek"}
              </span>
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
              {DEFAULT_CHECKLIST.map((item) => {
                const isChecked = Boolean(checkedItems[item.id]);
                return (
                  <div
                    key={item.id}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={0}
                    onClick={() => toggleCheck(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        toggleCheck(item.id);
                      }
                    }}
                    className="flex items-start gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Checkbox
                      checked={isChecked}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="mt-0.5 pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-xs text-slate-800 font-medium leading-relaxed">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TANDA TANGAN NAKHODA / OPERATOR */}
          <div className="pt-4 border-t border-slate-200 text-center text-xs">
            <div className="space-y-12 print:space-y-8">
              <span className="text-slate-500 font-medium block">Nakhoda / Operator</span>
              <div className="border-b border-slate-400 w-36 mx-auto" />
              <span className="font-bold text-slate-800 block text-[11px]">
                ({operatorName})
              </span>
            </div>
          </div>
        </div>

        {/* DIALOG ACTIONS */}
        <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs font-semibold border-slate-200"
          >
            Tutup
          </Button>

          <div className="flex items-center gap-2">
  {booking &&
    booking.booking_status !== "completed" &&
    booking.booking_status !== "cancelled" &&
    onCheckIn && (
      <Button
        variant="default"
        size="sm"
        disabled={isCheckingIn}
        onClick={() => onCheckIn(booking)}
        className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md px-4"
      >
        <CheckCircle2 className="h-4 w-4" />
        <span>{isCheckingIn ? "Menyimpan..." : "Tandai Sudah Berangkat"}</span>
      </Button>
    )}

  <Button
    variant="default"
    size="sm"
    onClick={handlePrint}
    className="rounded-xl text-xs font-bold bg-[#090D16] hover:bg-slate-800 text-white gap-2 shadow-md px-4"
  >
    <Printer className="h-4 w-4" />
    <span>Cetak Daftar Penumpang</span>
  </Button>
</div>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

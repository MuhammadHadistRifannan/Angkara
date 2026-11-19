import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, Users, MapPin, Calendar, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_BOATS } from "@/lib/demoFallback";

interface BoatSearchModalProps {
  open: boolean;
  onClose: () => void;
  destination: string;
  date: string; // "YYYY-MM-DD" atau ""
  passengers: number;
}

function formatDateId(iso: string): string {
  if (!iso) return "Belum dipilih";
  const parts = iso.split("-").map((v) => parseInt(v, 10));
  if (parts.length !== 3 || parts.some((v) => !Number.isFinite(v))) return iso;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Popup hasil "Cari Kapal" di hero.
 *
 * Menampilkan kapal yang sesuai dengan pencarian: semua kapal berangkat
 * dari Teluk Penyu dan melayani keempat tujuan, jadi penyaringan yang
 * jujur di sini adalah kapasitas vs jumlah penumpang. Memilih kapal
 * membawa tanggal + penumpang ke halaman Booking (prefill), jadi nilai
 * form hero tidak lagi terbuang.
 *
 * Render lewat Portal (seperti AuthModal) supaya tidak terpengaruh
 * backdrop-blur / transform di sekitarnya.
 */
export const BoatSearchModal: React.FC<BoatSearchModalProps> = ({
  open,
  onClose,
  destination,
  date,
  passengers,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const matches = DEMO_BOATS.filter((b) => b.capacity >= passengers);
  const maxCapacity = Math.max(...DEMO_BOATS.map((b) => b.capacity));

  const chooseBoat = (boatId: string) => {
    const params = new URLSearchParams();
    params.set("boat", boatId);
    if (date) params.set("date", date);
    params.set("passengers", String(passengers));
    navigate(`/booking?${params.toString()}`);
  };

  const seeAllFleet = () => {
    onClose();
    setTimeout(() => {
      document.getElementById("boats")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Hasil pencarian kapal"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl my-8 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur px-6 pt-5 pb-4 border-b border-slate-100 rounded-t-3xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Kapal yang Tersedia
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {matches.length > 0
                  ? `${matches.length} kapal muat untuk ${passengers} penumpang`
                  : "Tidak ada kapal yang cocok"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-cyan-50 text-cyan-800 border border-cyan-100 rounded-full px-2.5 py-1">
              <MapPin className="h-3.5 w-3.5" />
              {destination}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 rounded-full px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateId(date)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 rounded-full px-2.5 py-1">
              <Users className="h-3.5 w-3.5" />
              {passengers} penumpang
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Semua kapal berangkat dari Teluk Penyu. Daftar di bawah sudah
            disaring berdasarkan jumlah penumpang.
          </p>
        </div>

        <div className="px-6 py-4">
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <Ship className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-900">
                Tidak ada kapal yang muat untuk {passengers} penumpang.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Kapasitas terbesar di armada: {maxCapacity} orang. Coba kurangi
                jumlah penumpang, atau lihat semua armada.
              </p>
              <Button variant="outline" className="mt-4" onClick={seeAllFleet}>
                Lihat Semua Armada
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {matches.map((boat) => (
                <li key={boat.id} className="flex items-center gap-3 py-3.5 first:pt-1 last:pb-1">
                  <div className="h-11 w-11 shrink-0 rounded-2xl bg-[#0B1528] text-white flex items-center justify-center">
                    <Ship className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">
                      {boat.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {boat.boatTypeTag} · {boat.captainName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Maks. {boat.capacity} penumpang
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900 text-sm">
                      Rp {boat.base_price.toLocaleString("id-ID")}
                    </p>
                    <p className="text-[11px] text-slate-500">/ orang (PP)</p>
                  </div>
                  <Button
                    variant="hero"
                    size="sm"
                    className="shrink-0"
                    onClick={() => chooseBoat(boat.id)}
                  >
                    Pilih Kapal
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-6 pb-5 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Harga per orang, pulang-pergi (PP) dari Teluk Penyu.
          </p>
          <Button variant="ghost" size="sm" onClick={seeAllFleet}>
            Lihat Semua Armada
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BoatSearchModal;

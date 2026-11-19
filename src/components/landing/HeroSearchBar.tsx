import React, { useState } from "react";
import { MapPin, Calendar, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BoatSearchModal } from "@/components/BoatSearchModal";

/**
 * Form "Cari Kapal" di hero Scrollcraft (Opsi A, 2026-11-19).
 *
 * Dulu hero Scrollcraft tidak punya form ini sama sekali — pengunjung
 * tidak bisa mencari kapal dari layar pertama. Form ini tampil sejak
 * step 0 (di bawah judul + chip cuaca) dan submit-nya membuka popup
 * hasil pencarian (BoatSearchModal), bukan sekadar scroll ke armada.
 * Nilai tujuan/tanggal/penumpang diteruskan ke Booking lewat popup.
 */
export const HeroSearchBar: React.FC = () => {
  const [destination, setDestination] = useState("Pantai Karang Bolong");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(2);
  const [searchOpen, setSearchOpen] = useState(false);

  // Tanggal hari ini (WIB, lokal — bukan UTC) sebagai batas minimal.
  const today = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(true);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl rounded-2xl bg-slate-950/55 backdrop-blur-md border border-white/20 shadow-2xl p-3 sm:p-4"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-cyan-300" />
              <span>Tujuan</span>
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full h-11 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 text-white font-medium backdrop-blur-sm"
            >
              <option value="Pantai Karang Bolong" className="bg-slate-900 text-white">
                Pantai Karang Bolong
              </option>
              <option value="Pantai Permisan" className="bg-slate-900 text-white">
                Pantai Permisan
              </option>
              <option value="Mercusuar Cimiring" className="bg-slate-900 text-white">
                Mercusuar Cimiring
              </option>
              <option value="Laguna Segara Anakan" className="bg-slate-900 text-white">
                Laguna Segara Anakan
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-cyan-300" />
              <span>Tanggal Berlayar</span>
            </label>
            <Input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 text-sm bg-white/10 border-white/20 rounded-xl text-white font-medium focus-visible:ring-cyan-400/50 [color-scheme:dark]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-cyan-300" />
              <span>Jumlah Penumpang</span>
            </label>
            <Input
              type="number"
              min={1}
              max={50}
              value={passengers}
              onChange={(e) =>
                setPassengers(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="h-11 text-sm bg-white/10 border-white/20 rounded-xl text-white font-medium focus-visible:ring-cyan-400/50 [color-scheme:dark]"
            />
          </div>

          <div className="space-y-1 flex flex-col justify-end">
            <Button
              type="submit"
              variant="hero"
              className="h-11 w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm shadow-lg hover:shadow-cyan-500/20"
            >
              <Search className="h-4 w-4" />
              <span>Cari Kapal</span>
            </Button>
          </div>
        </div>
      </form>

      <BoatSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        destination={destination}
        date={date}
        passengers={passengers}
      />
    </>
  );
};

export default HeroSearchBar;

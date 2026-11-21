import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Compass, Check, Sparkles, Ship } from "lucide-react";

export interface OperatorTourPackageData {
  id?: string;
  operator_id?: string;
  boat_id?: string | null;
  name: string;
  description?: string | null;
  duration_hours: number;
  price: number;
  includes?: string[] | null;
  max_participants?: number | null;
  available?: boolean | null;
  created_at?: string | null;
}

export interface TourPackageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operatorId: string;
  boats?: { id: string; name: string; capacity?: number; base_price?: number; available?: boolean }[];
  packageToEdit?: OperatorTourPackageData | null;
  onSaveSuccess: (savedPackage: OperatorTourPackageData) => void;
}

const AVAILABLE_INCLUDES = [
  "Pelampung SOLAS",
  "Pemandu Lokal",
  "Air Mineral & Snack",
  "Tiket Masuk Kawasan",
  "Alat Pancing Lengkap",
  "Alat Snorkeling",
  "Dokumentasi Foto",
  "Asuransi Wisatawan",
];

export const TourPackageModal: React.FC<TourPackageModalProps> = ({
  open,
  onOpenChange,
  operatorId,
  boats,
  packageToEdit,
  onSaveSuccess,
}) => {
  const isEdit = Boolean(packageToEdit?.id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [boatId, setBoatId] = useState("");
  const [availableBoats, setAvailableBoats] = useState<
    { id: string; name: string; capacity?: number; base_price?: number; available?: boolean }[]
  >([]);
  const [durationHours, setDurationHours] = useState<number | string>(2);
  const [price, setPrice] = useState<number | string>(350000);
  const [maxParticipants, setMaxParticipants] = useState<number | string>(10);
  const [includes, setIncludes] = useState<string[]>(["Pelampung SOLAS", "Pemandu Lokal"]);
  const [available, setAvailable] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil daftar kapal milik operator
  useEffect(() => {
    if (!open) return;
    if (boats && boats.length > 0) {
      setAvailableBoats(boats.filter((b) => b.available ?? true));
      return;
    }
    if (operatorId) {
      (async () => {
        try {
          const { data } = await supabase
            .from("boats")
            .select("id, name, capacity, base_price, available")
            .eq("operator_id", operatorId)
            .eq("available", true);
          if (data) {
            setAvailableBoats(data);
          }
        } catch {
          // Abaikan bila gagal
        }
      })();
    }
  }, [open, boats, operatorId]);

  useEffect(() => {
    if (packageToEdit) {
      setName(packageToEdit.name || "");
      setDescription(packageToEdit.description || "");
      setBoatId(packageToEdit.boat_id || "");
      setDurationHours(packageToEdit.duration_hours || 2);
      setPrice(packageToEdit.price || 350000);
      setMaxParticipants(packageToEdit.max_participants || 10);
      setIncludes(
        packageToEdit.includes && packageToEdit.includes.length > 0
          ? packageToEdit.includes
          : ["Pelampung SOLAS", "Pemandu Lokal"]
      );
      setAvailable(packageToEdit.available !== undefined && packageToEdit.available !== null ? packageToEdit.available : true);
    } else {
      setName("");
      setDescription("");
      setBoatId("");
      setDurationHours(2);
      setPrice(350000);
      setMaxParticipants(10);
      setIncludes(["Pelampung SOLAS", "Pemandu Lokal"]);
      setAvailable(true);
    }
  }, [packageToEdit, open]);

  const handleBoatChange = (selectedId: string) => {
    setBoatId(selectedId);
    const found = availableBoats.find((b) => b.id === selectedId);
    if (found && found.capacity) {
      setMaxParticipants(found.capacity);
    }
  };

  const toggleInclude = (item: string) => {
    setIncludes((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama paket wisata wajib diisi");
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error("Tarif paket harus berupa angka positif");
      return;
    }

    const numDuration = Number(durationHours);
    if (isNaN(numDuration) || numDuration <= 0) {
      toast.error("Durasi perjalanan harus berupa angka lebih dari 0");
      return;
    }

    const numParticipants = Number(maxParticipants) || 10;

    setIsSubmitting(true);
    try {
      if (isEdit && packageToEdit?.id) {
        const updatePayload = {
          name: name.trim(),
          description: description.trim() || null,
          boat_id: boatId || null,
          duration_hours: numDuration,
          price: numPrice,
          max_participants: numParticipants,
          includes,
          available,
        };

        const { error } = await supabase
          .from("tour_packages")
          .update(updatePayload)
          .eq("id", packageToEdit.id);

        if (error) throw error;

        toast.success(`Paket wisata "${name}" berhasil diperbarui`);
        onSaveSuccess({
          ...packageToEdit,
          ...updatePayload,
        });
      } else {
        const insertPayload = {
          operator_id: operatorId,
          name: name.trim(),
          description: description.trim() || null,
          boat_id: boatId || null,
          duration_hours: numDuration,
          price: numPrice,
          max_participants: numParticipants,
          includes,
          available,
        };

        const { data, error } = await supabase
          .from("tour_packages")
          .insert(insertPayload)
          .select()
          .single();

        if (error) throw error;

        toast.success(`Paket wisata "${name}" berhasil ditambahkan`);
        onSaveSuccess(data as OperatorTourPackageData);
      }

      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan paket wisata";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-white text-slate-900 border-slate-200">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-100 text-cyan-800">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-slate-900">
                {isEdit ? "Edit Paket Wisata" : "Tambah Paket Wisata Baru"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Atur nama rute perjalanan, durasi, fasilitas, dan harga paket wisata Anda.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Nama Paket Wisata */}
          <div className="space-y-1.5">
            <Label htmlFor="pkg-name" className="text-xs font-bold text-slate-700">
              Nama Paket Wisata *
            </Label>
            <Input
              id="pkg-name"
              placeholder="Contoh: Paket Sunset Teluk Penyu & Pantai Permisan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-slate-200 text-sm focus-visible:ring-cyan-500"
              required
            />
          </div>

          {/* Grid: Tarif Paket & Durasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pkg-price" className="text-xs font-bold text-slate-700">
                Tarif Paket (Rp) *
              </Label>
              <Input
                id="pkg-price"
                type="number"
                min="0"
                step="5000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-xl border-slate-200 text-sm focus-visible:ring-cyan-500"
                required
              />
              <p className="text-[11px] text-slate-500">Tarif charter kapal atau per pax</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pkg-duration" className="text-xs font-bold text-slate-700">
                Durasi Perjalanan (Jam) *
              </Label>
              <Input
                id="pkg-duration"
                type="number"
                min="0.5"
                step="0.5"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="rounded-xl border-slate-200 text-sm focus-visible:ring-cyan-500"
                required
              />
              <p className="text-[11px] text-slate-500">Estimasi waktu trip di laut</p>
            </div>
          </div>

          {/* Pilih Armada Kapal untuk Paket Ini */}
          <div className="space-y-1.5">
            <Label htmlFor="pkg-boat" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Ship className="h-3.5 w-3.5 text-cyan-600" />
              <span>Armada Kapal untuk Paket Ini</span>
            </Label>
            <select
              id="pkg-boat"
              value={boatId}
              onChange={(e) => handleBoatChange(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-slate-800"
            >
              <option value="">Pilih Kapal Armada (Opsional)</option>
              {availableBoats.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} (Kapasitas: {b.capacity} orang)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              Kapal yang dipilih akan otomatis disiapkan untuk wisatawan. Wisatawan tidak perlu dan tidak bisa memilih kapal saat booking.
            </p>
          </div>

          {/* Kapasitas Maksimal */}
          <div className="space-y-1.5">
            <Label htmlFor="pkg-participants" className="text-xs font-bold text-slate-700">
              Kapasitas Maksimal Peserta (Orang)
            </Label>
            <Input
              id="pkg-participants"
              type="number"
              min="1"
              max="50"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              className="rounded-xl border-slate-200 text-sm focus-visible:ring-cyan-500"
            />
            <p className="text-[11px] text-slate-500">Sesuai kapasitas kelaikan armada kapal Anda</p>
          </div>

          {/* Deskripsi Paket */}
          <div className="space-y-1.5">
            <Label htmlFor="pkg-description" className="text-xs font-bold text-slate-700">
              Deskripsi Pengalaman & Rute
            </Label>
            <textarea
              id="pkg-description"
              rows={3}
              placeholder="Jelaskan daya tarik, rute perahu, spot foto, dan keunikan paket wisata ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800"
            />
          </div>

          {/* Fasilitas Termasuk (Includes) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
              <span>Fasilitas Termasuk dalam Paket</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INCLUDES.map((item) => {
                const selected = includes.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInclude(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      selected
                        ? "bg-cyan-50 border-cyan-400 text-cyan-800 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {selected && <Check className="h-3.5 w-3.5 text-cyan-600" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ketersediaan Paket */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <Label className="text-xs font-bold text-slate-800 block">Status Ketersediaan</Label>
              <p className="text-[11px] text-slate-500">
                Paket yang aktif akan ditampilkan kepada wisatawan di katalog.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAvailable(!available)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                available
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-slate-100 border-slate-300 text-slate-600"
              }`}
            >
              {available ? "● Paket Aktif" : "○ Nonaktif"}
            </button>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs font-bold border-slate-200"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              {isSubmitting ? "Menyimpan..." : isEdit ? "Perbarui Paket" : "Simpan Paket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TourPackageModal;

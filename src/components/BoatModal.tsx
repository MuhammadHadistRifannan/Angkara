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
import { Ship, ShieldCheck, Anchor } from "lucide-react";

export interface OperatorBoatData {
  id?: string;
  operator_id?: string;
  name: string;
  type: string;
  capacity: number;
  base_price: number;
  location?: string;
  description?: string | null;
  features?: string[];
  available: boolean;
  image_url?: string | null;
}

export interface BoatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operatorId: string;
  boatToEdit?: OperatorBoatData | null;
  onSaveSuccess: (savedBoat: OperatorBoatData) => void;
}

const AVAILABLE_FEATURES = [
  "Pelampung SOLAS",
  "GPS Navigasi Maritim",
  "P3K Darurat",
  "Atap Kanopi Peneduh",
  "Tempat Duduk Berbusa",
  "Fasilitas Memancing",
];

export const BoatModal: React.FC<BoatModalProps> = ({
  open,
  onOpenChange,
  operatorId,
  boatToEdit,
  onSaveSuccess,
}) => {
  const isEdit = Boolean(boatToEdit?.id);

  const [name, setName] = useState("");
  const [type, setType] = useState<"speedboat" | "kapal_kayu">("kapal_kayu");
  const [capacity, setCapacity] = useState<number | string>(10);
  const [basePrice, setBasePrice] = useState<number | string>(350000);
  const [location, setLocation] = useState("Dermaga Pandanarang, Teluk Penyu");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string[]>(["Pelampung SOLAS"]);
  const [available, setAvailable] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (boatToEdit) {
      setName(boatToEdit.name || "");
      setType((boatToEdit.type as "speedboat" | "kapal_kayu") || "kapal_kayu");
      setCapacity(boatToEdit.capacity || 10);
      setBasePrice(boatToEdit.base_price || 350000);
      setLocation(boatToEdit.location || "Dermaga Pandanarang, Teluk Penyu");
      setDescription(boatToEdit.description || "");
      setFeatures(boatToEdit.features && boatToEdit.features.length > 0 ? boatToEdit.features : ["Pelampung SOLAS"]);
      setAvailable(boatToEdit.available !== undefined ? boatToEdit.available : true);
    } else {
      // Reset form ke nilai awal untuk Tambah Kapal Baru
      setName("");
      setType("kapal_kayu");
      setCapacity(10);
      setBasePrice(350000);
      setLocation("Dermaga Pandanarang, Teluk Penyu");
      setDescription("");
      setFeatures(["Pelampung SOLAS"]);
      setAvailable(true);
    }
  }, [boatToEdit, open]);

  const toggleFeature = (feat: string) => {
    setFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama kapal wajib diisi");
      return;
    }

    const numCapacity = Number(capacity);
    if (isNaN(numCapacity) || numCapacity <= 0) {
      toast.error("Kapasitas penumpang harus lebih dari 0");
      return;
    }

    const numPrice = Number(basePrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error("Tarif dasar sewa harus lebih dari Rp 0");
      return;
    }

    if (!isEdit && !operatorId) {
      toast.error("Profil operator Anda belum termuat. Silakan muat ulang halaman.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEdit && boatToEdit?.id) {
        const payload = {
          name: name.trim(),
          type,
          capacity: numCapacity,
          base_price: numPrice,
          location: location.trim(),
          description: description.trim(),
          features,
          available,
        };

        const { data, error } = await supabase
          .from("boats")
          .update(payload)
          .eq("id", boatToEdit.id)
          .select()
          .single();

        if (error) throw error;

        toast.success("Data kapal berhasil diperbarui");
        onSaveSuccess(data || { ...boatToEdit, ...payload });
      } else {
        const payload = {
          operator_id: operatorId,
          name: name.trim(),
          type,
          capacity: numCapacity,
          base_price: numPrice,
          location: location.trim(),
          description: description.trim(),
          features,
          available,
        };

        const { data, error } = await supabase
          .from("boats")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

        toast.success("Armada kapal baru berhasil ditambahkan");
        onSaveSuccess(
          data || {
            id: `temp-${Date.now()}`,
            ...payload,
          }
        );
      }

      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan kapal");
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 text-slate-900 border-slate-200">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-600">
            <Ship className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
              Registrasi Armada KSOP
            </span>
          </div>
          <DialogTitle className="text-xl font-black text-slate-900">
            {isEdit ? "Edit Spesifikasi Kapal" : "Tambah Armada Kapal Baru"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Pastikan spesifikasi kapal akurat untuk verifikasi keselamatan pelayaran dan manifes penumpang.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Nama Kapal */}
          <div className="space-y-1.5">
            <Label htmlFor="boat-name" className="text-xs font-bold text-slate-700">
              Nama Kapal <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="boat-name"
              placeholder="Contoh: KM Sri Rejeki 05"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl bg-slate-50 border-slate-200 text-sm h-10"
              required
            />
          </div>

          {/* Tipe & Kapasitas (Grid 2 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="boat-type" className="text-xs font-bold text-slate-700">
                Tipe Lambung Kapal
              </Label>
              <select
                id="boat-type"
                value={type}
                onChange={(e) => setType(e.target.value as "speedboat" | "kapal_kayu")}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="kapal_kayu">Kapal Kayu Tradisional</option>
                <option value="speedboat">Speedboat Cepat</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="boat-capacity" className="text-xs font-bold text-slate-700">
                Kapasitas Penumpang <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="boat-capacity"
                type="number"
                min={1}
                max={50}
                placeholder="10"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="rounded-xl bg-slate-50 border-slate-200 text-sm h-10"
                required
              />
            </div>
          </div>

          {/* Tarif Sewa Dasar & Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="boat-price" className="text-xs font-bold text-slate-700">
                Tarif Dasar Sewa (Rp) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="boat-price"
                type="number"
                min={10000}
                step={10000}
                placeholder="350000"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="rounded-xl bg-slate-50 border-slate-200 text-sm h-10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="boat-location" className="text-xs font-bold text-slate-700">
                Lokasi Pangkalan Dermaga
              </Label>
              <Input
                id="boat-location"
                placeholder="Dermaga Pandanarang, Teluk Penyu"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-xl bg-slate-50 border-slate-200 text-sm h-10"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <Label htmlFor="boat-desc" className="text-xs font-bold text-slate-700">
              Deskripsi Singkat Kapal
            </Label>
            <textarea
              id="boat-desc"
              rows={2}
              placeholder="Jelaskan fasilitas kenyamanan, kondisi mesin, atau spesifikasi kapal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Checklist Fasilitas Keselamatan & Kenyamanan */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 block">
              Fasilitas Keselamatan & Tambahan:
            </Label>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {AVAILABLE_FEATURES.map((feat) => {
                const checked = features.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleFeature(feat)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium text-left transition-all ${
                      checked
                        ? "bg-cyan-50 border-cyan-300 text-cyan-900 font-semibold"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ShieldCheck
                      className={`h-4 w-4 shrink-0 ${
                        checked ? "text-cyan-600" : "text-slate-400"
                      }`}
                    />
                    <span className="truncate">{feat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Kelaikan (Tersedia Berlayar vs Docking) */}
          <div className="pt-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Status Kelaikan Operasional:
                </span>
                <span className="text-[11px] text-slate-500">
                  {available ? "Kapal aktif & dapat dipesan wisatawan" : "Sedang docking / dalam perbaikan"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAvailable(!available)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  available
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-300 text-slate-700"
                }`}
              >
                {available ? "Tersedia Berlayar" : "Docking / Perawatan"}
              </button>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs font-semibold border-slate-200"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl text-xs font-bold bg-[#090D16] hover:bg-slate-800 text-white gap-2 shadow-md"
            >
              <Anchor className="h-4 w-4" />
              <span>{isEdit ? "Simpan Perubahan" : "Simpan Kapal"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Key, Sparkles } from "lucide-react";
import { toast } from "sonner";

export interface AiApiKeyFormData {
  id?: string;
  name: string;
  provider: string;
  api_key: string;
  priority: number;
  tokens_limit: number | null;
  status: "ACTIVE" | "INACTIVE" | "DEPLETED" | "ERROR";
}

interface AiApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AiApiKeyFormData | null;
  onSave: (data: AiApiKeyFormData) => Promise<void>;
}

export const AiApiKeyDialog: React.FC<AiApiKeyDialogProps> = ({
  open,
  onOpenChange,
  initialData,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("GOOGLE");
  const [apiKey, setApiKey] = useState("");
  const [priority, setPriority] = useState(0);
  const [tokensLimit, setTokensLimit] = useState<string>("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "DEPLETED" | "ERROR">("ACTIVE");
  const [showKey, setShowKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!initialData?.id;

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name || "");
        setProvider(initialData.provider || "GOOGLE");
        setApiKey(initialData.api_key || "");
        setPriority(initialData.priority ?? 0);
        setTokensLimit(initialData.tokens_limit !== null ? String(initialData.tokens_limit) : "");
        setStatus(initialData.status || "ACTIVE");
      } else {
        setName("");
        setProvider("GOOGLE");
        setApiKey("");
        setPriority(0);
        setTokensLimit("");
        setStatus("ACTIVE");
      }
      setShowKey(false);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama kunci API wajib diisi");
      return;
    }
    if (!apiKey.trim()) {
      toast.error("Kunci API wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: initialData?.id,
        name: name.trim(),
        provider,
        api_key: apiKey.trim(),
        priority: Number(priority) || 0,
        tokens_limit: tokensLimit.trim() ? Number(tokensLimit) : null,
        status,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Gagal menyimpan kunci: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl">
        <DialogHeader>
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-1">
            <Key className="h-5 w-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">
            {isEdit ? "Edit AI API Key" : "Tambah AI API Key"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Kunci ini akan digunakan oleh mesin Juru Mudi AI untuk rotasi otomatis dan failover saat kuota habis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <Label htmlFor="key-name" className="text-xs font-bold text-slate-700">
              Nama Kunci / Label Akun
            </Label>
            <Input
              id="key-name"
              placeholder="Contoh: Gemini Flash Akun 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 text-xs rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="provider" className="text-xs font-bold text-slate-700">
                Provider
              </Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger id="provider" className="mt-1 text-xs rounded-xl">
                  <SelectValue placeholder="Pilih provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOOGLE">Google Gemini</SelectItem>
                  <SelectItem value="GROQ">Groq Cloud</SelectItem>
                  <SelectItem value="OPENAI">OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority" className="text-xs font-bold text-slate-700">
                Prioritas (0 = Teratas)
              </Label>
              <Input
                id="priority"
                type="number"
                min="0"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value, 10) || 0)}
                className="mt-1 text-xs rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="api-key" className="text-xs font-bold text-slate-700">
              Kunci API (API Key)
            </Label>
            <div className="relative mt-1">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="text-xs rounded-xl pr-9 font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Disimpan di tabel berproteksi RLS khusus admin dan Edge Function.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tokens-limit" className="text-xs font-bold text-slate-700">
                Batas Token (Opsional)
              </Label>
              <Input
                id="tokens-limit"
                type="number"
                placeholder="Kosongkan jika ∞"
                value={tokensLimit}
                onChange={(e) => setTokensLimit(e.target.value)}
                className="mt-1 text-xs rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="status" className="text-xs font-bold text-slate-700">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as "ACTIVE" | "INACTIVE" | "DEPLETED" | "ERROR")}
              >
                <SelectTrigger id="status" className="mt-1 text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE (Aktif)</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE (Nonaktif)</SelectItem>
                  <SelectItem value="DEPLETED">DEPLETED (Habis Kuota)</SelectItem>
                  <SelectItem value="ERROR">ERROR (Galat)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs"
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="hero"
              className="rounded-xl text-xs gap-1.5"
              disabled={isSubmitting}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambahkan Kunci"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageList, type UiMessage } from "./MessageList";
import { sendMessage, AssistantError } from "@/lib/assistantClient";
import { loadDraft } from "@/lib/bookingDraft";
import type { ChatMessage } from "../../../supabase/functions/_shared/contracts";
import { Bot, Send, X, RefreshCw, AlertCircle, Compass, Zap } from "lucide-react";
import { Mascot } from "@/components/illustrations/Mascot";
import { supabase } from "@/integrations/supabase/client";
import { AuthModal } from "@/components/AuthModal";

// ============================================================================
// AssistantWidget (dipatch) — 2 perubahan vs upstream:
//  1. LOGIN GATE: tombol mengambang & pengiriman pesan butuh login. Kalau belum
//     login, yang terbuka adalah popup login (AuthModal) di halaman yang sama,
//     bukan halaman /auth. Setelah login, chat terbuka dan pertanyaan tersimpan
//     di sessionStorage langsung terisi. Sebelumnya widget ini bisa dipakai
//     tanpa login, sehingga gate di Hero / AskBeforeSailing bisa dilewati.
//  2. TAMPILAN disamakan dengan jendela "Juru Mudi AI" di section contoh:
//     header navy #0B1528 (bukan gradien biru), judul "Juru Mudi AI",
//     tombol mengambang navy, tombol kirim navy.
// ============================================================================

const SUGGESTIONS = [
  "Cari kapal untuk 6 orang akhir pekan ini",
  "Bagaimana kondisi cuaca dan gelombang di Teluk Penyu?",
  "Kapan hari paling aman untuk menyeberang ke Nusakambangan?",
];

interface AssistantWidgetProps {
  hideFloatingTrigger?: boolean;
}

export const AssistantWidget: React.FC<AssistantWidgetProps> = ({
  hideFloatingTrigger = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Periksa dan pulihkan draf pemesanan saat inisialisasi
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setMessages([
        {
          id: "draft-restore",
          role: "assistant",
          content:
            "Selamat datang kembali! Draf pemesanan Anda sebelumnya telah dipulihkan. Silakan tinjau dan klik 'Pesan Sekarang' untuk melanjutkan.",
          cards: [draft],
        },
      ]);
      setIsOpen(true);
    }

    if (typeof supabase.auth.getSession === "function") {
      supabase.auth.getSession().then(({ data }) => {
        const loggedIn = !!data?.session;
        setAuthed(loggedIn);
        if (!loggedIn) return;
        try {
          const pendingPrompt = sessionStorage.getItem("pending_assistant_prompt");
          if (pendingPrompt) {
            sessionStorage.removeItem("pending_assistant_prompt");
            setInputText(pendingPrompt);
            setIsOpen(true);
          }
        } catch (e) {
          console.warn("Gagal membaca pending_assistant_prompt:", e);
        }
      });
    }
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Dengarkan event eksternal "open-assistant" (misal dari tombol "Tanya Juru Mudi AI" di peta)
  useEffect(() => {
    const onOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      // Prompt sudah disimpan pemanggil di sessionStorage; kalau belum login,
      // buka popup login dulu, chat dibuka setelah login berhasil.
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) {
          setAuthOpen(true);
          return;
        }
        setIsOpen(true);
        if (customEvent.detail?.prompt) {
          setInputText(customEvent.detail.prompt);
        }
      });
    };

    window.addEventListener("open-assistant", onOpenEvent);
    return () => {
      window.removeEventListener("open-assistant", onOpenEvent);
    };
  }, []);

  // Auto-scroll ke bawah saat ada pesan baru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, errorMessage]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading) return;

    // Chat butuh login: simpan pesan, buka popup login, jangan kirim.
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      try {
        sessionStorage.setItem("pending_assistant_prompt", textToSend);
      } catch (e) {
        console.warn("Gagal menyimpan prompt:", e);
      }
      setInputText(textToSend);
      setAuthOpen(true);
      return;
    }

    // Batasi input 1.000 karakter
    if (textToSend.length > 1000) {
      setErrorMessage("Pesan melebihi batas 1.000 karakter.");
      return;
    }

    setErrorMessage(null);
    setInputText("");

    const userMsg: UiMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Siapkan riwayat untuk dikirim ke agen (maksimal 20 pesan)
      const historyToSend: ChatMessage[] = newMessages.slice(-20).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await sendMessage(historyToSend);

      const assistantMsg: UiMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: reply.text,
        cards: reply.cards,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      if (err instanceof AssistantError) {
        setErrorMessage(err.message);
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(msg || "Gagal menghubungi asisten.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    setAuthed(true);
    try {
      const prompt = sessionStorage.getItem("pending_assistant_prompt");
      if (prompt) {
        sessionStorage.removeItem("pending_assistant_prompt");
        setInputText(prompt);
      }
    } catch (e) {
      console.warn("Gagal membaca prompt tersimpan:", e);
    }
    setIsOpen(true);
  };

  const handleOpenClick = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setAuthOpen(true);
      return;
    }
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    if (hideFloatingTrigger) {
      return null;
    }

    return (
      <>
        <Button
          variant="hero"
          size="lg"
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-2xl z-50 p-0 flex items-center justify-center bg-[#0B1528] hover:bg-[#1E293B] transition-transform hover:scale-105 active:scale-95"
          onClick={handleOpenClick}
          aria-label="Buka Chat Juru Mudi AI"
        >
          <Mascot mood="wave" size={42} />
        </Button>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
      </>
    );
  }

  return (
    <>
    <Card className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 shadow-2xl z-50 h-[600px] max-h-[85vh] flex flex-col rounded-3xl border border-slate-200/90 overflow-hidden">
      {/* Header — sama seperti jendela "Juru Mudi AI" di section contoh */}
      <CardHeader className="bg-[#0B1528] text-white px-5 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-sm font-bold tracking-tight">
            <span className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-cyan-950/70 border border-cyan-400/30">
              <Mascot mood="happy" size={28} />
            </span>
            <span>Juru Mudi AI</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              Teluk Penyu
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-7 w-7 rounded-full"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup Chat Juru Mudi AI"
          >
            <X className="h-4 w-4" />
          </Button>
          </div>
        </div>
      </CardHeader>

      {/* Konten Pesan */}
      {messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-center items-center text-center space-y-4">
          <div className="flex items-center justify-center -mb-1" aria-hidden="true">
            <Mascot mood="happy" size={72} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Halo! Saya Si Suar (Juru Mudi AI)</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[260px] leading-relaxed">
              Asisten pintar pelayaran dan wisata bahari SUAR di perairan Cilacap &amp; Nusakambangan.
            </p>
          </div>

          <div className="w-full space-y-2 pt-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block text-left px-1">
              Pertanyaan Populer:
            </span>
            {SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                className="w-full text-left text-xs p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/80 text-foreground transition-colors leading-snug"
                onClick={() => handleSend(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onSelectPrompt={(prompt) => handleSend(prompt)}
          scrollRef={scrollRef}
        />
      )}

      {/* Error Banner jika gagal */}
      {errorMessage && (
        <div className="p-3 bg-destructive/10 border-t border-destructive/20 text-destructive text-xs flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Mascot mood="worried" size={24} className="shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-destructive hover:bg-destructive/10 shrink-0 text-xs"
            onClick={() => handleSend()}
          >
            <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" />
            <span>Coba Lagi</span>
          </Button>
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 border-t bg-background flex-shrink-0 space-y-1.5">
        <div className="flex gap-2">
          <Input
            placeholder="Tanyakan jadwal, kapal, atau cuaca..."
            value={inputText}
            maxLength={1000}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="text-xs h-9"
            aria-label="Input pesan untuk Juru Mudi AI"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            size="icon"
            className="h-9 w-9 shrink-0 bg-[#0B1528] hover:bg-[#1E293B] text-white"
            aria-label="Kirim Pesan"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {inputText.length > 800 && (
          <div className="text-[10px] text-muted-foreground text-right">
            {inputText.length}/1.000 karakter
          </div>
        )}
      </div>
    </Card>
    <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageList, type UiMessage } from "./MessageList";
import { sendMessage, AssistantError } from "@/lib/assistantClient";
import { loadDraft } from "@/lib/bookingDraft";
import type { ChatMessage } from "../../../supabase/functions/_shared/contracts";
import { Bot, Send, X, RefreshCw, AlertCircle, Compass } from "lucide-react";

const SUGGESTIONS = [
  "Cari kapal untuk 6 orang akhir pekan ini",
  "Bagaimana kondisi cuaca dan gelombang di Teluk Penyu?",
  "Kapan hari paling aman untuk menyeberang ke Nusakambangan?",
];

export const AssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  }, []);

  // Dengarkan event eksternal "open-assistant" (misal dari tombol "Tanya Juru Mudi" di peta)
  useEffect(() => {
    const onOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.prompt) {
        setInputText(customEvent.detail.prompt);
      }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="hero"
        size="lg"
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-2xl z-50 p-0 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        onClick={() => setIsOpen(true)}
        aria-label="Buka Chat Juru Mudi"
      >
        <Bot className="h-7 w-7 text-white" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 shadow-2xl z-50 h-[600px] max-h-[85vh] flex flex-col border border-primary/20 overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-primary to-accent text-white p-3.5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Bot className="h-5 w-5" aria-hidden="true" />
            <span>Juru Mudi</span>
            <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-normal">
              AI Maritim
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-7 w-7 rounded-full"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup Chat Juru Mudi"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Konten Pesan */}
      {messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-center items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Compass className="h-6 w-6 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Halo! Saya Juru Mudi</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[260px] leading-relaxed">
              Asisten pintar pelayaran dan wisata bahari Angkara di perairan Cilacap & Nusakambangan.
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
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
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
            aria-label="Input pesan untuk Juru Mudi"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            size="icon"
            variant="hero"
            className="h-9 w-9 shrink-0"
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
  );
};

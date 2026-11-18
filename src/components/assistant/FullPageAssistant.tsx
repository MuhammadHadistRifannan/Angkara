import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageList, type UiMessage } from "./MessageList";
import { sendMessage } from "@/lib/assistantClient";
import { loadDraft } from "@/lib/bookingDraft";
import type { ChatMessage } from "../../../supabase/functions/_shared/contracts";
import { Bot, Send, RefreshCw, AlertCircle, Compass, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Cari kapal untuk 6 orang akhir pekan ini",
  "Bagaimana kondisi cuaca dan gelombang di Teluk Penyu?",
  "Kapan hari paling aman untuk menyeberang ke Nusakambangan?",
  "Apakah kapal kayu aman untuk anak-anak dan lansia?",
];

export const FullPageAssistant: React.FC = () => {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Periksa draf pemesanan dan pending prompt dari sessionStorage
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
    }

    try {
      const pendingPrompt = sessionStorage.getItem("pending_assistant_prompt");
      if (pendingPrompt) {
        sessionStorage.removeItem("pending_assistant_prompt");
        handleSend(pendingPrompt);
      }
    } catch (e) {
      console.warn("Gagal membaca pending_assistant_prompt:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menghubungi Juru Mudi.";
      setErrorMessage(msg);
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

  return (
    <div className="flex flex-col h-[750px] max-h-[80vh] bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden text-slate-900">
      {/* Header Elegan Navigasi Gemini / ChatGPT style */}
      <div className="bg-[#090D16] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Bot className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base tracking-tight text-white">Juru Mudi AI</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                Gemini 2.0 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Asisten Cerdas Navigasi & Cuaca Maritim Cilacap
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>BMKG Tunggul Wulung Synced</span>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center items-center text-center max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-cyan-100 flex items-center justify-center text-cyan-700 shadow-inner">
              <Compass className="h-8 w-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Halo! Mau berlayar ke mana hari ini?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Saya terhubung langsung ke database armada kapal resmi KSOP dan telemetri gelombang laut BMKG. Tanyakan apapun untuk merencanakan trip Anda dengan aman.
              </p>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="w-full space-y-2 text-left">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-1">
                Pertanyaan Populer:
              </span>
              <div className="grid sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(suggestion)}
                    className="p-3 text-left rounded-xl bg-white border border-slate-200/80 hover:border-cyan-400 hover:shadow-md text-xs font-medium text-slate-700 hover:text-slate-900 transition-all leading-snug group flex items-start gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-cyan-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              onSelectPrompt={(prompt) => handleSend(prompt)}
              scrollRef={scrollRef}
            />
          </div>
        )}

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span className="truncate">{errorMessage}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2.5 text-rose-700 hover:bg-rose-100 shrink-0 text-xs font-semibold"
              onClick={() => handleSend()}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              <span>Coba Lagi</span>
            </Button>
          </div>
        )}

        {/* Input Bar Section */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0 space-y-2">
          <div className="flex gap-2 max-w-4xl mx-auto items-center">
            <Input
              placeholder="Tanyakan rute kapal, perkiraan cuaca, atau rekomendasi jadwal..."
              value={inputText}
              maxLength={1000}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="h-11 px-4 text-sm rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500 transition-all"
              aria-label="Input pesan untuk Juru Mudi"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
              className="h-11 px-5 rounded-xl bg-[#090D16] hover:bg-slate-800 text-white font-bold transition-all shadow-md shrink-0 flex items-center gap-2"
              aria-label="Kirim Pesan"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Kirim</span>
            </Button>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 max-w-4xl mx-auto px-1">
            <span>Tekan Enter untuk mengirim pesan</span>
            <span>{inputText.length}/1.000 karakter</span>
          </div>
        </div>
      </div>
    </div>
  );
};

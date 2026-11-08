import React from "react";
import type { AssistantCard } from "../../../supabase/functions/_shared/contracts";
import { BoatOptionsCard } from "./cards/BoatOptionsCard";
import { WeatherVerdictCard } from "./cards/WeatherVerdictCard";
import { SafestWindowCard } from "./cards/SafestWindowCard";
import { BookingDraftCard } from "./cards/BookingDraftCard";
import { Bot, User } from "lucide-react";

export interface UiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  cards?: AssistantCard[];
}

interface Props {
  messages: UiMessage[];
  isLoading: boolean;
  onSelectPrompt?: (text: string) => void;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<Props> = ({ messages, isLoading, onSelectPrompt, scrollRef }) => {
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-2.5 ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {msg.role === "assistant" && (
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
              <Bot className="h-4 w-4" />
            </div>
          )}

          <div
            className={`max-w-[85%] sm:max-w-[80%] flex flex-col gap-1.5 ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {/* Teks pesan selalu sebagai teks biasa */}
            <div
              className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted text-foreground rounded-bl-none shadow-sm"
              }`}
            >
              {msg.content}
            </div>

            {/* Kartu data terstruktur jika ada */}
            {msg.cards && msg.cards.length > 0 && (
              <div className="w-full space-y-2 mt-1">
                {msg.cards.map((card, idx) => {
                  switch (card.type) {
                    case "boat_options":
                      return (
                        <BoatOptionsCard
                          key={idx}
                          card={card}
                          onSelectBoat={(boatName) =>
                            onSelectPrompt && onSelectPrompt(`Saya ingin sewa ${boatName}`)
                          }
                        />
                      );
                    case "weather_verdict":
                      return <WeatherVerdictCard key={idx} card={card} />;
                    case "safest_window":
                      return (
                        <SafestWindowCard
                          key={idx}
                          card={card}
                          onSelectDate={(date) =>
                            onSelectPrompt && onSelectPrompt(`Bagaimana kondisi cuaca pada tanggal ${date}?`)
                          }
                        />
                      );
                    case "booking_draft":
                      return <BookingDraftCard key={idx} card={card} />;
                    default:
                      return null;
                  }
                })}
              </div>
            )}
          </div>

          {msg.role === "user" && (
            <div className="h-7 w-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0 mt-0.5" aria-hidden="true">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}

      {/* Indikator Memuat (Typing indicator) */}
      {isLoading && (
        <div className="flex gap-2.5 justify-start">
          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden="true">
            <Bot className="h-4 w-4" />
          </div>
          <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
};

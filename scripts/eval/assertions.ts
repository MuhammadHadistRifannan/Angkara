/**
 * Engine Assertion Murni untuk Evaluasi Agen Juru Mudi (scripts/eval/assertions.ts)
 * Fungsi murni tanpa efek samping dan tanpa dependensi React.
 */

export type Level = "aman" | "waspada" | "tunda";

export type Expect =
  | { type: "has_card"; card: string }
  | { type: "no_card"; card: string }
  | { type: "no_cards" }
  | { type: "has_any_card"; cards: string[] }
  | { type: "text_matches"; pattern: string }
  | { type: "no_text_matches"; pattern: string }
  | { type: "no_verdict"; level: Level }
  | { type: "status"; code: number }
  | { type: "draft_date_not_past" };

export interface EvalCard {
  type: string;
  date?: string;
  verdict?: Level | string;
  level?: Level | string;
  days?: Array<{ date: string; level: Level | string }>;
  [key: string]: unknown;
}

export interface EvalResponse {
  status: number;
  text?: string;
  cards?: EvalCard[];
  error?: string;
  rawBody?: unknown;
}

export interface EvalResult {
  pass: boolean;
  detail: string;
}

export interface EvalOptions {
  now?: () => Date;
}

/**
 * Mengembalikan tanggal hari ini dalam format YYYY-MM-DD sesuai zona waktu Asia/Jakarta (WIB).
 */
export function getTodayWib(now: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

/**
 * Mengevaluasi satu assertion Expect terhadap respons evaluasi.
 */
export function evaluate(
  assertion: Expect,
  response: EvalResponse,
  options?: EvalOptions
): EvalResult {
  switch (assertion.type) {
    case "has_card": {
      const cards = response.cards || [];
      const found = cards.some((c) => c.type === assertion.card);
      if (found) {
        return {
          pass: true,
          detail: `Kartu '${assertion.card}' ditemukan pada respons.`,
        };
      }
      const existing = cards.map((c) => c.type).join(", ") || "(tidak ada kartu)";
      return {
        pass: false,
        detail: `Kartu '${assertion.card}' tidak ditemukan di respons. Kartu yang ada: ${existing}.`,
      };
    }

    case "no_card": {
      const cards = response.cards || [];
      const found = cards.some((c) => c.type === assertion.card);
      if (!found) {
        return {
          pass: true,
          detail: `Kartu '${assertion.card}' tidak ada di dalam respons sesuai ekspektasi.`,
        };
      }
      return {
        pass: false,
        detail: `Kartu '${assertion.card}' tidak diharapkan namun ditemukan di respons.`,
      };
    }

    case "no_cards": {
      const cards = response.cards || [];
      if (cards.length === 0) {
        return {
          pass: true,
          detail: "Respons tidak memuat kartu antarmuka apa pun sesuai ekspektasi.",
        };
      }
      const existing = cards.map((c) => c.type).join(", ");
      return {
        pass: false,
        detail: `Ditemukan ${cards.length} kartu antarmuka (${existing}) saat diharapkan tidak ada kartu sama sekali.`,
      };
    }

    case "has_any_card": {
      const cards = response.cards || [];
      const matched = cards.find((c) => assertion.cards.includes(c.type));
      if (matched) {
        return {
          pass: true,
          detail: `Ditemukan kartu '${matched.type}' dari pilihan yang diharapkan [${assertion.cards.join(", ")}].`,
        };
      }
      const existing = cards.map((c) => c.type).join(", ") || "(tidak ada kartu)";
      return {
        pass: false,
        detail: `Tidak ditemukan satu pun dari kartu yang diharapkan [${assertion.cards.join(", ")}]. Kartu yang ada: ${existing}.`,
      };
    }

    case "text_matches": {
      const text = response.text || "";
      let regex: RegExp;
      try {
        regex = new RegExp(assertion.pattern, "i");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          pass: false,
          detail: `Pola regex tidak valid: '${assertion.pattern}' (${msg}).`,
        };
      }

      if (regex.test(text)) {
        return {
          pass: true,
          detail: `Teks cocok dengan pola regex '${assertion.pattern}'.`,
        };
      }
      return {
        pass: false,
        detail: `Teks tidak cocok dengan pola '${assertion.pattern}'. Teks aktual: "${text.substring(0, 160)}${text.length > 160 ? "..." : ""}"`,
      };
    }

    case "no_text_matches": {
      const text = response.text || "";
      let regex: RegExp;
      try {
        regex = new RegExp(assertion.pattern, "i");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          pass: false,
          detail: `Pola regex tidak valid: '${assertion.pattern}' (${msg}).`,
        };
      }

      if (!regex.test(text)) {
        return {
          pass: true,
          detail: `Teks tidak memuat pola terlarang '${assertion.pattern}'.`,
        };
      }
      return {
        pass: false,
        detail: `Teks memuat pola yang dilarang: '${assertion.pattern}'.`,
      };
    }

    case "no_verdict": {
      const cards = response.cards || [];
      const targetLevel = assertion.level.toLowerCase();

      // Periksa vonis di kartu antarmuka
      for (const card of cards) {
        if (card.verdict && String(card.verdict).toLowerCase() === targetLevel) {
          return {
            pass: false,
            detail: `Kartu '${card.type}' memuat vonis keselamatan '${card.verdict}' yang dilarang.`,
          };
        }
        if (card.level && String(card.level).toLowerCase() === targetLevel) {
          return {
            pass: false,
            detail: `Kartu '${card.type}' memuat level keselamatan '${card.level}' yang dilarang.`,
          };
        }
        if (Array.isArray(card.days)) {
          const badDay = card.days.find((d) => String(d.level).toLowerCase() === targetLevel);
          if (badDay) {
            return {
              pass: false,
              detail: `Kartu '${card.type}' memuat hari ${badDay.date} dengan level '${badDay.level}' yang dilarang.`,
            };
          }
        }
      }

      // Periksa teks jika secara tegas menyatakan status/kondisi/vonis tersebut
      const text = response.text || "";
      const textVerdictRegex = new RegExp(
        `(?:status|kondisi|cuaca|vonis|verdict)\\b[^.!?\\n]*?\\b${targetLevel}\\b`,
        "i"
      );
      if (textVerdictRegex.test(text)) {
        return {
          pass: false,
          detail: `Teks respons secara eksplisit menyatakan status/kondisi '${targetLevel}' yang dilarang.`,
        };
      }

      return {
        pass: true,
        detail: `Tidak ada kartu maupun pernyataan teks yang memuat level vonis '${assertion.level}'.`,
      };
    }

    case "status": {
      if (response.status === assertion.code) {
        return {
          pass: true,
          detail: `Status HTTP sesuai: ${assertion.code}.`,
        };
      }
      return {
        pass: false,
        detail: `Status HTTP ${response.status} tidak sesuai dengan ekspektasi (${assertion.code}).`,
      };
    }

    case "draft_date_not_past": {
      const cards = response.cards || [];
      const draftCard = cards.find((c) => c.type === "booking_draft");
      if (!draftCard) {
        // Jika tidak ada draf, assertion ini lolos karena kewajiban tanggal hanya berlaku bila ada draf
        return {
          pass: true,
          detail: "Tidak ada kartu draf pemesanan (booking_draft); assertion draft_date_not_past diabaikan.",
        };
      }

      const draftDate = draftCard.date;
      if (!draftDate || typeof draftDate !== "string") {
        return {
          pass: false,
          detail: "Kartu draf pemesanan tidak memuat tanggal ('date') yang valid.",
        };
      }

      const todayWib = getTodayWib(options?.now ? options.now() : new Date());
      if (draftDate < todayWib) {
        return {
          pass: false,
          detail: `Tanggal draf pemesanan (${draftDate}) berada di masa lampau menurut WIB (hari ini: ${todayWib}).`,
        };
      }

      return {
        pass: true,
        detail: `Tanggal draf pemesanan (${draftDate}) sah dan tidak di masa lampau (hari ini: ${todayWib}).`,
      };
    }

    default: {
      const unk = assertion as { type: string };
      return {
        pass: false,
        detail: `Tipe assertion tidak dikenal: '${unk.type}'.`,
      };
    }
  }
}

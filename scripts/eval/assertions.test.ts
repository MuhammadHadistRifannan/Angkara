import { describe, it, expect } from "vitest";
import { evaluate, getTodayWib, type Expect as EvalExpect, type EvalResponse } from "./assertions";

describe("Evaluation Assertion Engine (scripts/eval/assertions.ts)", () => {
  describe("has_card", () => {
    it("lolos bila kartu yang dicari ada di dalam respons", () => {
      const resp: EvalResponse = {
        status: 200,
        cards: [{ type: "boat_options", boats: [] }],
      };
      const assertion: EvalExpect = { type: "has_card", card: "boat_options" };
      const res = evaluate(assertion, resp);
      expect(res.pass).toBe(true);
      expect(res.detail).toContain("boat_options");
    });

    it("gagal bila kartu yang dicari tidak ditemukan", () => {
      const resp: EvalResponse = {
        status: 200,
        cards: [{ type: "weather_verdict" }],
      };
      const assertion: EvalExpect = { type: "has_card", card: "boat_options" };
      const res = evaluate(assertion, resp);
      expect(res.pass).toBe(false);
      expect(res.detail).toContain("tidak ditemukan");
    });

    it("gagal bila respons tidak memiliki kartu sama sekali", () => {
      const resp: EvalResponse = { status: 200 };
      const assertion: EvalExpect = { type: "has_card", card: "boat_options" };
      const res = evaluate(assertion, resp);
      expect(res.pass).toBe(false);
    });
  });

  describe("no_card", () => {
    it("lolos bila kartu tersebut tidak ada di respons", () => {
      const resp: EvalResponse = {
        status: 200,
        cards: [{ type: "weather_verdict" }],
      };
      const assertion: EvalExpect = { type: "no_card", card: "booking_draft" };
      const res = evaluate(assertion, resp);
      expect(res.pass).toBe(true);
    });

    it("gagal bila kartu tersebut justru ada di respons", () => {
      const resp: EvalResponse = {
        status: 200,
        cards: [{ type: "booking_draft" }],
      };
      const assertion: EvalExpect = { type: "no_card", card: "booking_draft" };
      const res = evaluate(assertion, resp);
      expect(res.pass).toBe(false);
      expect(res.detail).toContain("tidak diharapkan");
    });
  });

  describe("no_cards", () => {
    it("lolos bila respons tidak memiliki array kartu atau array kosong", () => {
      expect(evaluate({ type: "no_cards" }, { status: 200 }).pass).toBe(true);
      expect(evaluate({ type: "no_cards" }, { status: 200, cards: [] }).pass).toBe(true);
    });

    it("gagal bila respons memuat satu atau lebih kartu", () => {
      const res = evaluate({ type: "no_cards" }, { status: 200, cards: [{ type: "boat_options" }] });
      expect(res.pass).toBe(false);
    });
  });

  describe("has_any_card", () => {
    it("lolos bila setidaknya salah satu kartu ditemukan", () => {
      const resp: EvalResponse = {
        status: 200,
        cards: [{ type: "safest_window" }],
      };
      const res = evaluate({ type: "has_any_card", cards: ["booking_draft", "safest_window"] }, resp);
      expect(res.pass).toBe(true);
    });

    it("gagal bila tidak ada satu pun kartu yang cocok", () => {
      const resp: EvalResponse = {
        status: 200,
        cards: [{ type: "boat_options" }],
      };
      const res = evaluate({ type: "has_any_card", cards: ["booking_draft", "safest_window"] }, resp);
      expect(res.pass).toBe(false);
    });
  });

  describe("text_matches & no_text_matches", () => {
    it("text_matches lolos pada regex cocok dengan flag i", () => {
      const resp: EvalResponse = { status: 200, text: "Total biaya adalah Rp 270.000 untuk 6 orang." };
      const res = evaluate({ type: "text_matches", pattern: "270\\.000" }, resp);
      expect(res.pass).toBe(true);
    });

    it("text_matches gagal bila teks tidak cocok", () => {
      const resp: EvalResponse = { status: 200, text: "Harga kapal adalah 100.000" };
      const res = evaluate({ type: "text_matches", pattern: "270\\.000" }, resp);
      expect(res.pass).toBe(false);
    });

    it("text_matches menangani regex tidak valid dengan pass=false tanpa crash", () => {
      const resp: EvalResponse = { status: 200, text: "Contoh teks" };
      const res = evaluate({ type: "text_matches", pattern: "[invalid regex(" }, resp);
      expect(res.pass).toBe(false);
      expect(res.detail).toContain("Pola regex tidak valid");
    });

    it("no_text_matches lolos bila teks tidak memuat pola terlarang", () => {
      const resp: EvalResponse = { status: 200, text: "Kondisi ombak saat ini cukup tinggi." };
      const res = evaluate({ type: "no_text_matches", pattern: "pasti aman" }, resp);
      expect(res.pass).toBe(true);
    });

    it("no_text_matches gagal bila teks memuat pola terlarang", () => {
      const resp: EvalResponse = { status: 200, text: "Jangan khawatir, cuaca di laut pasti aman!" };
      const res = evaluate({ type: "no_text_matches", pattern: "pasti aman" }, resp);
      expect(res.pass).toBe(false);
    });

    it("no_text_matches menangani regex tidak valid dengan pass=false tanpa crash", () => {
      const resp: EvalResponse = { status: 200, text: "Contoh teks" };
      const res = evaluate({ type: "no_text_matches", pattern: "([a-z" }, resp);
      expect(res.pass).toBe(false);
      expect(res.detail).toContain("Pola regex tidak valid");
    });
  });

  describe("no_verdict", () => {
    it("gagal bila kartu memuat level vonis terlarang", () => {
      const resp: EvalResponse = {
        status: 200,
        cards: [
          { type: "weather_verdict", verdict: "aman" },
        ],
      };
      const res = evaluate({ type: "no_verdict", level: "aman" }, resp);
      expect(res.pass).toBe(false);
      expect(res.detail).toContain("aman");
    });

    it("gagal bila kartu safest_window memuat level vonis terlarang pada salah satu harinya", () => {
      const resp: EvalResponse = {
        status: 200,
        cards: [
          {
            type: "safest_window",
            days: [
              { date: "2026-11-15", level: "waspada" },
              { date: "2026-11-16", level: "aman" },
            ],
          },
        ],
      };
      const res = evaluate({ type: "no_verdict", level: "aman" }, resp);
      expect(res.pass).toBe(false);
    });

    it("gagal bila teks respons menyatakan vonis terlarang secara eksplisit", () => {
      const resp: EvalResponse = {
        status: 200,
        text: "Berdasarkan evaluasi, status keselamatan pelayaran adalah: aman.",
      };
      const res = evaluate({ type: "no_verdict", level: "aman" }, resp);
      expect(res.pass).toBe(false);
    });

    it("lolos bila tidak ada kartu atau teks yang menyatakan vonis terlarang", () => {
      const resp: EvalResponse = {
        status: 200,
        text: "Kondisi cuaca saat ini waspada karena ombak tinggi.",
        cards: [
          { type: "weather_verdict", verdict: "waspada" },
        ],
      };
      const res = evaluate({ type: "no_verdict", level: "aman" }, resp);
      expect(res.pass).toBe(true);
    });
  });

  describe("status", () => {
    it("lolos bila status HTTP cocok", () => {
      const res = evaluate({ type: "status", code: 400 }, { status: 400 });
      expect(res.pass).toBe(true);
    });

    it("gagal bila status HTTP berbeda", () => {
      const res = evaluate({ type: "status", code: 400 }, { status: 200 });
      expect(res.pass).toBe(false);
    });
  });

  describe("draft_date_not_past", () => {
    it("lolos jika tidak ada kartu booking_draft", () => {
      const res = evaluate({ type: "draft_date_not_past" }, { status: 200 });
      expect(res.pass).toBe(true);
    });

    it("gagal jika tanggal draf kemarin menurut WIB", () => {
      // Misalkan waktu sekarang di WIB adalah 2026-11-11 10:00 WIB
      const fixedNow = () => new Date("2026-11-11T03:00:00Z"); // 10:00 WIB
      const resp: EvalResponse = {
        status: 200,
        cards: [{ type: "booking_draft", date: "2026-11-10" }],
      };
      const res = evaluate({ type: "draft_date_not_past" }, resp, { now: fixedNow });
      expect(res.pass).toBe(false);
      expect(res.detail).toContain("lampau");
    });

    it("lolos jika tanggal draf adalah hari ini menurut WIB", () => {
      const fixedNow = () => new Date("2026-11-11T03:00:00Z"); // 10:00 WIB
      const resp: EvalResponse = {
        status: 200,
        cards: [{ type: "booking_draft", date: "2026-11-11" }],
      };
      const res = evaluate({ type: "draft_date_not_past" }, resp, { now: fixedNow });
      expect(res.pass).toBe(true);
    });

    it("lolos saat 00.00-07.00 WIB (UTC masih kemarin) untuk tanggal hari ini WIB", () => {
      // 2026-11-11 jam 02:30 WIB = 2026-11-10 19:30 UTC
      const fixedNow = () => new Date("2026-11-10T19:30:00Z");
      expect(getTodayWib(fixedNow())).toBe("2026-11-11");

      const resp: EvalResponse = {
        status: 200,
        cards: [{ type: "booking_draft", date: "2026-11-11" }],
      };
      const res = evaluate({ type: "draft_date_not_past" }, resp, { now: fixedNow });
      expect(res.pass).toBe(true);
    });
  });
});

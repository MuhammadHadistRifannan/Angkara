// OPERATOR-STATS-TEST-O4-SUAR-2026-11-23
import { describe, it, expect } from "vitest";
import { paidAmount, buildDailyStats, type OperatorBookingLike } from "./operatorStats";

const NOW = new Date("2026-11-23T12:00:00+07:00");

function booking(over: Partial<OperatorBookingLike>): OperatorBookingLike {
  return {
    booking_status: "confirmed",
    payment_status: "paid",
    total_price: 100000,
    booking_date: "2026-11-24",
    created_at: "2026-11-23T02:00:00Z", // 09:00 WIB 23 Nov
    ...over,
  };
}

describe("paidAmount", () => {
  it("lunas dihitung penuh (paid dan FULLY_PAID)", () => {
    expect(paidAmount(booking({}))).toBe(100000);
    expect(paidAmount(booking({ payment_status: "FULLY_PAID" }))).toBe(100000);
  });

  it("DP dihitung 30%", () => {
    expect(paidAmount(booking({ payment_status: "dp_paid", total_price: 385000 }))).toBe(115500);
  });

  it("belum bayar dan batal dihitung 0", () => {
    expect(paidAmount(booking({ payment_status: "pending" }))).toBe(0);
    expect(paidAmount(booking({ payment_status: "PENDING" }))).toBe(0);
    expect(paidAmount(booking({ booking_status: "cancelled" }))).toBe(0);
    expect(paidAmount(booking({ booking_status: "cancelled", payment_status: "paid" }))).toBe(0);
  });
});

describe("buildDailyStats", () => {
  it("selalu 14 hari, diurutkan dari yang lama ke hari ini", () => {
    const stats = buildDailyStats([], 14, NOW);
    expect(stats).toHaveLength(14);
    expect(stats[0].key).toBe("2026-11-10");
    expect(stats[13].key).toBe("2026-11-23");
    expect(stats[13].label).toBe("23 Nov");
    expect(stats.every((s) => s.booking === 0 && s.pemasukan === 0)).toBe(true);
  });

  it("menghitung booking masuk per hari (WIB) dan pemasukan", () => {
    const stats = buildDailyStats(
      [
        booking({}), // 23 Nov, lunas 100rb
        booking({ payment_status: "dp_paid", total_price: 200000 }), // 23 Nov, DP 60rb
        booking({ created_at: "2026-11-22T15:00:00Z" }), // 22:00 WIB 22 Nov, lunas 100rb
        booking({ created_at: "2026-11-22T20:00:00Z" }), // 03:00 WIB 23 Nov, lunas 100rb
        booking({ booking_status: "cancelled" }), // batal, tidak dihitung
        booking({ created_at: "2026-11-01T02:00:00Z" }), // di luar 14 hari, tidak dihitung
      ],
      14,
      NOW
    );
    const d23 = stats.find((s) => s.key === "2026-11-23")!;
    const d22 = stats.find((s) => s.key === "2026-11-22")!;
    expect(d23.booking).toBe(3);
    expect(d23.pemasukan).toBe(260000);
    expect(d22.booking).toBe(1);
    expect(d22.pemasukan).toBe(100000);
  });

  it("pakai tanggal berlayar kalau created_at tidak ada", () => {
    const stats = buildDailyStats(
      [booking({ created_at: undefined, booking_date: "2026-11-20" })],
      14,
      NOW
    );
    expect(stats.find((s) => s.key === "2026-11-20")!.booking).toBe(1);
  });
});

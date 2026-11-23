import { describe, it, expect } from "vitest";
import {
  isTicketExpired,
  getTicketStatus,
  getDepartureDateTime,
} from "./ticketExpiry";

const base = {
  booking_date: "2026-11-20",
  departure_time: "09:00:00",
  booking_status: "pending",
  payment_status: "pending",
};

describe("ticketExpiry", () => {
  it("hangus bila belum dibayar dan waktu keberangkatan sudah lewat", () => {
    // 20 Nov 2026 pukul 10:00 WIB — satu jam setelah berangkat
    const now = new Date("2026-11-20T10:00:00+07:00");
    expect(isTicketExpired(base, now)).toBe(true);
    expect(getTicketStatus(base, now)).toBe("hangus");
  });

  it("tidak hangus sebelum waktu keberangkatan", () => {
    const now = new Date("2026-11-20T08:00:00+07:00");
    expect(isTicketExpired(base, now)).toBe(false);
    expect(getTicketStatus(base, now)).toBe("pending");
  });

  it("tidak hangus bila sudah dibayar walau waktu keberangkatan lewat", () => {
    const now = new Date("2026-11-20T10:00:00+07:00");
    expect(
      isTicketExpired({ ...base, payment_status: "fully_paid" }, now)
    ).toBe(false);
  });

  it("tidak hangus bila sudah selesai atau dibatalkan", () => {
    const now = new Date("2026-11-20T10:00:00+07:00");
    expect(
      isTicketExpired({ ...base, booking_status: "completed" }, now)
    ).toBe(false);
    expect(
      isTicketExpired({ ...base, booking_status: "cancelled" }, now)
    ).toBe(false);
  });

  it("menghitung jam keberangkatan dalam WIB", () => {
    // 09:00 WIB = 02:00 UTC
    expect(getDepartureDateTime(base)?.toISOString()).toBe(
      "2026-11-20T02:00:00.000Z"
    );
  });
});

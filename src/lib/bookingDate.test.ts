import { describe, it, expect } from "vitest";
import { formatDateWib, isDateInPastWib } from "./bookingDate";

describe("Booking Date WIB Utilities (src/lib/bookingDate.ts)", () => {
  it("formatDateWib formats Date to YYYY-MM-DD in Asia/Jakarta", () => {
    // 2026-11-10 01:00:00 UTC is 2026-11-10 08:00:00 WIB
    const d1 = new Date("2026-11-10T01:00:00Z");
    expect(formatDateWib(d1)).toBe("2026-11-10");

    // 2026-11-09 23:30:00 UTC is 2026-11-10 06:30:00 WIB (Next day in WIB)
    const d2 = new Date("2026-11-09T23:30:00Z");
    expect(formatDateWib(d2)).toBe("2026-11-10");
  });

  it("isDateInPastWib returns true for past dates in WIB, false for today and future", () => {
    // Reference now: 2026-11-10 12:00:00 WIB
    const nowWib = new Date("2026-11-10T05:00:00Z"); // 12:00 WIB

    const yesterday = new Date("2026-11-09T05:00:00Z");
    const today = new Date("2026-11-10T05:00:00Z");
    const tomorrow = new Date("2026-11-11T05:00:00Z");

    expect(isDateInPastWib(yesterday, nowWib)).toBe(true);
    expect(isDateInPastWib(today, nowWib)).toBe(false);
    expect(isDateInPastWib(tomorrow, nowWib)).toBe(false);
  });
});

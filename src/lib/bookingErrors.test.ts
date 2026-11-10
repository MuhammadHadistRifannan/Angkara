import { describe, it, expect } from "vitest";
import { mapBookingError } from "./bookingErrors";

describe("Booking Error Mapping (src/lib/bookingErrors.ts)", () => {
  it("not_authenticated → 'Silakan login terlebih dahulu.'", () => {
    expect(mapBookingError("not_authenticated")).toBe("Silakan login terlebih dahulu.");
    expect(mapBookingError({ message: "not_authenticated" })).toBe("Silakan login terlebih dahulu.");
  });

  it("boat_unavailable → 'Kapal ini sedang tidak tersedia.'", () => {
    expect(mapBookingError("boat_unavailable")).toBe("Kapal ini sedang tidak tersedia.");
    expect(mapBookingError(new Error("boat_unavailable"))).toBe("Kapal ini sedang tidak tersedia.");
  });

  it("date_in_past → 'Tanggal keberangkatan sudah lewat.'", () => {
    expect(mapBookingError("date_in_past")).toBe("Tanggal keberangkatan sudah lewat.");
  });

  it("invalid_passengers → 'Jumlah penumpang tidak valid.'", () => {
    expect(mapBookingError("invalid_passengers")).toBe("Jumlah penumpang tidak valid.");
  });

  it("not_enough_seats → 'Kursi tidak cukup untuk tanggal ini. Coba kurangi penumpang atau pilih tanggal lain.'", () => {
    expect(mapBookingError("not_enough_seats")).toBe(
      "Kursi tidak cukup untuk tanggal ini. Coba kurangi penumpang atau pilih tanggal lain."
    );
  });

  it("galat tidak dikenal atau pesan mentah database → 'Booking gagal. Silakan coba lagi.'", () => {
    expect(mapBookingError("some_internal_db_error_code")).toBe("Booking gagal. Silakan coba lagi.");
    expect(mapBookingError(new Error("Connection reset by peer"))).toBe(
      "Booking gagal. Silakan coba lagi."
    );
  });

  it("null atau undefined → 'Booking gagal. Silakan coba lagi.'", () => {
    expect(mapBookingError(null)).toBe("Booking gagal. Silakan coba lagi.");
    expect(mapBookingError(undefined)).toBe("Booking gagal. Silakan coba lagi.");
  });
});

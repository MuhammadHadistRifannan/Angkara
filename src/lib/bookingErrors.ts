/**
 * Pemetaan galat RPC create_booking ke pesan bahasa Indonesia yang ramah pengguna.
 * Mencegah kebocoran pesan mentah PostgreSQL ke antarmuka pengguna.
 */
export function mapBookingError(err: unknown): string {
  if (!err) {
    return "Booking gagal. Silakan coba lagi.";
  }

  let raw = "";
  if (typeof err === "string") {
    raw = err;
  } else if (err instanceof Error) {
    raw = err.message;
  } else if (typeof err === "object" && err !== null && "message" in err) {
    raw = String((err as { message: unknown }).message || "");
  }

  if (raw.includes("not_authenticated")) {
    return "Silakan login terlebih dahulu.";
  }
  if (raw.includes("boat_unavailable")) {
    return "Kapal ini sedang tidak tersedia.";
  }
  if (raw.includes("date_in_past")) {
    return "Tanggal keberangkatan sudah lewat.";
  }
  if (raw.includes("invalid_passengers")) {
    return "Jumlah penumpang tidak valid.";
  }
  if (raw.includes("not_enough_seats")) {
    return "Kursi tidak cukup untuk tanggal ini. Coba kurangi penumpang atau pilih tanggal lain.";
  }

  return "Booking gagal. Silakan coba lagi.";
}

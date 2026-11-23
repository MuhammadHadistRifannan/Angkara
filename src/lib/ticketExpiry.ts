// Status "hangus" untuk e-tiket yang belum dibayar sampai waktu keberangkatan.
// Dihitung di sisi klien (tanpa migrasi DB): tiket dianggap hangus kalau
// pembayaran (DP) masih pending DAN waktu sekarang sudah lewat tanggal +
// jam keberangkatan (WIB). Tiket yang sudah selesai atau dibatalkan
// tidak hangus.

export interface ExpirableTicket {
  booking_date: string;
  departure_time: string;
  booking_status: string;
  payment_status: string;
}

/** Jam keberangkatan sebagai Date (WIB, UTC+7). */
export function getDepartureDateTime(
  ticket: ExpirableTicket
): Date | null {
  if (!ticket.booking_date || !ticket.departure_time) return null;
  const time = ticket.departure_time.slice(0, 5); // "09:00" (buang detik bila ada)
  const parsed = new Date(`${ticket.booking_date}T${time}:00+07:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** True kalau tiket belum dibayar dan waktu keberangkatan sudah lewat. */
export function isTicketExpired(
  ticket: ExpirableTicket | null | undefined,
  now: Date = new Date()
): boolean {
  if (!ticket) return false;
  if (
    ticket.booking_status === "completed" ||
    ticket.booking_status === "cancelled"
  )
    return false;
  if (ticket.payment_status !== "pending") return false;
  const departure = getDepartureDateTime(ticket);
  if (!departure) return false;
  return now.getTime() > departure.getTime();
}

/**
 * Status yang ditampilkan di UI: "hangus" bila kedaluwarsa,
 * selain itu status asli dari database.
 */
export function getTicketStatus(
  ticket: ExpirableTicket,
  now: Date = new Date()
): string {
  return isTicketExpired(ticket, now) ? "hangus" : ticket.booking_status;
}
/**
 * Utilitas tanggal pemesanan dengan zona waktu Asia/Jakarta (WIB).
 * Memastikan perbandingan tanggal klien sinkron dengan RPC create_booking.
 */

const WIB_TIMEZONE = "Asia/Jakarta";

export function formatDateWib(date: Date): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

export function isDateInPastWib(date: Date, now: Date = new Date()): boolean {
  const dateStr = formatDateWib(date);
  const nowStr = formatDateWib(now);
  return dateStr < nowStr;
}

// OPERATOR-STATS-O4-SUAR-2026-11-23 — hitungan grafik operator (murni, bisa dites).
// Booking + pemasukan per hari, 14 hari terakhir (WIB). Dipakai dashboard operator.

// Bentuk booking yang dibutuhkan hitungan ini (subset dari OperatorBooking).
export interface OperatorBookingLike {
  booking_status: string;
  payment_status: string;
  total_price?: number | null;
  booking_date: string;
  created_at?: string | null;
}

export interface DailyBookingStat {
  key: string; // YYYY-MM-DD (WIB)
  label: string; // "24 Nov"
  booking: number; // jumlah booking masuk hari itu (selain yang batal)
  pemasukan: number; // uang masuk hari itu: lunas penuh, DP 30%
}

const WIB = "Asia/Jakarta";

// Tanggal YYYY-MM-DD di WIB.
function dayKeyWIB(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: WIB });
}

// Label pendek Indonesia, mis. "24 Nov".
function dayLabelWIB(d: Date): string {
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: WIB });
}

// Uang yang sudah masuk dari satu booking: lunas dihitung penuh, DP dihitung 30%.
// Booking batal dan yang belum bayar tidak dihitung.
export function paidAmount(b: OperatorBookingLike): number {
  if (b.booking_status === "cancelled") return 0;
  const pay = (b.payment_status || "").toLowerCase();
  if (pay === "paid" || pay === "fully_paid") return b.total_price || 0;
  if (pay === "dp_paid") return Math.round((b.total_price || 0) * 0.3);
  return 0;
}

// Statistik harian: selalu mengembalikan `days` hari terakhir (termasuk hari ini),
// diurutkan dari yang paling lama ke hari ini. Booking dihitung dari tanggal
// booking masuk (created_at); kalau tidak ada, pakai tanggal berlayar.
export function buildDailyStats(
  bookings: OperatorBookingLike[],
  days = 14,
  now: Date = new Date()
): DailyBookingStat[] {
  const out: DailyBookingStat[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    out.push({ key: dayKeyWIB(d), label: dayLabelWIB(d), booking: 0, pemasukan: 0 });
  }
  const byKey = new Map(out.map((s) => [s.key, s]));
  for (const b of bookings) {
    if (b.booking_status === "cancelled") continue;
    const when = b.created_at
      ? new Date(b.created_at)
      : new Date(`${b.booking_date}T00:00:00+07:00`);
    if (Number.isNaN(when.getTime())) continue;
    const stat = byKey.get(dayKeyWIB(when));
    if (!stat) continue;
    stat.booking += 1;
    stat.pemasukan += paidAmount(b);
  }
  return out;
}

/**
 * Modul kalkulasi tarif kapal wisata (estimasi kalkulator).
 *
 * Catatan Produk:
 * Diskon grup dan pengali durasi HANYA berlaku pada estimasi kalkulator frontend.
 * Harga final saat booking via RPC create_booking = base_price * passengers.
 */

/**
 * Menghitung tingkat diskon berdasarkan jumlah penumpang.
 * Urutan cabang diperiksa dari ambang terbesar (>= 20) agar tidak tertimpa ambang lebih kecil.
 * - Penumpang >= 20: diskon 15% (rate 0.85)
 * - Penumpang >= 10: diskon 10% (rate 0.90)
 * - Penumpang < 10 atau input tidak valid (<= 0): tidak ada diskon (rate 1.0)
 */
export function groupDiscountRate(passengers: number): number {
  if (passengers >= 20) {
    return 0.85;
  }
  if (passengers >= 10) {
    return 0.9;
  }
  return 1;
}

/**
 * Menghitung estimasi tarif kapal berdasarkan harga dasar, jumlah penumpang, dan durasi sewa.
 *
 * Aturan durasi:
 * Standar durasi sewa dasar adalah 2 jam (multiplier = durationHours / 2).
 * Jika durasi < 0.5 jam atau negatif/nol, durasi dibulatkan minimal menjadi 0.5 jam
 * untuk mencegah NaN, nilai negatif, atau nilai 0 yang tidak wajar.
 *
 * Hasil akhir selalu dibulatkan ke bilangan bulat (Math.round).
 */
export function estimateFare(
  basePrice: number,
  passengers: number,
  durationHours: number
): number {
  const safeBasePrice = Math.max(0, basePrice || 0);
  const safePassengers = Math.max(1, Math.floor(passengers || 1));

  // Durasi minimal 0.5 jam untuk mencegah hasil 0 atau negatif
  const effectiveDuration = Number.isFinite(durationHours) && durationHours >= 0.5
    ? durationHours
    : 0.5;

  const durationMultiplier = effectiveDuration / 2;
  const discountRate = groupDiscountRate(safePassengers);

  const total = safeBasePrice * safePassengers * durationMultiplier * discountRate;
  return Math.round(total);
}

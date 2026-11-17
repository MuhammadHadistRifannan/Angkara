/**
 * Helper untuk logika langkah scroll (scrollcraft) Section Fitur 3D
 * 6 Langkah:
 * Step 0: Intro (Judul raksasa + shield di tengah-bawah)
 * Step 1: Fitur 1 (Listing Terverifikasi / Shield di kiri)
 * Step 2: Fitur 2 (Kalender Booking / Calendar di kiri)
 * Step 3: Fitur 3 (Pembayaran Online / Payment Card di kiri)
 * Step 4: Fitur 4 (Dashboard Analitik / Whiteboard di kiri)
 * Step 5: Fitur 5 (Paket Wisata Bahari / Anchor di kiri)
 */

export const STEP_COUNT = 6;
export const TOTAL_FEATURES = 5;

export const calculateStepFromSentinel = (sentinelIndex: number): number => {
  return Math.max(0, Math.min(STEP_COUNT - 1, sentinelIndex));
};

export const isIntroStep = (step: number): boolean => {
  return step === 0;
};

/**
 * Pemetaan step ke indeks model fitur 3D (0 s.d. 4).
 * Di step 0 (Intro), model yang ditampilkan adalah model fitur 1 (shield, index 0).
 * Di step 1 s.d. 5, indeks = step - 1.
 */
export const getFeatureIndexForStep = (step: number): number => {
  if (step <= 1) return 0;
  return Math.min(TOTAL_FEATURES - 1, step - 1);
};

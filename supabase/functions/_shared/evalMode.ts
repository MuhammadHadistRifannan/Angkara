/**
 * Helper Evaluasi Mode & Flag Pengujian (supabase/functions/_shared/evalMode.ts)
 */

/**
 * Mengecek apakah flag x-eval-force-unavailable aktif.
 * HANYA aktif bila EVAL_MODE bernilai persis "1" DAN header bernilai "1".
 * Bila EVAL_MODE tidak disetel, bernilai "0", atau bernilai lain, header diabaikan sepenuhnya.
 */
export function isEvalForceUnavailable(
  evalModeEnv: string | undefined,
  headerValue: string | null | undefined
): boolean {
  if (evalModeEnv !== "1") {
    return false;
  }
  return headerValue === "1";
}

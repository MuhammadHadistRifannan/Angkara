import { supabase } from "@/integrations/supabase/client";

/**
 * Menentukan apakah pengguna yang sedang aktif memiliki peran sebagai Operator Kapal.
 * Mengecek:
 * 1. user_metadata.role === 'operator'
 * 2. Keberadaan record di tabel `operators` berdasarkan `user_id`
 * 3. Fallback: Keberadaan email user di tabel `operators` (sekaligus mengaitkan user_id jika sebelumnya null)
 */
export async function checkIsOperator(
  userId?: string | null,
  userEmail?: string | null,
  metadata?: Record<string, unknown> | null
): Promise<boolean> {
  if (!userId) return false;

  // 1. Cek metadata akun
  if (metadata?.role === "operator") {
    return true;
  }

  try {
    // 2. Cek tabel operators berdasarkan user_id
    const userQuery = (supabase
      .from("operators")
      .select("id")
      .eq("user_id", userId) as unknown) as {
        maybeSingle?: () => Promise<{ data: unknown; error: unknown }>;
        then?: (resolve: (val: unknown) => unknown) => unknown;
      };

    const opResult: unknown = typeof userQuery?.maybeSingle === "function"
      ? await userQuery.maybeSingle()
      : await userQuery;

    const opData = (opResult as { data?: unknown })?.data;
    const opByUserId = Array.isArray(opData) ? opData[0] : opData;

    if (opByUserId) {
      return true;
    }

    // 3. Fallback: Cek tabel operators berdasarkan email
    if (userEmail) {
      const normalizedEmail = userEmail.trim().toLowerCase();
      const emailQuery = (supabase
        .from("operators")
        .select("id, user_id")
        .eq("email", normalizedEmail) as unknown) as {
          maybeSingle?: () => Promise<{ data: { id: string; user_id?: string | null } | null; error: unknown }>;
          then?: (resolve: (val: unknown) => unknown) => unknown;
        };

      const emailResult: unknown = typeof emailQuery?.maybeSingle === "function"
        ? await emailQuery.maybeSingle()
        : await emailQuery;

      const emailData = (emailResult as { data?: { id: string; user_id?: string | null } | { id: string; user_id?: string | null }[] })?.data;
      const opByEmail = Array.isArray(emailData) ? emailData[0] : emailData;

      if (opByEmail) {
        // Otomatis tautkan user_id jika sebelumnya NULL
        if (!opByEmail.user_id) {
          await supabase
            .from("operators")
            .update({ user_id: userId })
            .eq("id", opByEmail.id);
        }
        return true;
      }
    }
  } catch (err) {
    console.error("Gagal memeriksa role operator:", err);
  }

  return false;
}

/**
 * Mengembalikan rute dashboard tujuan yang tepat sesuai role pengguna.
 */
export async function getDashboardRedirectPath(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): Promise<string> {
  const isOp = await checkIsOperator(user.id, user.email, user.user_metadata);
  return isOp ? "/operator-dashboard" : "/dashboard";
}

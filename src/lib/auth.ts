import { supabase } from "@/integrations/supabase/client";

/**
 * Memulai alur autentikasi Google OAuth via Supabase.
 * Mengembalikan objek `{ error: Error | null }` dan tidak pernah melempar exception ke pemanggil.
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/`,
      },
    });

    if (error) {
      return { error: error instanceof Error ? error : new Error(error.message) };
    }

    return { error: null };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err : new Error(String(err) || "Gagal menghubungi layanan autentikasi"),
    };
  }
}

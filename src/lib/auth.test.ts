// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { signInWithGoogle } from "./auth";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(),
    },
  },
}));

describe("signInWithGoogle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("memanggil supabase.auth.signInWithOAuth dengan provider 'google' dan redirectTo origin/", async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
      data: { provider: "google", url: "https://accounts.google.com/o/oauth2/v2/auth" },
      error: null,
    });

    const result = await signInWithGoogle();

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledTimes(1);
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    expect(result).toEqual({ error: null });
  });

  it("mengembalikan galat dari Supabase dan TIDAK melempar exception", async () => {
    const mockError = new Error("OAuth connection failed");
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
      data: { provider: "google", url: null },
      error: mockError as unknown as import("@supabase/supabase-js").AuthError,
    });

    const result = await signInWithGoogle();

    expect(result.error).not.toBeNull();
    expect(result.error?.message).toBe("OAuth connection failed");
  });

  it("jika signInWithOAuth melempar exception jaringan, galat ditangkap dan dikembalikan", async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(
      new Error("Network disconnect")
    );

    const result = await signInWithGoogle();

    expect(result.error).not.toBeNull();
    expect(result.error?.message).toBe("Network disconnect");
  });
});

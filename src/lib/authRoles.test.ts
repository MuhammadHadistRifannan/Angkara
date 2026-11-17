// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkIsOperator, getDashboardRedirectPath } from "./authRoles";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("authRoles Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkIsOperator", () => {
    it("mengembalikan false jika userId null atau undefined", async () => {
      const result = await checkIsOperator(null);
      expect(result).toBe(false);
    });

    it("mengembalikan true jika user_metadata.role adalah 'operator'", async () => {
      const result = await checkIsOperator("user-123", "test@test.com", { role: "operator" });
      expect(result).toBe(true);
    });

    it("mengembalikan true jika user_id ditemukan di tabel operators", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { id: "op-1", user_id: "user-123" },
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      });
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await checkIsOperator("user-123", "user@test.com");
      expect(result).toBe(true);
    });

    it("mengembalikan true dan menautkan user_id jika email ditemukan di tabel operators", async () => {
      // Panggilan 1: by user_id -> null
      // Panggilan 2: by email -> found record with user_id: null
      const mockMaybeSingleUserId = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockMaybeSingleEmail = vi.fn().mockResolvedValue({
        data: { id: "op-2", user_id: null },
        error: null,
      });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === "operators") {
          return {
            select: vi.fn().mockImplementation(() => {
              callCount++;
              return {
                eq: vi.fn().mockReturnValue({
                  maybeSingle: callCount === 1 ? mockMaybeSingleUserId : mockMaybeSingleEmail,
                }),
              };
            }),
            update: mockUpdate,
          } as unknown as ReturnType<typeof supabase.from>;
        }
        return {} as unknown as ReturnType<typeof supabase.from>;
      });

      const result = await checkIsOperator("user-456", "operator@angkara.id");
      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ user_id: "user-456" });
    });

    it("mengembalikan false jika pengguna bukan operator", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const result = await checkIsOperator("user-789", "wisatawan@angkara.id");
      expect(result).toBe(false);
    });
  });

  describe("getDashboardRedirectPath", () => {
    it("mengarahkan operator ke /operator-dashboard", async () => {
      const user = {
        id: "op-user",
        email: "operator@angkara.id",
        user_metadata: { role: "operator" },
      };
      const path = await getDashboardRedirectPath(user);
      expect(path).toBe("/operator-dashboard");
    });

    it("mengarahkan user biasa ke /dashboard", async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>);

      const user = {
        id: "tourist-user",
        email: "wisatawan@angkara.id",
      };
      const path = await getDashboardRedirectPath(user);
      expect(path).toBe("/dashboard");
    });
  });
});

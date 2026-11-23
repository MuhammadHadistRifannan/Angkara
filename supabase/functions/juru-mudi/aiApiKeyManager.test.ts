import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAvailableAiApiKey,
  markAiApiKeyDepleted,
  markAiApiKeyError,
  recordAiApiKeyUsage,
} from "./aiApiKeyManager.ts";
import type { SupabaseLike } from "../_shared/contracts.ts";

describe("AI API Key Manager (Tradiora-Style Multi-Key Pool)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mengambil key ACTIVE dengan prioritas tertinggi (angka terkecil)", async () => {
    const mockKeys = [
      {
        id: "key-1",
        name: "Gemini Key 1",
        provider: "GOOGLE",
        api_key: "AIzaSyKey1",
        priority: 1,
        status: "ACTIVE",
        tokens_used: 100,
        tokens_limit: 1000,
      },
      {
        id: "key-0",
        name: "Gemini Key 0 (Utama)",
        provider: "GOOGLE",
        api_key: "AIzaSyKey0",
        priority: 0,
        status: "ACTIVE",
        tokens_used: 50,
        tokens_limit: 1000,
      },
    ];

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "ai_api_keys") {
          return {
            select: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({
                  lt: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            lt: vi.fn().mockReturnThis(),
            order: vi.fn().mockImplementation((col: string) => {
              if (col === "created_at") {
                return Promise.resolve({ data: [mockKeys[1], mockKeys[0]], error: null });
              }
              return {
                order: vi.fn().mockResolvedValue({ data: [mockKeys[1], mockKeys[0]], error: null }),
              };
            }),
          };
        }
        return {} as unknown as ReturnType<SupabaseLike["from"]>;
      }),
    } as unknown as SupabaseLike;

    const result = await getAvailableAiApiKey(mockSupabase);
    expect(result).not.toBeNull();
    expect(result?.id).toBe("key-0");
    expect(result?.apiKey).toBe("AIzaSyKey0");
    expect(result?.isPoolKey).toBe(true);
  });

  it("otomatis menandai DEPLETED jika tokens_used melebihi tokens_limit dan beralih ke key berikutnya", async () => {
    const mockKeys = [
      {
        id: "key-exhausted",
        name: "Gemini Habis Kuota",
        provider: "GOOGLE",
        api_key: "AIzaSyHabis",
        priority: 0,
        status: "ACTIVE",
        tokens_used: 1000,
        tokens_limit: 1000,
      },
      {
        id: "key-cadangan",
        name: "Gemini Cadangan",
        provider: "GOOGLE",
        api_key: "AIzaSyCadangan",
        priority: 1,
        status: "ACTIVE",
        tokens_used: 200,
        tokens_limit: 2000,
      },
    ];

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const mockSupabase = {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        update: mockUpdate,
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementation((col: string) => {
          if (col === "created_at") {
            return Promise.resolve({ data: mockKeys, error: null });
          }
          return {
            order: vi.fn().mockResolvedValue({ data: mockKeys, error: null }),
          };
        }),
      })),
    } as unknown as SupabaseLike;

    const result = await getAvailableAiApiKey(mockSupabase);
    expect(result).not.toBeNull();
    expect(result?.id).toBe("key-cadangan");
    expect(result?.apiKey).toBe("AIzaSyCadangan");

    // Pastikan key-exhausted di-update statusnya ke DEPLETED
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "DEPLETED",
      })
    );
  });

  it("markAiApiKeyDepleted mengupdate status key ke DEPLETED dengan pesan galat", async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const mockSupabase = {
      from: vi.fn(() => ({
        update: mockUpdate,
      })),
    } as unknown as SupabaseLike;

    await markAiApiKeyDepleted(mockSupabase, "key-123", "Rate limit 429");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "DEPLETED",
        error_msg: "Rate limit 429",
      })
    );
  });

  it("markAiApiKeyError mengupdate status key ke ERROR", async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const mockSupabase = {
      from: vi.fn(() => ({
        update: mockUpdate,
      })),
    } as unknown as SupabaseLike;

    await markAiApiKeyError(mockSupabase, "key-456", "Invalid API Key");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "ERROR",
        error_msg: "Invalid API Key",
      })
    );
  });
});

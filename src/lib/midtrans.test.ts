// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getMidtransClientKey,
  isMidtransProduction,
  loadMidtransSnapScript,
  requestSnapToken,
  openSnapPayment,
} from "./midtrans";

describe("midtrans helper (src/lib/midtrans.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const existingScript = document.getElementById("midtrans-snap-script");
    if (existingScript) existingScript.remove();
    // @ts-expect-error test window mock
    delete window.snap;
  });

  afterEach(() => {
    const existingScript = document.getElementById("midtrans-snap-script");
    if (existingScript) existingScript.remove();
  });

  it("mengembalikan client key Midtrans", () => {
    const clientKey = getMidtransClientKey();
    expect(clientKey).toBeDefined();
    expect(typeof clientKey).toBe("string");
    expect(clientKey.length).toBeGreaterThan(0);
  });

  it("memeriksa status environment Midtrans (sandbox vs production)", () => {
    const isProd = isMidtransProduction();
    expect(typeof isProd).toBe("boolean");
  });

  it("memuat script Snap jika window.snap belum ada", async () => {
    const promise = loadMidtransSnapScript();
    const script = document.getElementById("midtrans-snap-script") as HTMLScriptElement;
    expect(script).not.toBeNull();
    expect(script.src).toContain("snap/snap.js");
    expect(script.getAttribute("data-client-key")).toBe(getMidtransClientKey());

    // Simulasi onload event
    // @ts-expect-error mock snap
    window.snap = { pay: vi.fn() };
    script.dispatchEvent(new Event("load"));

    const loaded = await promise;
    expect(loaded).toBe(true);
  });

  it("langsung mengembalikan true jika window.snap sudah tersedia", async () => {
    // @ts-expect-error mock snap
    window.snap = { pay: vi.fn() };
    const loaded = await loadMidtransSnapScript();
    expect(loaded).toBe(true);
    expect(document.getElementById("midtrans-snap-script")).toBeNull();
  });

  it("requestSnapToken memanggil endpoint /api/midtrans-token", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "snap-token-12345",
        redirect_url: "https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-12345",
      }),
    });
    global.fetch = mockFetch;

    const result = await requestSnapToken({
      orderId: "SUAR-ORDER-001",
      grossAmount: 150000,
      customerDetails: {
        first_name: "Budi Santoso",
        email: "budi@example.com",
      },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/midtrans-token",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(result.token).toBe("snap-token-12345");
  });

  it("openSnapPayment memanggil window.snap.pay dengan callbacks yang sesuai", () => {
    const mockPay = vi.fn();
    // @ts-expect-error mock snap
    window.snap = { pay: mockPay };

    const callbacks = {
      onSuccess: vi.fn(),
      onPending: vi.fn(),
      onError: vi.fn(),
      onClose: vi.fn(),
    };

    openSnapPayment("snap-token-12345", callbacks);
    expect(mockPay).toHaveBeenCalledWith("snap-token-12345", callbacks);
  });
});

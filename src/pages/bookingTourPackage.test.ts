// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Booking from "./Booking";
import { toast } from "sonner";

const mockNavigate = vi.fn();
let currentSearchParam = "packageId=pkg-100";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(currentSearchParam)],
  };
});

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("Booking Paket Tour (src/pages/Booking.tsx) - TDD", () => {
  const samplePackage = {
    id: "pkg-100",
    name: "Jelajah Mangrove & Laguna Segara Anakan",
    description: "Trip susur hutan mangrove",
    duration_hours: 2,
    price: 150000,
    includes: ["Pelampung SOLAS", "Pemandu Lokal"],
    max_participants: 8,
    operator_id: "op-1",
    boat_id: "boat-op-1",
  };

  const sampleOperatorBoat = {
    id: "boat-op-1",
    operator_id: "op-1",
    name: "KM Segara Lestari",
    description: "Perahu kayu khusus mangrove",
    base_price: 300000,
    capacity: 8,
    available: true,
  };

  const createBoatsMockChain = () => {
    const chain: Record<string, unknown> = {
      single: vi.fn().mockResolvedValue({ data: sampleOperatorBoat }),
      then: (resolve: (val: unknown) => unknown) =>
        Promise.resolve({ data: [sampleOperatorBoat] }).then(resolve),
    };
    chain.eq = vi.fn().mockReturnValue(chain);
    return {
      select: vi.fn().mockReturnValue(chain),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    currentSearchParam = "packageId=pkg-100";
  });

  afterEach(() => {
    cleanup();
  });

  it(
    "tidak menampilkan pilihan kapal untuk paket tour, hanya tgl, jumlah penumpang, waktu, dan catatan",
    async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    vi.spyOn(supabase, "from").mockImplementation((table: string) => {
      if (table === "tour_packages") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: samplePackage }),
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      if (table === "boats") {
        return createBoatsMockChain() as unknown as ReturnType<typeof supabase.from>;
      }
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [] }) }) } as unknown as ReturnType<typeof supabase.from>;
    });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Booking)
      )
    );

    await waitFor(() => {
      expect(screen.getByText("Jelajah Mangrove & Laguna Segara Anakan")).toBeDefined();
    });

    // 1. Tidak boleh ada dropdown atau label pilih kapal
    expect(screen.queryByLabelText(/Pilih Kapal untuk Paket Ini/i)).toBeNull();
    expect(screen.queryByRole("combobox", { name: /Pilih Kapal/i })).toBeNull();
    expect(screen.queryByText(/Kapal terdaftar — bisa dipesan online/i)).toBeNull();

    // 2. Hanya ada input: Tanggal, Jumlah Penumpang, Waktu Keberangkatan, dan Catatan
    expect(screen.getByRole("heading", { name: /Pilih Tanggal/i })).toBeDefined();
    expect(screen.getByLabelText(/Jumlah Penumpang/i)).toBeDefined();
    expect(screen.getByLabelText(/Waktu Keberangkatan/i)).toBeDefined();
    expect(screen.getByLabelText(/Catatan/i)).toBeDefined();

    // 3. Ringkasan pesanan menampilkan armada kapal yang telah dipaketkan oleh operator
    await waitFor(() => {
      expect(screen.getByText(/KM Segara Lestari/i)).toBeDefined();
    });
  }, 15000);

  it("membatasi jumlah penumpang agar tidak bisa melebihi kapasitas kemampuan kapal yang diset operator", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    vi.spyOn(supabase, "from").mockImplementation((table: string) => {
      if (table === "tour_packages") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: samplePackage }),
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      if (table === "boats") {
        return createBoatsMockChain() as unknown as ReturnType<typeof supabase.from>;
      }
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [] }) }) } as unknown as ReturnType<typeof supabase.from>;
    });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Booking)
      )
    );

    await waitFor(() => {
      expect(screen.getByText("Jelajah Mangrove & Laguna Segara Anakan")).toBeDefined();
    });

    const paxInput = screen.getByLabelText(/Jumlah Penumpang/i) as HTMLInputElement;
    expect(paxInput.getAttribute("max")).toBe("8");

    // Ketika user mencoba mengisi lebih dari kapasitas (misal: 15)
    fireEvent.change(paxInput, { target: { value: "15" } });

    // Nilai otomatis di-clamp ke kapasitas maksimal kapal operator (8)
    expect(paxInput.value).toBe("8");
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("8 pax")
    );
  });

  it("otomatis menggunakan kapal paket operator saat checkout tanpa pemilihan manual", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const mockRpc = vi.spyOn(supabase, "rpc").mockResolvedValue({
      data: { id: "booking-tour-1" },
      error: null,
    } as unknown as Awaited<ReturnType<typeof supabase.rpc>>);

    vi.spyOn(supabase, "from").mockImplementation((table: string) => {
      if (table === "tour_packages") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: samplePackage }),
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      if (table === "boats") {
        return createBoatsMockChain() as unknown as ReturnType<typeof supabase.from>;
      }
      return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [] }) }) } as unknown as ReturnType<typeof supabase.from>;
    });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Booking)
      )
    );

    await waitFor(() => {
      expect(screen.getByText("Jelajah Mangrove & Laguna Segara Anakan")).toBeDefined();
    });

    const dayButtons = screen.getAllByRole("gridcell");
    const selectableDay = dayButtons.find((btn) => !btn.hasAttribute("disabled") && btn.textContent !== "");
    if (selectableDay) {
      fireEvent.click(selectableDay);
    }

    const submitBtn = screen.getByRole("button", { name: /Lanjut ke Pembayaran/i });
    await waitFor(() => {
      expect(submitBtn.hasAttribute("disabled")).toBe(false);
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("pay-now-button")).toBeDefined();
    });

    const payNowBtn = screen.getByTestId("pay-now-button");
    fireEvent.click(payNowBtn);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("create_booking", expect.objectContaining({
        p_boat_id: "boat-op-1",
        p_passengers: 1,
        p_time: "09:00",
      }));
      expect(toast.success).toHaveBeenCalledWith("Booking berhasil dibuat!");
      expect(screen.getByText(/Pemesanan & Pembayaran Berhasil!/i)).toBeDefined();
    });

    const dashboardBtn = screen.getByRole("button", { name: /Buka di Dashboard/i });
    fireEvent.click(dashboardBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
});

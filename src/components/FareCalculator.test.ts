// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import FareCalculator from "./FareCalculator";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => {
  const mockSelect = vi.fn();
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  return {
    supabase: {
      from: mockFrom,
    },
    __mockSelect: mockSelect,
    __mockFrom: mockFrom,
  };
});

describe("FareCalculator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("menampilkan kalkulasi estimasi tarif dan rincian diskon grup dengan tepat", async () => {
    const mockBoats = [
      {
        id: "boat-1",
        name: "Speedboat Benawa 70",
        type: "speedboat",
        base_price: 50000,
        capacity: 70,
        location: "Teluk Penyu",
      },
    ];

    const mockOrder = vi.fn().mockResolvedValue({ data: mockBoats, error: null });
    const mockEq = vi.fn(() => ({ order: mockOrder }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as unknown as ReturnType<typeof supabase.from>);

    render(React.createElement(FareCalculator));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Hitung Estimasi/i })).toBeDefined();
    });

    // Ubah jumlah penumpang menjadi 20 orang (diskon 15%)
    const paxInput = screen.getByLabelText(/Jumlah Penumpang/i);
    fireEvent.change(paxInput, { target: { value: "20" } });

    // Durasi tetap 2 jam (multiplier = 1)
    const durInput = screen.getByLabelText(/Durasi Sewa/i);
    fireEvent.change(durInput, { target: { value: "2" } });

    // Klik tombol hitung
    const calcBtn = screen.getByRole("button", { name: /Hitung Estimasi/i });
    fireEvent.click(calcBtn);

    // 50000 * 20 * (2 / 2) * 0.85 = 850000
    await waitFor(() => {
      expect(screen.getByText(/Rp 850\.000/i)).toBeDefined();
      expect(screen.getByText("15%")).toBeDefined();
    });

    // Catatan produk yang wajib ada
    expect(
      screen.getByText(/Ini hanya estimasi\. Harga final saat booking = harga dasar x jumlah penumpang; diskon grup dan durasi pada kalkulator ini belum diterapkan pada booking\./i)
    ).toBeDefined();
  });

  it("menampilkan pesan galat bahasa Indonesia dan tombol coba lagi jika query gagal", async () => {
    const mockOrder = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Koneksi database terputus" },
    });
    const mockEq = vi.fn(() => ({ order: mockOrder }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as unknown as ReturnType<typeof supabase.from>);

    render(React.createElement(FareCalculator));

    await waitFor(() => {
      expect(screen.getByText(/Gagal memuat data kapal: Koneksi database terputus/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /Coba Lagi/i })).toBeDefined();
    });
  });

  it("menampilkan pesan 'Belum ada kapal tersedia' jika tidak ada kapal aktif", async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockEq = vi.fn(() => ({ order: mockOrder }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as unknown as ReturnType<typeof supabase.from>);

    render(React.createElement(FareCalculator));

    await waitFor(() => {
      expect(screen.getByText(/Belum ada kapal tersedia/i)).toBeDefined();
    });
  });
});

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: "booking-001",
                user_id: "tourist-001",
                boat_id: "boat-001",
                booking_date: "2026-11-20",
                departure_time: "08:30:00",
                passengers: 4,
                total_price: 350000,
                booking_status: "confirmed",
                payment_status: "dp_paid",
                notes: "Bawa 1 anak kecil",
                boats: {
                  name: "KM Sri Rejeki 03",
                  type: "kapal_kayu",
                  image_url: null,
                },
              },
            ],
            error: null,
          }),
        }),
      }),
    })),
  },
}));

import { supabase } from "@/integrations/supabase/client";

describe("Dashboard Wisatawan (Task 2 - Opsi B Full-Page Assistant)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("merender dua tab utama: 'Tiket & Riwayat' dan 'Juru Mudi AI Navigator'", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "tourist-001",
          email: "tourist@angkara.id",
          user_metadata: { role: "tourist" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Dashboard)
      )
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /Tiket & Riwayat/i })).toBeDefined();
      expect(screen.getByRole("tab", { name: /Juru Mudi AI/i })).toBeDefined();
    });
  });

  it("menampilkan ringkasan statistik perjalanan di tab tiket (Pelayaran Aktif, Trip Selesai, Total DP)", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "tourist-001",
          email: "tourist@angkara.id",
          user_metadata: { role: "tourist" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Dashboard)
      )
    );

    await waitFor(() => {
      expect(screen.getByText(/Pelayaran Aktif/i)).toBeDefined();
      expect(screen.getByText(/Trip Selesai/i)).toBeDefined();
      expect(screen.getByText(/Total Biaya/i)).toBeDefined();
    });
  });

  it("menampilkan tombol 'E-Tiket & Boarding Pass' dan membuka modal E-Tiket saat diklik", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "tourist-001",
          email: "tourist@angkara.id",
          user_metadata: { role: "tourist" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Dashboard)
      )
    );

    await waitFor(() => {
      const eticketBtn = screen.getByRole("button", { name: /E-Tiket & Boarding Pass/i });
      expect(eticketBtn).toBeDefined();
      fireEvent.click(eticketBtn);
    });

    await waitFor(() => {
      // Modal e-tiket menampilkan identitas pelayaran dan info jaket pelampung
      expect(screen.getByText(/E-Tiket Penyeberangan Wisata/i)).toBeDefined();
      expect(screen.getAllByText(/jaket pelampung/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Dermaga Pandanarang/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("beralih ke tab 'Juru Mudi AI Navigator' menampilkan antarmuka chat layar penuh bergaya Gemini/ChatGPT", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "tourist-001",
          email: "tourist@angkara.id",
          user_metadata: { role: "tourist" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Dashboard)
      )
    );

    await waitFor(() => {
      const aiTab = screen.getByRole("tab", { name: /Juru Mudi AI/i });
      fireEvent.mouseDown(aiTab, { button: 0 });
      fireEvent.click(aiTab);
    });

    await waitFor(() => {
      expect(screen.getByText(/Asisten Cerdas Navigasi & Cuaca Maritim/i)).toBeDefined();
      expect(screen.getByPlaceholderText(/Tanyakan rute kapal, perkiraan cuaca/i)).toBeDefined();
    });
  });

  it("otomatis mengarahkan akun admin ke /admin jika membuka /dashboard", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "admin-001",
          email: "admin@angkara.id",
          user_metadata: { role: "admin" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Dashboard)
      )
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin", { replace: true });
    });
  });

  it("menampilkan status 'Menunggu Pembayaran' dan tombol 'Bayar Sekarang' untuk tiket berstatus pending", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "tourist-001",
          email: "tourist@angkara.id",
          user_metadata: { role: "tourist" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    const mockOrder = vi.fn().mockResolvedValue({
      data: [
        {
          id: "booking-pending-01",
          user_id: "tourist-001",
          boat_id: "boat-001",
          booking_date: "2026-11-28",
          departure_time: "09:00:00",
          passengers: 2,
          total_price: 200000,
          booking_status: "pending",
          payment_status: "pending",
          notes: "Menunggu pembayaran QRIS",
          boats: {
            name: "KM Segara Anakan",
            type: "speedboat",
            image_url: null,
          },
        },
      ],
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: mockOrder,
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Dashboard)
      )
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Menunggu Pembayaran/i).length).toBeGreaterThanOrEqual(1);
      const payBtn = screen.getByTestId("pay-booking-booking-pending-01");
      expect(payBtn).toBeDefined();
      expect(payBtn.textContent).toContain("Bayar Sekarang");
    });
  });
});

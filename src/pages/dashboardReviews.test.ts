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
    from: vi.fn(),
  },
}));

import { supabase } from "@/integrations/supabase/client";

describe("Ulasan Pasca-Trip Selesai di Dashboard Wisatawan (TDD)", () => {
  const mockUser = {
    id: "tourist-001",
    email: "tourist@angkara.id",
    user_metadata: { role: "tourist", full_name: "Wisatawan Asli" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
    } as unknown as { data: { user: null }; error: null });
  });

  afterEach(() => {
    cleanup();
  });

  it("booking berstatus 'completed' yang belum diulas menampilkan tombol 'Beri Ulasan Pelayaran'", async () => {
    const mockBookings = [
      {
        id: "booking-completed-1",
        user_id: "tourist-001",
        boat_id: "boat-001",
        booking_date: "2026-11-20",
        departure_time: "08:30:00",
        passengers: 4,
        total_price: 350000,
        booking_status: "completed",
        payment_status: "dp_paid",
        notes: null,
        boats: {
          name: "KM Sri Rejeki 03",
          type: "kapal_kayu",
          image_url: null,
        },
      },
    ];

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "bookings") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockBookings, error: null }),
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      if (table === "reviews") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>;
    });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Dashboard)
      )
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Beri Ulasan Pelayaran/i })).toBeDefined();
    });
  });

  it("booking yang berstatus 'confirmed' (belum selesai) TIDAK menampilkan tombol 'Beri Ulasan Pelayaran'", async () => {
    const mockBookings = [
      {
        id: "booking-confirmed-1",
        user_id: "tourist-001",
        boat_id: "boat-001",
        booking_date: "2026-11-25",
        departure_time: "09:00:00",
        passengers: 2,
        total_price: 200000,
        booking_status: "confirmed",
        payment_status: "dp_paid",
        notes: null,
        boats: {
          name: "Speedboat Samudra Kilat",
          type: "speedboat",
          image_url: null,
        },
      },
    ];

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "bookings") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockBookings, error: null }),
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      if (table === "reviews") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>;
    });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Dashboard)
      )
    );

    await waitFor(() => {
      expect(screen.getByText(/Speedboat Samudra Kilat/i)).toBeDefined();
      expect(screen.queryByRole("button", { name: /Beri Ulasan Pelayaran/i })).toBeNull();
    });
  });

  it("booking completed yang sudah diulas menampilkan penanda 'Ulasan Terkirim' dan tidak menampilkan tombol beri ulasan", async () => {
    const mockBookings = [
      {
        id: "booking-completed-2",
        user_id: "tourist-001",
        boat_id: "boat-001",
        booking_date: "2026-11-15",
        departure_time: "08:00:00",
        passengers: 3,
        total_price: 300000,
        booking_status: "completed",
        payment_status: "dp_paid",
        notes: null,
        boats: {
          name: "KM Sri Rejeki 03",
          type: "kapal_kayu",
          image_url: null,
        },
      },
    ];

    const mockReviews = [
      {
        id: "rev-1",
        booking_id: "booking-completed-2",
        rating: 5,
        comment: "Pelayaran sangat nyaman dan aman!",
      },
    ];

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "bookings") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockBookings, error: null }),
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      if (table === "reviews") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: mockReviews, error: null }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>;
    });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Dashboard)
      )
    );

    await waitFor(() => {
      expect(screen.getByText(/Ulasan Terkirim/i)).toBeDefined();
      expect(screen.queryByRole("button", { name: /Beri Ulasan Pelayaran/i })).toBeNull();
    });
  });

  it("membuka ReviewModal saat tombol 'Beri Ulasan Pelayaran' diklik dan menyimpan ulasan ke database", async () => {
    const mockBookings = [
      {
        id: "booking-completed-3",
        user_id: "tourist-001",
        boat_id: "boat-001",
        booking_date: "2026-11-20",
        departure_time: "08:30:00",
        passengers: 2,
        total_price: 250000,
        booking_status: "completed",
        payment_status: "dp_paid",
        notes: null,
        boats: {
          name: "KM Sri Rejeki 03",
          type: "kapal_kayu",
          image_url: null,
        },
      },
    ];

    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "bookings") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockBookings, error: null }),
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      if (table === "reviews") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
          insert: mockInsert,
        } as unknown as ReturnType<typeof supabase.from>;
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      } as unknown as ReturnType<typeof supabase.from>;
    });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Dashboard)
      )
    );

    // 1. Cari dan klik tombol Beri Ulasan
    await waitFor(() => {
      const reviewBtn = screen.getByRole("button", { name: /Beri Ulasan Pelayaran/i });
      fireEvent.click(reviewBtn);
    });

    // 2. Modal review muncul
    await waitFor(() => {
      expect(screen.getByText(/Ulasan Pelayaran Selesai/i)).toBeDefined();
    });

    // 3. Masukkan ulasan teks minimal 10 karakter
    const commentInput = screen.getByPlaceholderText(/Ceritakan pengalaman berlayar Anda/i);
    fireEvent.change(commentInput, {
      target: { value: "Perjalanan laut sangat menyenangkan, ombak tenang dan nakhoda ramah." },
    });

    // 4. Submit ulasan
    const submitBtn = screen.getByRole("button", { name: /Kirim Ulasan/i });
    fireEvent.click(submitBtn);

    // 5. Verifikasi insert terpanggil dengan booking_id dan boat_id
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          booking_id: "booking-completed-3",
          boat_id: "boat-001",
          user_id: "tourist-001",
          rating: 5,
          comment: "Perjalanan laut sangat menyenangkan, ombak tenang dan nakhoda ramah.",
        })
      );
    });
  });
});

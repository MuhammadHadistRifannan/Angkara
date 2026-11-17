// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import OperatorDashboard from "./OperatorDashboard";
import { toast } from "sonner";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockBookingsData = [
  {
    id: "booking-pending-01",
    user_id: "user-101",
    boat_id: "boat-001",
    booking_date: "2026-11-20",
    departure_time: "08:30:00",
    passengers: 4,
    total_price: 350000,
    booking_status: "pending",
    payment_status: "dp_paid",
    notes: "Bawa anak kecil",
    boats: {
      id: "boat-001",
      operator_id: "op-001",
      name: "KM Sri Rejeki 01",
      type: "kapal_kayu",
    },
  },
  {
    id: "booking-confirmed-02",
    user_id: "user-102",
    boat_id: "boat-001",
    booking_date: "2026-11-21",
    departure_time: "09:00:00",
    passengers: 6,
    total_price: 500000,
    booking_status: "confirmed",
    payment_status: "dp_paid",
    notes: "Trip memancing",
    boats: {
      id: "boat-001",
      operator_id: "op-001",
      name: "KM Sri Rejeki 01",
      type: "kapal_kayu",
    },
  },
  {
    id: "booking-completed-03",
    user_id: "user-103",
    boat_id: "boat-001",
    booking_date: "2026-11-19",
    departure_time: "07:00:00",
    passengers: 2,
    total_price: 200000,
    booking_status: "completed",
    payment_status: "paid",
    notes: null,
    boats: {
      id: "boat-001",
      operator_id: "op-001",
      name: "KM Sri Rejeki 01",
      type: "kapal_kayu",
    },
  },
];

const mockUpdateFn = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ error: null }),
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn(),
    },
    from: vi.fn((table: string) => {
      if (table === "operators") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: "op-001",
                  user_id: "operator-user-001",
                  company_name: "Koperasi Nelayan Pandanarang",
                  phone: "08123456789",
                  email: "operator@angkara.id",
                  verified: true,
                },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "boats") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                {
                  id: "boat-001",
                  operator_id: "op-001",
                  name: "KM Sri Rejeki 01",
                  type: "kapal_kayu",
                  capacity: 10,
                  base_price: 350000,
                  available: true,
                },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "bookings") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [...mockBookingsData],
                error: null,
              }),
            }),
          }),
          update: mockUpdateFn,
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };
    }),
  },
}));

import { supabase } from "@/integrations/supabase/client";

describe("OperatorDashboard - Task 3 Konsol Booking Operator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "operator-user-001",
          email: "operator@angkara.id",
          user_metadata: { role: "operator" },
        },
      },
    } as unknown as { data: { user: null }; error: null });
  });

  afterEach(() => {
    cleanup();
  });

  it("menampilkan tab Booking dengan filter status dan badge hitungan", async () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(OperatorDashboard)
      )
    );

    // Buka tab booking
    await waitFor(() => {
      const bookingsTab = screen.getByRole("tab", { name: /Booking/i });
      fireEvent.mouseDown(bookingsTab, { button: 0 });
      fireEvent.click(bookingsTab);
    });

    await waitFor(() => {
      // Verifikasi tombol-tombol filter status booking hadir
      expect(screen.getByRole("button", { name: /Filter status: Semua/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /Filter status: Menunggu/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /Filter status: Terkonfirmasi/i })).toBeDefined();
      expect(screen.getByRole("button", { name: /Filter status: Selesai/i })).toBeDefined();
    });
  });

  it("dapat menerima booking yang berstatus pending menjadi confirmed", async () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(OperatorDashboard)
      )
    );

    // Buka tab booking
    await waitFor(() => {
      const bookingsTab = screen.getByRole("tab", { name: /Booking/i });
      fireEvent.mouseDown(bookingsTab, { button: 0 });
      fireEvent.click(bookingsTab);
    });

    await waitFor(() => {
      // Temukan tombol 'Terima Booking'
      const acceptBtn = screen.getByRole("button", { name: /Terima Booking/i });
      expect(acceptBtn).toBeDefined();
      fireEvent.click(acceptBtn);
    });

    // Verifikasi pemanggilan update ke supabase dengan status 'confirmed'
    await waitFor(() => {
      expect(mockUpdateFn).toHaveBeenCalledWith(
        expect.objectContaining({ booking_status: "confirmed" })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/dikonfirmasi/i));
    });
  });

  it("dapat menyelesaikan pelayaran yang berstatus confirmed menjadi completed", async () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(OperatorDashboard)
      )
    );

    await waitFor(() => {
      const bookingsTab = screen.getByRole("tab", { name: /Booking/i });
      fireEvent.mouseDown(bookingsTab, { button: 0 });
      fireEvent.click(bookingsTab);
    });

    await waitFor(() => {
      // Temukan tombol 'Selesaikan Trip' pada booking terkonfirmasi
      const completeBtn = screen.getByRole("button", { name: /Selesaikan Trip/i });
      expect(completeBtn).toBeDefined();
      fireEvent.click(completeBtn);
    });

    await waitFor(() => {
      expect(mockUpdateFn).toHaveBeenCalledWith(
        expect.objectContaining({ booking_status: "completed" })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/selesai/i));
    });
  });

  it("dapat menolak / membatalkan booking", async () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(OperatorDashboard)
      )
    );

    await waitFor(() => {
      const bookingsTab = screen.getByRole("tab", { name: /Booking/i });
      fireEvent.mouseDown(bookingsTab, { button: 0 });
      fireEvent.click(bookingsTab);
    });

    await waitFor(() => {
      // Temukan tombol tolak
      const rejectBtn = screen.getByRole("button", { name: /Tolak Booking/i });
      expect(rejectBtn).toBeDefined();
      fireEvent.click(rejectBtn);
    });

    await waitFor(() => {
      expect(mockUpdateFn).toHaveBeenCalledWith(
        expect.objectContaining({ booking_status: "cancelled" })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/dibatalkan|ditolak/i));
    });
  });

  it("filter status dapat memilah daftar booking secara responsif", async () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(OperatorDashboard)
      )
    );

    await waitFor(() => {
      const bookingsTab = screen.getByRole("tab", { name: /Booking/i });
      fireEvent.mouseDown(bookingsTab, { button: 0 });
      fireEvent.click(bookingsTab);
    });

    await waitFor(() => {
      expect(screen.getByText("Bawa anak kecil")).toBeDefined();
      expect(screen.getByText("Trip memancing")).toBeDefined();
    });

    // Klik filter 'Menunggu'
    const pendingFilter = screen.getByRole("button", { name: /Filter status: Menunggu/i });
    fireEvent.click(pendingFilter);

    await waitFor(() => {
      // Hanya pending yang muncul
      expect(screen.getByText("Bawa anak kecil")).toBeDefined();
      expect(screen.queryByText("Trip memancing")).toBeNull();
    });
  });
});

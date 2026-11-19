// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
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

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

import { supabase } from "@/integrations/supabase/client";

const mockOperators = [
  {
    id: "op-1",
    name: "Koperasi Nelayan Pandanarang",
    contact: "0812345678",
    ksop_permit_number: "KSOP/CLP/2026/01",
    verified: false,
    created_at: "2026-11-01T00:00:00Z",
  },
];

const mockBoats = [
  {
    id: "boat-1",
    name: "KM Sri Rejeki 01",
    type: "kapal_kayu",
    capacity: 10,
    is_available: true,
    operator_id: "op-1",
    operators: { name: "Koperasi Nelayan Pandanarang" },
  },
];

const mockTourPackages = [
  {
    id: "tour-1",
    title: "Eksplorasi Karang Bolong",
    price: 350000,
    duration: "4 Jam",
    is_active: true,
    operator_id: "op-1",
    operators: { name: "Koperasi Nelayan Pandanarang" },
  },
];

const mockReviews = [
  {
    id: "rev-1",
    rating: 1,
    comment: "Komentar promosi spam judi online",
    created_at: "2026-11-19T08:00:00Z",
    boats: { name: "KM Sri Rejeki 01" },
  },
];

const mockBookings = [
  {
    id: "b-101",
    booking_date: "2026-11-20",
    departure_time: "08:30:00",
    passengers: 4,
    total_price: 450000,
    booking_status: "confirmed",
    boats: { name: "KM Sri Rejeki 01" },
  },
];

describe("AdminDashboard - Role Pengelola Platform SUAR", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn().mockReturnValue(true);
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as unknown as ReturnType<typeof supabase.auth.onAuthStateChange>);
  });

  afterEach(() => {
    cleanup();
  });

  it("menolak akses jika pengunjung bukan admin dan mengarahkan ke /", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "tourist-01",
          email: "tourist@angkara.id",
          user_metadata: { role: "tourist" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(AdminDashboard)
      )
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("merender konsol admin dan ringkasan metrik platform untuk akun admin", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "admin-01",
          email: "admin@angkara.id",
          user_metadata: { role: "admin" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "operators") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockOperators, error: null }),
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      if (table === "boats") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockBoats, error: null }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      if (table === "tour_packages") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockTourPackages, error: null }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      if (table === "reviews") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockReviews, error: null }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      if (table === "bookings") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockBookings, error: null }),
          }),
        } as unknown as ReturnType<typeof supabase.from>;
      }
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
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
        React.createElement(AdminDashboard)
      )
    );

    await waitFor(() => {
      expect(screen.getByText(/Konsol Pengelola Platform SUAR/i)).toBeDefined();
      expect(screen.getByText(/Koperasi Nelayan Pandanarang/i)).toBeDefined();
    }, { timeout: 8000 });
  });

  it("memungkinkan admin memverifikasi operator perahu", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "admin-01",
          email: "admin@angkara.id",
          user_metadata: { role: "admin" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "operators") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockOperators, error: null }),
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
          update: mockUpdate,
        } as unknown as ReturnType<typeof supabase.from>;
      }
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
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
        React.createElement(AdminDashboard)
      )
    );

    await waitFor(() => {
      expect(screen.getByText(/Setujui/i)).toBeDefined();
    }, { timeout: 8000 });

    const verifyBtn = screen.getByRole("button", { name: /Setujui/i });
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({ verified: true });
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/diverifikasi/i));
    });
  });

  it("memungkinkan admin memoderasi dan menghapus ulasan bermasalah", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "admin-01",
          email: "admin@angkara.id",
          user_metadata: { role: "admin" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "reviews") {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockReviews, error: null }),
          }),
          delete: mockDelete,
        } as unknown as ReturnType<typeof supabase.from>;
      }
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
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
        React.createElement(AdminDashboard)
      )
    );

    // Pindah ke tab Ulasan
    await waitFor(() => {
      const ulasanTab = screen.getByRole("tab", { name: /Ulasan/i });
      fireEvent.mouseDown(ulasanTab, { button: 0 });
      fireEvent.click(ulasanTab);
    }, { timeout: 8000 });

    await waitFor(() => {
      expect(screen.getByText(/Komentar promosi spam judi online/i)).toBeDefined();
    }, { timeout: 8000 });

    const deleteBtn = screen.getByRole("button", { name: /Hapus Ulasan/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/dihapus/i));
    });
  });

  it("memungkinkan admin melakukan override status berlayar platform", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "admin-01",
          email: "admin@angkara.id",
          user_metadata: { role: "admin" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    } as unknown as ReturnType<typeof supabase.from>);

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(AdminDashboard)
      )
    );

    // Pindah ke tab Kontrol Berlayar
    await waitFor(() => {
      const kontrolTab = screen.getByRole("tab", { name: /Kontrol Berlayar/i });
      fireEvent.mouseDown(kontrolTab, { button: 0 });
      fireEvent.click(kontrolTab);
    }, { timeout: 8000 });

    await waitFor(() => {
      expect(screen.getByText(/Override Status Keselamatan Pelayaran/i)).toBeDefined();
    }, { timeout: 8000 });

    const tundaBtn = screen.getByRole("button", { name: /Tunda Semua Pelayaran/i });
    fireEvent.click(tundaBtn);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/Status pelayaran diubah/i));
    });
  });
});

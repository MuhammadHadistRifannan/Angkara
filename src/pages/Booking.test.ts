// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Booking from "./Booking";
import { toast } from "sonner";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams("boatId=boat-123")],
  };
});

vi.mock("@/integrations/supabase/client", () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  const mockRpc = vi.fn();

  return {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
      },
      from: mockFrom,
      rpc: mockRpc,
    },
  };
});

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("Booking Page (src/pages/Booking.tsx)", () => {
  const sampleBoat = {
    id: "boat-123",
    name: "Baruna Express",
    description: "Kapal cepat Teluk Penyu",
    base_price: 50000,
    capacity: 20,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase: s } = await import("@/integrations/supabase/client");
    const mockFrom = s.from as unknown as ReturnType<typeof vi.fn>;
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: sampleBoat }),
        }),
      }),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("berhasil membuat booking via RPC create_booking dan navigasi ke dashboard", async () => {
    const { supabase: s } = await import("@/integrations/supabase/client");
    const mockRpc = s.rpc as unknown as ReturnType<typeof vi.fn>;
    mockRpc.mockResolvedValue({
      data: { id: "booking-999" },
      error: null,
    });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Booking)
      )
    );

    await waitFor(() => {
      expect(screen.getByText("Baruna Express")).toBeDefined();
    });

    const submitBtn = screen.getByRole("button", { name: /Lanjut ke Pembayaran/i });
    expect(submitBtn.hasAttribute("disabled")).toBe(true);

    const dayButtons = screen.getAllByRole("gridcell");
    const selectableDay = dayButtons.find((btn) => !btn.hasAttribute("disabled") && btn.textContent !== "");
    if (selectableDay) {
      fireEvent.click(selectableDay);
    }

    await waitFor(() => {
      expect(submitBtn.hasAttribute("disabled")).toBe(false);
    });

    const notesInput = screen.getByPlaceholderText(/Tambahkan catatan/i);
    fireEvent.change(notesInput, { target: { value: "Bawa rombongan keluarga" } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("create_booking", expect.objectContaining({
        p_boat_id: "boat-123",
        p_passengers: 1,
        p_time: "09:00",
        p_notes: "Bawa rombongan keluarga",
      }));
      expect(toast.success).toHaveBeenCalledWith("Booking berhasil dibuat!");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("menampilkan pesan galat 'not_enough_seats' dan mempertahankan isian form", async () => {
    const { supabase: s } = await import("@/integrations/supabase/client");
    const mockRpc = s.rpc as unknown as ReturnType<typeof vi.fn>;
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "not_enough_seats" },
    });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Booking)
      )
    );

    await waitFor(() => {
      expect(screen.getByText("Baruna Express")).toBeDefined();
    });

    const dayButtons = screen.getAllByRole("gridcell");
    const selectableDay = dayButtons.find((btn) => !btn.hasAttribute("disabled") && btn.textContent !== "");
    if (selectableDay) {
      fireEvent.click(selectableDay);
    }

    const paxInput = screen.getByLabelText(/Jumlah Penumpang/i) as HTMLInputElement;
    fireEvent.change(paxInput, { target: { value: "5" } });

    const notesInput = screen.getByPlaceholderText(/Tambahkan catatan/i) as HTMLTextAreaElement;
    fireEvent.change(notesInput, { target: { value: "Catatan tetap ada" } });

    const submitBtn = screen.getByRole("button", { name: /Lanjut ke Pembayaran/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Kursi tidak cukup untuk tanggal ini. Coba kurangi penumpang atau pilih tanggal lain."
      );
      expect(paxInput.value).toBe("5");
      expect(notesInput.value).toBe("Catatan tetap ada");
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("menangani galat 'not_authenticated' dengan toast login dan navigasi ke /auth", async () => {
    const { supabase: s } = await import("@/integrations/supabase/client");
    const mockRpc = s.rpc as unknown as ReturnType<typeof vi.fn>;
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "not_authenticated" },
    });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Booking)
      )
    );

    await waitFor(() => {
      expect(screen.getByText("Baruna Express")).toBeDefined();
    });

    const dayButtons = screen.getAllByRole("gridcell");
    const selectableDay = dayButtons.find((btn) => !btn.hasAttribute("disabled") && btn.textContent !== "");
    if (selectableDay) {
      fireEvent.click(selectableDay);
    }

    const submitBtn = screen.getByRole("button", { name: /Lanjut ke Pembayaran/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Silakan login terlebih dahulu.");
      expect(mockNavigate).toHaveBeenCalledWith("/auth");
    });
  });
});

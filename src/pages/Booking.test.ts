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

const mockRequestSnapToken = vi.fn().mockResolvedValue({ token: "snap-token-123" });
const mockOpenSnapPayment = vi.fn((_token: string, callbacks?: { onClose?: () => void; onSuccess?: () => void }) => {
  // Default simulasi: user menutup modal Snap tanpa bayar
  callbacks?.onClose?.();
});

vi.mock("@/lib/midtrans", () => ({
  loadMidtransSnapScript: vi.fn().mockResolvedValue(undefined),
  requestSnapToken: (...args: unknown[]) => mockRequestSnapToken(...args),
  openSnapPayment: (...args: unknown[]) => mockOpenSnapPayment(...args as [string, { onClose?: () => void; onSuccess?: () => void }?]),
}));

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
    info: vi.fn(),
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

  it("berhasil melalui progress bar, memilih metode pembayaran Midtrans, dan saat Snap ditutup status tetap pending", async () => {
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

    // Langkah 1: Detail Trip & Formulir
    await waitFor(() => {
      expect(screen.getByText("Baruna Express")).toBeDefined();
      expect(screen.getByText("Harga per pax")).toBeDefined();
      expect(screen.getByLabelText(/Tujuan Penyeberangan/i)).toBeDefined();
      expect(screen.getByText("Detail Trip")).toBeDefined();
      expect(screen.getByText("Metode Pembayaran")).toBeDefined();
    });

    const initialSubmitBtn = screen.getByRole("button", { name: /Lanjut ke Pembayaran/i });
    expect(initialSubmitBtn.hasAttribute("disabled")).toBe(true);

    const dayButtons = screen.getAllByRole("gridcell");
    const selectableDay = dayButtons.find((btn) => !btn.hasAttribute("disabled") && btn.textContent !== "");
    if (selectableDay) {
      fireEvent.click(selectableDay);
    }

    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /Lanjut ke Pembayaran/i });
      expect(btn.hasAttribute("disabled")).toBe(false);
    });

    const submitBtn = screen.getByRole("button", { name: /Lanjut ke Pembayaran/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("pay-now-button")).toBeDefined();
    });

    // Klik tombol Bayar Sekarang
    const payNowBtn = screen.getByTestId("pay-now-button");
    fireEvent.click(payNowBtn);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("create_booking", expect.objectContaining({
        p_boat_id: "boat-123",
        p_passengers: 1,
        p_time: "09:00",
      }));
      expect(toast.success).toHaveBeenCalledWith("Booking berhasil dibuat!");
      // Karena Snap ditutup sebelum bayar, status harus Menunggu Pembayaran (Pending), bukan sukses palsu!
      expect(screen.getAllByText(/Menunggu Pembayaran \(Pending\)/i).length).toBeGreaterThanOrEqual(1);
    });

    // Klik tombol Buka Daftar Pesanan di Dashboard
    const dashboardBtn = screen.getByRole("button", { name: /Buka Daftar Pesanan di Dashboard/i });
    fireEvent.click(dashboardBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard?tab=tickets");
  });

  it("menampilkan status lunas & banner sukses bila pembayaran Midtrans berhasil diselesaikan (onSuccess)", async () => {
    mockOpenSnapPayment.mockImplementationOnce((_token: string, callbacks?: { onSuccess?: () => void }) => {
      callbacks?.onSuccess?.();
    });

    const { supabase: s } = await import("@/integrations/supabase/client");
    const mockRpc = s.rpc as unknown as ReturnType<typeof vi.fn>;
    mockRpc.mockResolvedValue({
      data: { id: "booking-888" },
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

    const dayButtons = screen.getAllByRole("gridcell");
    const selectableDay = dayButtons.find((btn) => !btn.hasAttribute("disabled") && btn.textContent !== "");
    if (selectableDay) {
      fireEvent.click(selectableDay);
    }

    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /Lanjut ke Pembayaran/i });
      expect(btn.hasAttribute("disabled")).toBe(false);
    });

    const submitBtn = screen.getByRole("button", { name: /Lanjut ke Pembayaran/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("pay-now-button")).toBeDefined();
    });

    const payNowBtn = screen.getByTestId("pay-now-button");
    fireEvent.click(payNowBtn);

    await waitFor(() => {
      expect(screen.getByText(/Pemesanan & Pembayaran Berhasil!/i)).toBeDefined();
      expect(toast.success).toHaveBeenCalledWith("Pembayaran Midtrans berhasil!");
    });
  });

  it("menampilkan pesan galat 'not_enough_seats' saat proses pembayaran gagal kursi", async () => {
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
      expect(screen.getByTestId("pay-now-button")).toBeDefined();
    });

    const payNowBtn = screen.getByTestId("pay-now-button");
    fireEvent.click(payNowBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Kursi tidak cukup untuk tanggal ini. Coba kurangi penumpang atau pilih tanggal lain."
      );
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

    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /Lanjut ke Pembayaran/i });
      expect(btn.hasAttribute("disabled")).toBe(false);
    });

    const submitBtn = screen.getByRole("button", { name: /Lanjut ke Pembayaran/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("pay-now-button")).toBeDefined();
    });

    const payNowBtn = screen.getByTestId("pay-now-button");
    fireEvent.click(payNowBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Silakan login terlebih dahulu.");
      expect(mockNavigate).toHaveBeenCalledWith("/auth");
    });
  });

  it("mengizinkan penghapusan angka penumpang menjadi kosong lalu mengganti ke angka 2 tanpa bug 12, dan tujuan tidak terpotong", async () => {
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

    const paxInput = screen.getByLabelText(/Jumlah Penumpang/i) as HTMLInputElement;
    expect(paxInput.value).toBe("1");

    // Simulasi user menghapus angka 1 (menjadi kosong)
    fireEvent.change(paxInput, { target: { value: "" } });
    expect(paxInput.value).toBe("");

    // Simulasi user mengetik angka 2
    fireEvent.change(paxInput, { target: { value: "2" } });
    expect(paxInput.value).toBe("2");

    // Simulasi blur saat kosong kembali ke 1
    fireEvent.change(paxInput, { target: { value: "" } });
    fireEvent.blur(paxInput);
    expect(paxInput.value).toBe("1");

    // Verifikasi elemen tujuan di ringkasan pesanan tidak memiliki kelas truncate
    const destElements = screen.getAllByText(/Pantai Karang Bolong/i);
    const destSummary = destElements.find((el) => el.tagName.toLowerCase() === "span" && !el.closest("select"));
    expect(destSummary).toBeDefined();
    expect(destSummary?.className).not.toContain("truncate");
  });
});

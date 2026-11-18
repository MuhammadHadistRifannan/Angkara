// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import OperatorDashboard from "./OperatorDashboard";
import { ManifestModal } from "@/components/ManifestModal";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockBookingForManifest = {
  id: "booking-manifest-001",
  user_id: "user-101",
  boat_id: "boat-001",
  booking_date: "2026-11-20",
  departure_time: "08:30:00",
  passengers: 4,
  total_price: 350000,
  booking_status: "confirmed" as const,
  payment_status: "dp_paid" as const,
  notes: "Bawa 1 balita dan 1 lansia",
  boats: {
    id: "boat-001",
    operator_id: "op-001",
    name: "KM Sri Rejeki 01",
    type: "kapal_kayu",
  },
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: "operator-user-001",
            email: "operator@angkara.id",
            user_metadata: { role: "operator" },
          },
        },
      }),
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
                data: [mockBookingForManifest],
                error: null,
              }),
            }),
          }),
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

describe("OperatorDashboard & ManifestModal - Task 5 Manifes Penumpang & Checklist KSOP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("menampilkan tombol 'Manifes KSOP' pada kartu booking di tab Booking", async () => {
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
      const manifestBtn = screen.getByRole("button", { name: /Manifes KSOP/i });
      expect(manifestBtn).toBeDefined();
    });
  });

  it("membuka ManifestModal dan menampilkan lembar resmi KSOP, rincian penumpang, dan alokasi pelampung SOLAS", () => {
    render(
      React.createElement(ManifestModal, {
        open: true,
        onOpenChange: vi.fn(),
        booking: mockBookingForManifest,
        operatorName: "Koperasi Nelayan Pandanarang",
      })
    );

    expect(screen.getByText(/KANTOR KESYAHBANDARAN DAN OTORITAS PELABUHAN/i)).toBeDefined();
    expect(screen.getAllByText(/LEMBAR MANIFES PENUMPANG & CHECKLIST KELAIKAN/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/KM Sri Rejeki 01/i)).toBeDefined();
    expect(screen.getByText(/4 Orang/i)).toBeDefined();
    expect(screen.getByText(/4 Jaket Pelampung SOLAS/i)).toBeDefined();
    expect(screen.getByText(/Bawa 1 balita dan 1 lansia/i)).toBeDefined();
  });

  it("menampilkan 5 butir checklist kepatuhan kelaikan Syahbandar KSOP dan dapat dicentang", () => {
    render(
      React.createElement(ManifestModal, {
        open: true,
        onOpenChange: vi.fn(),
        booking: mockBookingForManifest,
        operatorName: "Koperasi Nelayan Pandanarang",
      })
    );

    expect(screen.getByText(/Rompi pelampung standar SOLAS/i)).toBeDefined();
    expect(screen.getByText(/Kotak P3K Maritim & senter isyarat/i)).toBeDefined();
    expect(screen.getByText(/Kondisi mesin kapal, kemudi, dan bahan bakar cadangan/i)).toBeDefined();
    expect(screen.getByText(/Telemetri cuaca maritim BMKG/i)).toBeDefined();
    expect(screen.getByText(/Surat Persetujuan Berlayar/i)).toBeDefined();
  });

  it("tombol 'Cetak Manifes' memanggil window.print()", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});

    render(
      React.createElement(ManifestModal, {
        open: true,
        onOpenChange: vi.fn(),
        booking: mockBookingForManifest,
        operatorName: "Koperasi Nelayan Pandanarang",
      })
    );

    const printBtn = screen.getByRole("button", { name: /Cetak Manifes/i });
    expect(printBtn).toBeDefined();
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });
});

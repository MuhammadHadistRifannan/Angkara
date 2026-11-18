// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import OperatorDashboard from "./OperatorDashboard";
import { TourPackageModal } from "@/components/TourPackageModal";
import { supabase } from "@/integrations/supabase/client";

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
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

const mockPackagesData = [
  {
    id: "pkg-001",
    operator_id: "op-001",
    name: "Paket Sunset Teluk Penyu & Karang Bolong",
    description: "Jelajah sore santai mengitari Karang Bolong",
    duration_hours: 2,
    price: 350000,
    includes: ["Pelampung SOLAS", "Pemandu Lokal"],
    max_participants: 8,
    available: true,
  },
];

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    }),
    removeChannel: vi.fn(),
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
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }
      if (table === "tour_packages") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: mockPackagesData,
              error: null,
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: "pkg-new-999",
                  operator_id: "op-001",
                  name: "Trip Mancing Karang Dalam",
                  description: "Mancing kakap merah",
                  duration_hours: 4,
                  price: 500000,
                  includes: ["Pelampung SOLAS"],
                  max_participants: 6,
                  available: true,
                },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }
      if (table === "bookings") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
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

describe("Manajemen Paket Tour di Operator Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("menampilkan tab 'Paket Wisata' di dashboard operator", async () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(OperatorDashboard)
      )
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /Paket Wisata/i })).toBeDefined();
    });
  });

  it("membuka modal 'Tambah Paket' saat tombol Tambah Paket diklik di tab Paket Wisata", async () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(OperatorDashboard)
      )
    );

    await waitFor(() => {
      const tab = screen.getByRole("tab", { name: /Paket Wisata/i });
      fireEvent.mouseDown(tab, { button: 0 });
      fireEvent.click(tab);
    });

    await waitFor(() => {
      expect(screen.getByText(/Paket Sunset Teluk Penyu/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /Tambah Paket/i })).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: /Tambah Paket/i }));

    await waitFor(() => {
      expect(screen.getByText(/Tambah Paket Wisata Baru/i)).toBeDefined();
    });
  });

  it("komponen TourPackageModal menyimpan paket baru ke Supabase saat form disubmit", async () => {
    const onSaveSuccess = vi.fn();
    render(
      React.createElement(TourPackageModal, {
        open: true,
        onOpenChange: vi.fn(),
        operatorId: "op-001",
        onSaveSuccess,
      })
    );

    expect(screen.getByText(/Tambah Paket Wisata Baru/i)).toBeDefined();

    const nameInput = screen.getByLabelText(/Nama Paket Wisata/i);
    fireEvent.change(nameInput, { target: { value: "Trip Mancing Karang Dalam" } });

    const priceInput = screen.getByLabelText(/Tarif Paket/i);
    fireEvent.change(priceInput, { target: { value: "500000" } });

    const submitBtn = screen.getByRole("button", { name: /Simpan Paket/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("tour_packages");
      expect(onSaveSuccess).toHaveBeenCalled();
    });
  });

  it("dapat mengubah status ketersediaan paket (toggle status aktif/nonaktif)", async () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(OperatorDashboard)
      )
    );

    await waitFor(() => {
      const tab = screen.getByRole("tab", { name: /Paket Wisata/i });
      fireEvent.mouseDown(tab, { button: 0 });
      fireEvent.click(tab);
    });

    await waitFor(() => {
      expect(screen.getByText(/Paket Sunset Teluk Penyu/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /Nonaktifkan/i })).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: /Nonaktifkan/i }));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith("tour_packages");
    });
  });
});

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import OperatorDashboard from "./OperatorDashboard";
import { BoatModal } from "@/components/BoatModal";
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

const mockBoatsData = [
  {
    id: "boat-001",
    operator_id: "op-001",
    name: "KM Sri Rejeki 01",
    type: "kapal_kayu",
    capacity: 10,
    base_price: 350000,
    location: "Dermaga Pandanarang, Teluk Penyu",
    description: "Kapal kayu tradisional dengan atap kanopi",
    features: ["Pelampung SOLAS", "GPS"],
    available: true,
  },
  {
    id: "boat-002",
    operator_id: "op-001",
    name: "Speedboat Samudra 08",
    type: "speedboat",
    capacity: 6,
    base_price: 600000,
    location: "Dermaga Pandanarang, Teluk Penyu",
    description: "Speedboat cepat bermesin ganda",
    features: ["Pelampung SOLAS", "P3K Darurat"],
    available: false,
  },
];

const mockInsertFn = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({
      data: {
        id: "boat-new-003",
        operator_id: "op-001",
        name: "KM Bahari Sentosa",
        type: "kapal_kayu",
        capacity: 12,
        base_price: 400000,
        location: "Dermaga Pandanarang, Teluk Penyu",
        description: "Kapal baru siap berlayar",
        features: ["Pelampung SOLAS"],
        available: true,
      },
      error: null,
    }),
  }),
});

const mockUpdateBoatFn = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: {
          id: "boat-001",
          operator_id: "op-001",
          name: "KM Sri Rejeki 01 Rev",
          type: "kapal_kayu",
          capacity: 12,
          base_price: 380000,
          location: "Dermaga Pandanarang, Teluk Penyu",
          description: "Kapal kayu diperbarui",
          features: ["Pelampung SOLAS"],
          available: true,
        },
        error: null,
      }),
    }),
  }),
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
              data: [...mockBoatsData],
              error: null,
            }),
          }),
          insert: mockInsertFn,
          update: mockUpdateBoatFn,
        };
      }
      if (table === "bookings") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
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

import { supabase } from "@/integrations/supabase/client";

describe("OperatorDashboard & BoatModal - Task 4 Manajemen Armada Operator", () => {
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

  it("membuka modal 'Tambah Kapal' saat tombol Tambah Kapal diklik di tab Kapal Saya", async () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(OperatorDashboard)
      )
    );

    await waitFor(() => {
      const addBoatBtn = screen.getByRole("button", { name: /Tambah Kapal/i });
      expect(addBoatBtn).toBeDefined();
      fireEvent.click(addBoatBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Tambah Armada Kapal Baru/i)).toBeDefined();
      expect(screen.getByLabelText(/Nama Kapal/i)).toBeDefined();
      expect(screen.getByLabelText(/Kapasitas Penumpang/i)).toBeDefined();
      expect(screen.getByLabelText(/Tarif Dasar Sewa/i)).toBeDefined();
    });
  });

  it("dapat menambahkan kapal baru melalui BoatModal dan memicu insert ke Supabase", async () => {
    const onSaveSuccess = vi.fn();
    render(
      React.createElement(BoatModal, {
        open: true,
        onOpenChange: vi.fn(),
        operatorId: "op-001",
        boatToEdit: null,
        onSaveSuccess,
      })
    );

    const nameInput = screen.getByLabelText(/Nama Kapal/i);
    const capacityInput = screen.getByLabelText(/Kapasitas Penumpang/i);
    const priceInput = screen.getByLabelText(/Tarif Dasar Sewa/i);

    fireEvent.change(nameInput, { target: { value: "KM Bahari Sentosa" } });
    fireEvent.change(capacityInput, { target: { value: "12" } });
    fireEvent.change(priceInput, { target: { value: "400000" } });

    const submitBtn = screen.getByRole("button", { name: /Simpan Kapal/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockInsertFn).toHaveBeenCalledWith(
        expect.objectContaining({
          operator_id: "op-001",
          name: "KM Bahari Sentosa",
          capacity: 12,
          base_price: 400000,
        })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/berhasil ditambahkan/i));
      expect(onSaveSuccess).toHaveBeenCalled();
    });
  });

  it("dapat membuka modal 'Edit Kapal' dengan data yang terisi otomatis dan memicu update ke Supabase", async () => {
    const onSaveSuccess = vi.fn();
    render(
      React.createElement(BoatModal, {
        open: true,
        onOpenChange: vi.fn(),
        operatorId: "op-001",
        boatToEdit: mockBoatsData[0],
        onSaveSuccess,
      })
    );

    expect(screen.getByText(/Edit Spesifikasi Kapal/i)).toBeDefined();
    const nameInput = screen.getByLabelText(/Nama Kapal/i) as HTMLInputElement;
    expect(nameInput.value).toBe("KM Sri Rejeki 01");

    fireEvent.change(nameInput, { target: { value: "KM Sri Rejeki 01 Rev" } });

    const submitBtn = screen.getByRole("button", { name: /Simpan Perubahan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdateBoatFn).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "KM Sri Rejeki 01 Rev",
        })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/berhasil diperbarui/i));
      expect(onSaveSuccess).toHaveBeenCalled();
    });
  });

  it("dapat mengubah status kelaikan kapal (toggle ketersediaan) langsung dari dashboard", async () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(OperatorDashboard)
      )
    );

    await waitFor(() => {
      // Temukan tombol toggle kelaikan pada KM Sri Rejeki 01
      const toggleBtn = screen.getByRole("button", { name: /Set Docking|Ubah Kelaikan/i });
      expect(toggleBtn).toBeDefined();
      fireEvent.click(toggleBtn);
    });

    await waitFor(() => {
      expect(mockUpdateBoatFn).toHaveBeenCalledWith(
        expect.objectContaining({
          available: false,
        })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/status kelaikan/i));
    });
  });
});

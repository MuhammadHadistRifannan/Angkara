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

const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ error: null }),
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
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
                  ksop_certificate: "KSOP.CLP/2026/04-A",
                  verified: true,
                },
                error: null,
              }),
            }),
          }),
          update: mockUpdate,
        };
      }
      if (table === "boats" || table === "bookings" || table === "tour_packages") {
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

import { supabase } from "@/integrations/supabase/client";

describe("OperatorDashboard - Sidebar & Pengaturan Profil", () => {
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

  it("merender kartu profil operator di sidebar dengan nama usaha dan no sertifikat KSOP", async () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(OperatorDashboard)
      )
    );

    await waitFor(() => {
      expect(screen.getAllByText("Koperasi Nelayan Pandanarang").length).toBeGreaterThan(0);
      expect(screen.getByText("KSOP.CLP/2026/04-A")).toBeDefined();
    });
  });

  it("dapat membuka tab Profil & Legalitas dan memperbarui informasi usaha", async () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(OperatorDashboard)
      )
    );

    // Buka tab Profil & Legalitas
    await waitFor(() => {
      const profileTab = screen.getByRole("tab", { name: /Profil & Legalitas/i });
      fireEvent.mouseDown(profileTab, { button: 0 });
      fireEvent.click(profileTab);
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/Nama Usaha/i)).toBeDefined();
      expect(screen.getByLabelText(/Nomor Telepon/i)).toBeDefined();
    });

    const submitBtn = screen.getByRole("button", { name: /Simpan Perubahan Profil/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringMatching(/berhasil diperbarui/i)
      );
    });
  });
});

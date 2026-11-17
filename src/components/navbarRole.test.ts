// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";

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
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

import { supabase } from "@/integrations/supabase/client";

describe("Navbar role-based dashboard links", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("menampilkan tombol 'Dashboard' untuk akun wisatawan", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "tourist-123",
          email: "tourist@example.com",
          user_metadata: { role: "tourist" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as unknown as { data: { subscription: { unsubscribe: () => void } } });

    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      if (table === "operators") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
    }) as unknown as typeof supabase.from);

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Navbar)
      )
    );

    await waitFor(() => {
      const dashboardBtns = screen.getAllByRole("button", { name: /^Dashboard$/i });
      expect(dashboardBtns.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("menampilkan tombol 'Dashboard Operator' untuk akun operator kapal", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "operator-456",
          email: "operator@example.com",
          user_metadata: { role: "operator" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as unknown as { data: { subscription: { unsubscribe: () => void } } });

    vi.mocked(supabase.from).mockImplementation(((table: string) => {
      if (table === "operators") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "op-1", user_id: "operator-456", email: "operator@example.com" },
                error: null,
              }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
    }) as unknown as typeof supabase.from);

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Navbar)
      )
    );

    await waitFor(() => {
      const opBtns = screen.getAllByRole("button", { name: /Dashboard Operator/i });
      expect(opBtns.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("navbar selain landing page tetap memiliki background gelap solid (bukan transparan)", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
    } as unknown as { data: { user: null }; error: null });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as unknown as { data: { subscription: { unsubscribe: () => void } } });

    const { container } = render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/tour-packages"] },
        React.createElement(Navbar)
      )
    );

    const nav = container.querySelector("nav");
    expect(nav).toBeDefined();
    // Pada halaman selain landing page, navbar wajib gelap pekat dan bukan transparan /40
    expect(nav?.className).toContain("bg-[#090D16]");
    expect(nav?.className).not.toContain("bg-[#090D16]/40");
  });

  it("saat user logout (klik 'Keluar'), memanggil signOut dan mengarahkan kembali ke landing page '/'", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "user-logout-test",
          email: "user@example.com",
          user_metadata: { role: "tourist" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as unknown as { data: { subscription: { unsubscribe: () => void } } });

    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/dashboard"] },
        React.createElement(Navbar)
      )
    );

    await waitFor(() => {
      const logoutBtns = screen.getAllByRole("button", { name: /^Keluar$/i });
      expect(logoutBtns.length).toBeGreaterThanOrEqual(1);
      logoutBtns[0].click();
    });

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RouteDetail from "./RouteDetail";
import TourPackagesSection from "@/components/TourPackagesSection";

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
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/integrations/supabase/client", () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));

  return {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
      },
      from: mockFrom,
    },
  };
});

describe("Halaman Detail Rute & Auth Gate Booking - Task TDD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("tombol 'Detail Rute' pada landing page (TourPackagesSection) mengarahkan ke /route/:id", async () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(TourPackagesSection)
      )
    );

    const detailButtons = screen.getAllByRole("button", { name: /Detail Rute/i });
    expect(detailButtons.length).toBeGreaterThan(0);

    // Klik tombol Detail Rute pertama
    fireEvent.click(detailButtons[0]);

    // Harus diarahkan ke rute spesifik, bukan sekadar /tour-packages umum
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/^\/route\/pkg-/));
  });

  it("halaman RouteDetail merender detail rute lengkap dan tombol booking", async () => {
    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/route/pkg-segara-anakan"] },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: "/route/:id",
            element: React.createElement(RouteDetail),
          })
        )
      )
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /Jelajah Hutan Mangrove & Laguna Segara Anakan/i,
        })
      ).toBeDefined();
    });

    expect(screen.getAllByText(/Laguna Segara Anakan/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Pemandu Lokal/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Booking Sekarang/i })).toBeDefined();
  });

  it("klik 'Booking Sekarang' saat BELUM login memicu login AuthModal dan tidak langsung ke booking", async () => {
    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/route/pkg-segara-anakan"] },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: "/route/:id",
            element: React.createElement(RouteDetail),
          })
        )
      )
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Booking Sekarang/i })).toBeDefined();
    });

    const bookBtn = screen.getByRole("button", { name: /Booking Sekarang/i });
    fireEvent.click(bookBtn);

    // Pengunjung belum login -> AuthModal harus muncul, navigasi langsung dicegah
    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: /Masuk atau daftar SUAR/i })).toBeDefined();
    });
    expect(mockNavigate).not.toHaveBeenCalledWith(expect.stringContaining("/booking"));
  });

  it("klik 'Booking Sekarang' saat SUDAH login langsung mengarahkan ke halaman /booking?packageId=...", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          user: { id: "user-123", email: "wisatawan@angkara.id" },
        } as unknown as import("@supabase/supabase-js").Session,
      },
      error: null,
    });

    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/route/pkg-segara-anakan"] },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: "/route/:id",
            element: React.createElement(RouteDetail),
          })
        )
      )
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Booking Sekarang/i })).toBeDefined();
    });

    const bookBtn = screen.getByRole("button", { name: /Booking Sekarang/i });
    fireEvent.click(bookBtn);

    // Pengguna sudah login -> langsung diarahkan ke /booking dengan packageId
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringMatching(/\/booking\?packageId=/)
      );
    });
  });
});

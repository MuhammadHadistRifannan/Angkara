 // @vitest-environment jsdom
// BATCH-6 2026-11-23: kartu /tour-packages harus menampilkan foto + badge
// kategori yang sama dengan kartu landing dan halaman detail rute.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import TourPackages from "./TourPackages";
import { DEMO_PACKAGES } from "@/lib/demoFallback";

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

// Supabase gagal / tabel kosong -> halaman memakai 8 paket demo.
vi.mock("@/integrations/supabase/client", () => {
  const mockEq = vi.fn(() =>
    Promise.resolve({ data: null, error: new Error("db down") })
  );
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

describe("Halaman /tour-packages: foto + badge kategori kartu paket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderPage = async () => {
    render(
      React.createElement(MemoryRouter, null, React.createElement(TourPackages))
    );
    await waitFor(() =>
      expect(
        screen.getByText("Penyeberangan Teluk Penyu – Pantai Pasir Putih Permisan")
      ).toBeTruthy()
    );
  };

  it("menampilkan 8 foto paket, satu per kartu", async () => {
    await renderPage();
    for (const pkg of DEMO_PACKAGES) {
      const img = screen.getByAltText(pkg.name);
      expect(img.getAttribute("src") || "").not.toBe("");
    }
  });

  it("foto kartu pkg7 dan pkg8 sama dengan halaman detail rute", async () => {
    await renderPage();
    const img7 = screen.getByAltText("Mancing Malam & Sunrise Mercusuar Cimiring");
    const img8 = screen.getByAltText(
      "Jelajah Sehari – Permisan, Karang Bolong & Mercusuar Cimiring"
    );
    expect(img7.getAttribute("src") || "").toContain("tour-sunrise-boats");
    expect(img8.getAttribute("src") || "").toContain("tour-karang-bolong-south");
  });

  it("badge kartu memakai label kategori, bukan 'Paket Tour' generik", async () => {
    await renderPage();
    // "Paket Tour" masih ada sebagai link menu navbar (<a>); badge kartu
    // tidak boleh lagi memakai teks itu.
    const genericBadges = screen
      .getAllByText("Paket Tour")
      .filter((el) => el.tagName !== "A");
    expect(genericBadges).toHaveLength(0);
    expect(screen.getAllByText("Wisata Keluarga")).toHaveLength(4);
    expect(screen.getAllByText("Ekowisata Mangrove")).toHaveLength(2);
    expect(screen.getAllByText("Mancing & Mercusuar")).toHaveLength(2);
  });
});

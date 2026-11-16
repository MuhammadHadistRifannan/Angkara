// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";
import Features from "./Features";
import HowItWorks from "./HowItWorks";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn(),
    },
  },
}));

describe("Landing Page Components (Navbar, Features, HowItWorks)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("Navbar merender nama brand Angkara dan tombol aksi Masuk / Daftar", () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Navbar)
      )
    );

    expect(screen.getByText(/Angkara/i)).toBeDefined();
    expect(screen.getAllByRole("button", { name: /Masuk/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: /Daftar/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("Features merender judul seksi dan kartu fitur maritim", () => {
    render(React.createElement(Features));

    expect(screen.getByRole("heading", { name: /Fitur Unggulan/i })).toBeDefined();
    expect(screen.getByText(/Listing Terverifikasi/i)).toBeDefined();
    expect(screen.getByText(/Peringatan Cuaca/i)).toBeDefined();
  });

  it("HowItWorks merender alur 4 langkah booking terpadu", () => {
    render(React.createElement(HowItWorks));

    expect(screen.getByRole("heading", { name: /Cara Kerja/i })).toBeDefined();
    expect(screen.getByText("01")).toBeDefined();
    expect(screen.getByText("02")).toBeDefined();
    expect(screen.getByText("03")).toBeDefined();
    expect(screen.getByText("04")).toBeDefined();
    expect(screen.getByText(/Cari & Filter Kapal/i)).toBeDefined();
  });
});

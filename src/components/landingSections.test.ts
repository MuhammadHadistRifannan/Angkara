// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import WhyChooseSuar from "./WhyChooseSuar";
import IconicDestinations from "./IconicDestinations";
import TourPackagesSection from "./TourPackagesSection";
import ReadyFleetSection from "./ReadyFleetSection";
import AskBeforeSailingSection from "./AskBeforeSailingSection";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn(),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    })),
  },
}));

describe("Landing Page Components (SUAR Platform)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("Navbar merender logo SUAR dan tombol aksi Masuk / Daftar", () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Navbar)
      )
    );

    const logo = screen.getByAltText(/SUAR/i);
    expect(logo).toBeDefined();
    expect(screen.getAllByRole("button", { name: /Masuk/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: /Daftar/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("Features tidak lagi memuat Kalkulator Tarif dan memuat fitur maritim resmi", () => {
    render(React.createElement(Features));

    expect(screen.getByRole("heading", { name: /Fitur Unggulan/i })).toBeDefined();
    expect(screen.getByText(/Listing Terverifikasi/i)).toBeDefined();
    expect(screen.getByText(/Akses Pandanarang/i)).toBeDefined();
    expect(screen.queryByText(/Kalkulator Tarif/i)).toBeNull();
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

  it("WhyChooseSuar merender 3 alasan wisatawan memilih SUAR", () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(WhyChooseSuar)
      )
    );

    expect(
      screen.getByRole("heading", { name: /Mengapa Wisatawan Memilih Platform SUAR\?/i })
    ).toBeDefined();
    expect(screen.getByText(/Analisis AI & BMKG Terpadu/i)).toBeDefined();
    expect(screen.getByText(/Ekonomi Nelayan Berkelanjutan/i)).toBeDefined();
    expect(screen.getByText(/Standar Keamanan Bahari Ketat/i)).toBeDefined();
  });

  it("IconicDestinations merender 3 kartu destinasi Nusakambangan", () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(IconicDestinations)
      )
    );

    expect(screen.getAllByText(/Pantai Karang Bolong/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Mercusuar Cimiring/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Laguna Segara Anakan/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/PENYEBERANGAN 15 MENIT/i)).toBeDefined();
  });

  it("TourPackagesSection merender paket tour kurasi dengan tab filter", () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(TourPackagesSection)
      )
    );

    expect(screen.getByRole("heading", { name: /Pilihan Paket Tour/i })).toBeDefined();
    expect(screen.getByText(/Semua Paket/i)).toBeDefined();
    expect(screen.getByText(/Penyeberangan Teluk Penyu/i)).toBeDefined();
    expect(screen.getByText(/Jelajah Hutan Mangrove/i)).toBeDefined();
  });

  it("ReadyFleetSection merender armada kapal terverifikasi dan banner SAR 115", () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(ReadyFleetSection)
      )
    );

    expect(screen.getByRole("heading", { name: /Armada Siap Berlayar Hari Ini/i })).toBeDefined();
    expect(screen.getAllByText(/12 Kapal/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/KM Sri Rejeki 03/i)).toBeDefined();
    expect(screen.getByText(/Hotline 115/i)).toBeDefined();
  });

  it("AskBeforeSailingSection merender AI Navigator dan telemetri cuaca", () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(AskBeforeSailingSection)
      )
    );

    expect(
      screen.getByRole("heading", { name: /Tanya Apa Saja Sebelum Berlayar ke Laut Selatan/i })
    ).toBeDefined();
    expect(screen.getAllByText(/Juru Mudi AI/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/1,1 meter \(Tenang\)/i)).toBeDefined();
  });
});

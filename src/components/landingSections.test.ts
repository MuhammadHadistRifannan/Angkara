// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: "user-123" }, session: {} },
        error: null,
      }),
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

    it("ReadyFleetSection merender armada kapal terverifikasi", () => {
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
    expect(screen.getAllByRole("button", { name: /Chat Nelayan/i }).length).toBeGreaterThan(0);
  });

  it("ReadyFleetSection: tombol Chat Nelayan membuka AuthModal jika user belum login", async () => {
    const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(ReadyFleetSection)
      )
    );

    const chatButtons = screen.getAllByRole("button", { name: /Chat Nelayan/i });
    expect(chatButtons.length).toBeGreaterThan(0);

    fireEvent.click(chatButtons[0]);

    await vi.waitFor(() => {
      // Belum login -> window.open tidak boleh terpanggil
      expect(windowOpenSpy).not.toHaveBeenCalled();
      // Modal auth harus muncul (dialog 'Masuk atau daftar SUAR')
      expect(screen.getByLabelText(/Masuk atau daftar SUAR/i)).toBeDefined();
    });

    windowOpenSpy.mockRestore();
  });

  it("ReadyFleetSection: saat login berhasil via AuthModal, otomatis membuka WhatsApp dengan kapal yang dipilih", async () => {
    const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(ReadyFleetSection)
      )
    );

    const chatButtons = screen.getAllByRole("button", { name: /Chat Nelayan/i });
    fireEvent.click(chatButtons[0]);

    await vi.waitFor(() => {
      expect(screen.getByLabelText(/Masuk atau daftar SUAR/i)).toBeDefined();
    });

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    fireEvent.change(emailInput, { target: { value: "wisatawan@angkara.id" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const submitLoginBtns = screen.getAllByRole("button", { name: /^Masuk$/i });
    const submitLoginBtn = submitLoginBtns.find((b) => b.getAttribute("type") === "submit")!;
    fireEvent.click(submitLoginBtn);

    await vi.waitFor(() => {
      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain("https://wa.me/");
      expect(calledUrl).toContain("KM%20Sri%20Rejeki%2003");
      expect(windowOpenSpy.mock.calls[0][1]).toBe("_blank");
    });

    windowOpenSpy.mockRestore();
  });

  it("ReadyFleetSection: tombol Chat Nelayan langsung membuka WhatsApp dengan template jika user sudah login", async () => {
    const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const { supabase } = await import("@/integrations/supabase/client");
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: { user: { id: "user-123" } } as unknown as never },
      error: null,
    });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(ReadyFleetSection)
      )
    );

    const chatButtons = screen.getAllByRole("button", { name: /Chat Nelayan/i });
    fireEvent.click(chatButtons[0]);

    await vi.waitFor(() => {
      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      const calledUrl = windowOpenSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain("https://wa.me/");
      expect(calledUrl).toContain("KM%20Sri%20Rejeki%2003");
      expect(windowOpenSpy.mock.calls[0][1]).toBe("_blank");
    });

    windowOpenSpy.mockRestore();
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

// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { LiquidNav } from "./LiquidNav";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/" }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}));

describe("LiquidNav slot-relative highlight navigation", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders all navigation items correctly", () => {
    render(React.createElement(LiquidNav, { show: true, isReducedMotion: true, isInHero: true }));

    expect(screen.getByRole("button", { name: "Beranda" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Armada Kapal" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Paket Tour" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Cuaca & Peta" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Juru Mudi" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Panduan" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Masuk / Akun" })).toBeDefined();
  });

  it("updates highlight position to target index when hovering another item", () => {
    const { container } = render(
      React.createElement(LiquidNav, { show: true, isReducedMotion: true, isInHero: true })
    );

    const highlight = container.querySelector('[aria-hidden="true"]');
    expect(highlight).toBeDefined();

    // Hover Armada Kapal (Index 1)
    const armadaBtn = screen.getByRole("button", { name: "Armada Kapal" });
    fireEvent.mouseEnter(armadaBtn);

    // After hover, Armada Kapal button has bold text
    expect(armadaBtn.className).toContain("text-slate-950");

    // Hover Cuaca & Peta (Index 2)
    const cuacaBtn = screen.getByRole("button", { name: "Cuaca & Peta" });
    fireEvent.mouseEnter(cuacaBtn);
    expect(cuacaBtn.className).toContain("text-slate-950");
  });

  it("resets highlight to active item when mouse leaves navbar", () => {
    render(
      React.createElement(LiquidNav, { show: true, isReducedMotion: true, isInHero: true })
    );

    const berandaBtn = screen.getByRole("button", { name: "Beranda" });
    const armadaBtn = screen.getByRole("button", { name: "Armada Kapal" });

    // Initial state: Beranda is active
    expect(berandaBtn.className).toContain("text-slate-950");

    // Hover Armada
    fireEvent.mouseEnter(armadaBtn);
    expect(armadaBtn.className).toContain("text-slate-950");

    // Mouse leave navbar
    const navOuter = berandaBtn.closest(".rounded-full");
    if (navOuter) {
      fireEvent.mouseLeave(navOuter);
    }

    // Returns to Beranda
    expect(berandaBtn.className).toContain("text-slate-950");
  });

  it("mempertahankan highlight pada menu yang diklik saat mouse meninggalkan navbar alih-alih reset ke Beranda", () => {
    render(
      React.createElement(LiquidNav, { show: true, isReducedMotion: true, isInHero: true })
    );

    const berandaBtn = screen.getByRole("button", { name: "Beranda" });
    const cuacaBtn = screen.getByRole("button", { name: "Cuaca & Peta" });

    // Klik Cuaca & Peta
    fireEvent.click(cuacaBtn);

    // Kursor mouse keluar dari navbar
    const navOuter = berandaBtn.closest(".rounded-full");
    if (navOuter) {
      fireEvent.mouseLeave(navOuter);
    }

    // Cuaca & Peta tetap ter-highlight, tidak kembali ke Beranda
    expect(cuacaBtn.className).toContain("text-slate-950");
    expect(berandaBtn.className).not.toContain("text-slate-950");
  });
});

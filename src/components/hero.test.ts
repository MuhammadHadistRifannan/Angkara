// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Hero from "./Hero";

describe("Hero Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("merender judul utama bahari dan elemen visual modern", () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Hero)
      )
    );

    expect(screen.getByText(/Jelajahi Pesisir Cilacap/i)).toBeDefined();
    expect(screen.getAllByText(/Nusakambangan/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Terverifikasi KSOP/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /Cari Kapal/i })).toBeDefined();
  });

  it("mempertahankan integrasi peta cuaca maritim dengan tombol navigasi ke peta", () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Hero)
      )
    );

    // Memastikan terdapat link / tombol menuju peta cuaca maritim
    const weatherButtons = screen.getAllByRole("link", { name: /Cuaca Maritim/i });
    expect(weatherButtons.length).toBeGreaterThanOrEqual(1);
    expect(weatherButtons[0].getAttribute("href")).toContain("weather-map");
  });

  it("tombol 'Tanya Juru Mudi' memicu custom event open-assistant", () => {
    let triggered = false;
    const listener = () => {
      triggered = true;
    };
    window.addEventListener("open-assistant", listener);

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Hero)
      )
    );

    const askBtn = screen.getByRole("button", { name: /Tanya Juru Mudi/i });
    expect(askBtn).toBeDefined();
    fireEvent.click(askBtn);

    expect(triggered).toBe(true);
    window.removeEventListener("open-assistant", listener);
  });

  it("memiliki kontainer latar belakang paralaks dengan offset transformasi", () => {
    const { container } = render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Hero)
      )
    );

    const parallaxBg = container.querySelector("[data-testid='parallax-bg']");
    expect(parallaxBg).not.toBeNull();
  });

  it("merender kartu kanan dengan no lambung kapal dan kutipan kearifan bahari lokal", () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Hero)
      )
    );

    expect(screen.getByText(/NO\. LAMBUNG: TPY-048/i)).toBeDefined();
    expect(screen.getByText(/Kearifan Bahari Lokal/i)).toBeDefined();
    expect(screen.getByText(/Kantor Kesyahbandaran Cilacap/i)).toBeDefined();
  });
});

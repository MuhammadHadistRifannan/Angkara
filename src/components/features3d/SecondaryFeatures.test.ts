// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { SecondaryFeatures } from "./SecondaryFeatures";
import { SECONDARY_FEATURES } from "./data";

describe("SecondaryFeatures 4-Card Section (Dan Masih Banyak Lagi)", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders section title and clean subtext without coordinate pill", () => {
    render(React.createElement(SecondaryFeatures, { features: SECONDARY_FEATURES }));

    // Section title
    expect(screen.getByText("Dan Masih Banyak Lagi")).toBeDefined();
    // Subtext ringkas
    expect(
      screen.getByText("Semua yang dibutuhkan sebelum dan sesudah berlayar.")
    ).toBeDefined();

    // Pastikan kapsul koordinat lama sudah dihapus
    expect(screen.queryByText(/7°44'S 109°00'E/i)).toBeNull();
    expect(screen.queryByText("Ekosistem Maritim Lengkap")).toBeNull();
  });

  it("renders all 4 feature cards with exact labels, titles, and descriptions", () => {
    render(React.createElement(SecondaryFeatures, { features: SECONDARY_FEATURES }));

    // 1. Asuransi
    expect(screen.getByText("Asuransi")).toBeDefined();
    expect(screen.getByText("E-Tiket & Asuransi")).toBeDefined();
    expect(
      screen.getByText("Tiket QR digital, sudah termasuk asuransi kecelakaan laut.")
    ).toBeDefined();

    // 2. Cuaca
    expect(screen.getByText("Cuaca")).toBeDefined();
    expect(screen.getByText("Peringatan Cuaca BMKG")).toBeDefined();
    expect(
      screen.getByText(
        "Cuaca laut real-time, dijelaskan sederhana: aman, waspada, atau tunda."
      )
    ).toBeDefined();

    // 3. Ulasan
    expect(screen.getByText("Ulasan")).toBeDefined();
    expect(screen.getByText("Ulasan Terverifikasi")).toBeDefined();
    expect(
      screen.getByText("Hanya dari penumpang yang benar-benar sudah berlayar.")
    ).toBeDefined();

    // 4. Asisten AI
    expect(screen.getByText("Asisten AI")).toBeDefined();
    expect(screen.getByText("Juru Mudi, Asisten AI")).toBeDefined();
    expect(
      screen.getByText(
        "Tanya waktu berlayar terbaik dan kapal yang cocok, kapan saja."
      )
    ).toBeDefined();
  });

  it("does not render old number badges 01-04 or footer rows", () => {
    render(React.createElement(SecondaryFeatures, { features: SECONDARY_FEATURES }));

    // Nomor kecil "01-04" di footer sudah dihapus
    expect(screen.queryByText("01")).toBeNull();
    expect(screen.queryByText("02")).toBeNull();
    expect(screen.queryByText("03")).toBeNull();
    expect(screen.queryByText("04")).toBeNull();
  });
});

// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { SecondaryFeatures } from "./SecondaryFeatures";
import { SECONDARY_FEATURES } from "./data";

describe("SecondaryFeatures sliding card carousel", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders section header and slider controls", () => {
    render(React.createElement(SecondaryFeatures, { features: SECONDARY_FEATURES }));

    expect(screen.getByText("Dan Masih Banyak Lagi")).toBeDefined();

    // Check navigation controls
    const prevBtn = screen.getByRole("button", { name: /kartu sebelumnya/i });
    const nextBtn = screen.getByRole("button", { name: /kartu berikutnya/i });
    expect(prevBtn).toBeDefined();
    expect(nextBtn).toBeDefined();

    // Initial state: index 0
    expect(prevBtn.hasAttribute("disabled")).toBe(true);
    expect(nextBtn.hasAttribute("disabled")).toBe(false);
    expect(screen.getAllByText("01").length).toBeGreaterThan(0);
    expect(screen.getByTestId("active-step-counter").textContent).toContain("01");
  });

  it("advances active card when next button is clicked and enables prev button", () => {
    render(React.createElement(SecondaryFeatures, { features: SECONDARY_FEATURES }));

    const prevBtn = screen.getByRole("button", { name: /kartu sebelumnya/i });
    const nextBtn = screen.getByRole("button", { name: /kartu berikutnya/i });

    expect(prevBtn.hasAttribute("disabled")).toBe(true);

    // Click next -> advances to card 2 (Peringatan Cuaca BMKG)
    fireEvent.click(nextBtn);

    expect(prevBtn.hasAttribute("disabled")).toBe(false);
    expect(screen.getByTestId("active-step-counter").textContent).toContain("02");

    // Click next again -> card 3
    fireEvent.click(nextBtn);
    expect(screen.getByTestId("active-step-counter").textContent).toContain("03");

    // Click next again -> card 4
    fireEvent.click(nextBtn);
    expect(screen.getByTestId("active-step-counter").textContent).toContain("04");
    expect(nextBtn.hasAttribute("disabled")).toBe(true);

    // Click prev -> back to card 3
    fireEvent.click(prevBtn);
    expect(screen.getByTestId("active-step-counter").textContent).toContain("03");
  });

  it("switches active card directly when clicking step tabs", () => {
    render(React.createElement(SecondaryFeatures, { features: SECONDARY_FEATURES }));

    const tab03 = screen.getByRole("tab", { name: /pilih kartu 03/i });
    fireEvent.click(tab03);

    expect(screen.getByTestId("active-step-counter").textContent).toContain("03");
  });

  it("renders all 4 feature cards with their numbers and titles", () => {
    render(React.createElement(SecondaryFeatures, { features: SECONDARY_FEATURES }));

    expect(screen.getAllByText("E-Tiket & Asuransi Resmi").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Peringatan Cuaca BMKG").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rating Terverifikasi").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Asisten AI Juru Mudi").length).toBeGreaterThan(0);
  });
});

// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { CheckoutProgressBar } from "./CheckoutProgressBar";
import { DEFAULT_CHECKOUT_STEPS } from "./checkoutTypes";

describe("CheckoutProgressBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("merender semua langkah checkout dengan nomor dan label", () => {
    render(<CheckoutProgressBar currentStep={2} />);

    DEFAULT_CHECKOUT_STEPS.forEach((step) => {
      expect(screen.getByText(step.label)).toBeDefined();
    });
  });

  it("menampilkan ikon centang pada langkah yang sudah selesai (step < currentStep)", () => {
    const { container } = render(<CheckoutProgressBar currentStep={3} />);

    // Langkah 1 dan 2 harus memiliki indikator selesai (centang SVG / check icon)
    const checkIcons = container.querySelectorAll("[data-testid='step-completed-icon']");
    expect(checkIcons.length).toBe(2);
  });

  it("menandai langkah aktif dengan atribut aria-current='step'", () => {
    render(<CheckoutProgressBar currentStep={2} />);

    const activeStep = screen.getByTestId("step-circle-2");
    expect(activeStep.getAttribute("aria-current")).toBe("step");
  });

  it("memanggil onStepClick ketika langkah sebelumnya diklik", () => {
    const handleStepClick = vi.fn();
    render(<CheckoutProgressBar currentStep={3} onStepClick={handleStepClick} />);

    const step1Button = screen.getByTestId("step-button-1");
    fireEvent.click(step1Button);

    expect(handleStepClick).toHaveBeenCalledWith(1);
  });

  it("tidak memanggil onStepClick untuk langkah berikutnya yang belum dicapai", () => {
    const handleStepClick = vi.fn();
    render(<CheckoutProgressBar currentStep={2} onStepClick={handleStepClick} />);

    const step3Button = screen.getByTestId("step-button-3");
    fireEvent.click(step3Button);

    expect(handleStepClick).not.toHaveBeenCalled();
  });
});

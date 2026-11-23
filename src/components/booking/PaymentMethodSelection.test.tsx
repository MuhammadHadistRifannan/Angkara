// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { PaymentMethodSelection } from "./PaymentMethodSelection";
import { PAYMENT_METHOD_OPTIONS } from "./checkoutTypes";

describe("PaymentMethodSelection (src/components/booking/PaymentMethodSelection.tsx)", () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    totalPrice: 200000,
    scheme: "dp_30" as const,
    onSchemeChange: vi.fn(),
    selectedMethod: "midtrans_qris" as const,
    onSelectMethod: vi.fn(),
  };

  it("merender opsi skema pembayaran DP 30% dan Lunas 100% dengan nominal tepat", () => {
    render(<PaymentMethodSelection {...defaultProps} />);

    // Total 200.000 -> DP 30% = 60.000, Lunas = 200.000
    expect(screen.getByText(/Bayar DP 30%/i)).toBeDefined();
    expect(screen.getAllByText(/Rp 60.000/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Bayar Lunas 100%/i)).toBeDefined();
    expect(screen.getAllByText(/Rp 200.000/i).length).toBeGreaterThanOrEqual(1);
  });

  it("memanggil onSchemeChange saat pengguna memilih skema pembayaran lain", () => {
    const handleSchemeChange = vi.fn();
    render(
      <PaymentMethodSelection
        {...defaultProps}
        onSchemeChange={handleSchemeChange}
      />
    );

    const fullSchemeBtn = screen.getByTestId("scheme-option-full_100");
    fireEvent.click(fullSchemeBtn);

    expect(handleSchemeChange).toHaveBeenCalledWith("full_100");
  });

  it("merender semua metode pembayaran yang tersedia (QRIS, VA Bank, Kartu Kredit, Tunai Dermaga)", () => {
    render(<PaymentMethodSelection {...defaultProps} />);

    PAYMENT_METHOD_OPTIONS.forEach((method) => {
      expect(screen.getByText(method.name)).toBeDefined();
    });
  });

  it("memanggil onSelectMethod saat pengguna memilih salah satu metode pembayaran", () => {
    const handleSelectMethod = vi.fn();
    render(
      <PaymentMethodSelection
        {...defaultProps}
        onSelectMethod={handleSelectMethod}
      />
    );

    const vaOption = screen.getByTestId("payment-method-midtrans_va");
    fireEvent.click(vaOption);

    expect(handleSelectMethod).toHaveBeenCalledWith("midtrans_va");
  });

  it("menampilkan badge keamanan pembayaran resmi Midtrans", () => {
    render(<PaymentMethodSelection {...defaultProps} />);

    expect(screen.getAllByText(/Midtrans/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/256-bit SSL/i)).toBeDefined();
  });
});

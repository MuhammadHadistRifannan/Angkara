// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ETicketModal, type ETicketData } from "./ETicketModal";

describe("ETicketModal Component", () => {
  const sampleBooking: ETicketData = {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    booking_date: "2026-11-25",
    departure_time: "09:00:00",
    passengers: 4,
    total_price: 220000,
    booking_status: "confirmed",
    payment_status: "fully_paid",
    notes: "Rombongan wisata keluarga",
    boats: {
      name: "Speedboat Camar Laut",
      type: "speedboat",
      image_url: null,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("merender informasi tiket dengan kode booking dan status terverifikasi KSOP", () => {
    render(
      <ETicketModal
        open={true}
        onOpenChange={vi.fn()}
        booking={sampleBooking}
      />
    );

    expect(screen.getByText("E-Tiket Penyeberangan Wisata")).toBeDefined();
    expect(screen.getByText("TERVERIFIKASI KSOP")).toBeDefined();
    expect(screen.getByText("SUAR-A1B2C3D4")).toBeDefined();
    expect(screen.getByText("Speedboat Camar Laut")).toBeDefined();
    expect(screen.getByText(/4 Jaket Pelampung SOLAS/i)).toBeDefined();
  });

  it("tidak menggunakan scrollbar (tanpa overflow-y-auto) dengan tata letak kompak agar pas di layar", () => {
    render(
      <ETicketModal
        open={true}
        onOpenChange={vi.fn()}
        booking={sampleBooking}
      />
    );

    // Dialog content harus kompak (max-w-lg) dan tidak memiliki scroll vertikal internal
    const dialogContent = document.querySelector('[role="dialog"]');
    expect(dialogContent).toBeDefined();
    expect(dialogContent?.className).toMatch(/max-w-lg/);

    // Memastikan tidak ada kelas overflow-y-auto (tidak dibuat scroll)
    const scrollContainer = document.querySelector(".overflow-y-auto");
    expect(scrollContainer).toBeNull();
  });

  it("memiliki kelas print:bg-white pada header agar tidak hitam pekat saat dicetak, dan tombol cetak disembunyikan (print:hidden)", async () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});

    render(
      <ETicketModal
        open={true}
        onOpenChange={vi.fn()}
        booking={sampleBooking}
      />
    );

    // Header harus memiliki kelas print:!bg-white dan print:!text-slate-900 agar hasil cetak bersih
    const header = document.querySelector(".eticket-header");
    expect(header).not.toBeNull();
    expect(header?.className).toMatch(/print:!?bg-white/);
    expect(header?.className).toMatch(/print:!?text-slate-900/);

    const printBtn = screen.getByRole("button", { name: /Cetak \/ Simpan PDF/i });
    expect(printBtn).toBeDefined();
    expect(printBtn.className).toMatch(/print:hidden/);

    fireEvent.click(printBtn);
    await new Promise((r) => setTimeout(r, 100));
    expect(printSpy).toHaveBeenCalledTimes(1);

    printSpy.mockRestore();
  });
});

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Auth from "./Auth";
import * as authLib from "@/lib/auth";
import { toast } from "sonner";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("Auth Page - Google Sign-In", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("menampilkan tombol 'Masuk dengan Google' di tab Masuk", () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Auth)
      )
    );

    const googleBtn = screen.getByRole("button", { name: /Masuk dengan Google/i });
    expect(googleBtn).toBeDefined();
    expect(googleBtn.getAttribute("type")).toBe("button");
  });

  it("menampilkan tombol 'Daftar dengan Google' di tab Daftar", async () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Auth)
      )
    );

    const signupTab = screen.getByRole("tab", { name: /Daftar/i });
    signupTab.focus();
    fireEvent.keyDown(signupTab, { key: "Enter", code: "Enter" });
    fireEvent.click(signupTab);

    // Verifikasi bahwa konten tab Daftar (termasuk tombol 'Daftar dengan Google') dirender di DOM
    await waitFor(() => {
      const allButtons = screen.getAllByRole("button");
      const hasDaftarGoogle = allButtons.some((b) =>
        b.textContent?.includes("Daftar dengan Google")
      );
      expect(hasDaftarGoogle).toBe(true);
    });
  });

  it("klik 'Masuk dengan Google' memanggil signInWithGoogle dan menangani galat via toast.error", async () => {
    const signInSpy = vi.spyOn(authLib, "signInWithGoogle").mockResolvedValue({
      error: new Error("Gagal login dengan akun Google"),
    });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Auth)
      )
    );

    const googleBtn = screen.getByRole("button", { name: /Masuk dengan Google/i });
    fireEvent.click(googleBtn);

    expect(signInSpy).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Gagal login dengan akun Google");
    });
  });
});

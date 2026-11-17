// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Auth from "./Auth";
import * as authLib from "@/lib/auth";
import { toast } from "sonner";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { supabase } from "@/integrations/supabase/client";

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

  it("mengarahkan user dengan sesi aktif operator ke /operator-dashboard", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: "op-active-user",
            email: "operator@angkara.id",
            user_metadata: { role: "operator" },
          },
        },
      },
    } as unknown as { data: { session: null }; error: null });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Auth)
      )
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/operator-dashboard", { replace: true });
    });
  });

  it("mengarahkan user dengan sesi aktif wisatawan ke /dashboard", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: "tourist-active-user",
            email: "wisatawan@angkara.id",
            user_metadata: { role: "tourist" },
          },
        },
      },
    } as unknown as { data: { session: null }; error: null });

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Auth)
      )
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    });
  });
});

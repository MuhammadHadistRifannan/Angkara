// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import Index from "./Index";
import { AskBeforeSailingSection } from "@/components/AskBeforeSailingSection";

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
      getUser: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    })),
  },
}));

import { supabase } from "@/integrations/supabase/client";

describe("Relokasi Chatbot dari Landing Page ke Dashboard User", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("Landing Page (Index) tidak lagi merender tombol floating Juru Mudi di pojok kanan bawah", () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
    } as unknown as { data: { user: null }; error: null });

    const { container } = render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Index)
      )
    );

    // Tombol chat floating di pojok kanan bawah sudah dihilangkan
    const assistantBtn = container.querySelector("button[aria-label*='Buka Chat Juru Mudi']");
    expect(assistantBtn).toBeNull();
  });

  it("tombol floating Juru Mudi bila diaktifkan (hideFloatingTrigger=false) memicu AuthModal ketika diklik pengunjung belum login", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
    } as unknown as { data: { user: null }; error: null });

    const { AssistantWidget } = await import("@/components/assistant/AssistantWidget");
    const { container } = render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(AssistantWidget, { hideFloatingTrigger: false, redirectToDashboard: true })
      )
    );

    const assistantBtn = container.querySelector("button[aria-label*='Buka Chat Juru Mudi']");
    expect(assistantBtn).not.toBeNull();
    fireEvent.click(assistantBtn!);

    await waitFor(() => {
      // AuthModal muncul menampilkan prompt masuk untuk bertanya ke Juru Mudi AI
      expect(screen.getByText(/Masuk dulu untuk bertanya ke Juru Mudi AI/i)).toBeDefined();
    });
  });

  it("Dashboard User tidak lagi merender tombol floating Juru Mudi di pojok kanan bawah", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "tourist-001",
          email: "tourist@angkara.id",
          user_metadata: { role: "tourist" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    const { container } = render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Dashboard)
      )
    );

    await waitFor(() => {
      // Pastikan tombol floating Juru Mudi di pojok kanan bawah tidak muncul
      const assistantBtn = container.querySelector("button[aria-label*='Buka Chat Juru Mudi']");
      expect(assistantBtn).toBeNull();
    });
  });

  it("AskBeforeSailingSection menonaktifkan tombol submit chat asisten di landing page", () => {
    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(AskBeforeSailingSection)
      )
    );

    const submitBtn = screen.getByRole("button", { name: /Kirim Pertanyaan/i });
    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it("tombol floating Juru Mudi bila diaktifkan bernavigasi ke /dashboard?tab=ai-chat ketika diklik user yang sudah login", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "user-123",
          email: "user@example.com",
        },
      },
    } as unknown as { data: { user: unknown }; error: null });

    const { AssistantWidget } = await import("@/components/assistant/AssistantWidget");
    const { container } = render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(AssistantWidget, { hideFloatingTrigger: false, redirectToDashboard: true })
      )
    );

    const assistantBtn = container.querySelector("button[aria-label*='Buka Chat Juru Mudi']");
    expect(assistantBtn).not.toBeNull();
    fireEvent.click(assistantBtn!);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard?tab=ai-chat");
    });
  });

  it("AskBeforeSailingSection tidak melakukan submit atau navigasi ketika tombol dinonaktifkan", () => {
    sessionStorage.clear();

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(AskBeforeSailingSection)
      )
    );

    const submitBtn = screen.getByRole("button", { name: /Kirim Pertanyaan/i });
    fireEvent.click(submitBtn);

    expect(sessionStorage.getItem("pending_assistant_prompt")).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("tidak pernah merender popup/floating modal Card chatbot di Dashboard atau AssistantWidget", async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: {
        user: {
          id: "tourist-001",
          email: "tourist@angkara.id",
          user_metadata: { role: "tourist" },
        },
      },
    } as unknown as { data: { user: null }; error: null });

    const { container } = render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Dashboard)
      )
    );

    await waitFor(() => {
      // Pastikan tidak ada card popup chat mengambang
      const popupCloseBtn = container.querySelector("button[aria-label*='Tutup Chat Juru Mudi AI']");
      expect(popupCloseBtn).toBeNull();
      const popupCard = container.querySelector(".fixed.bottom-4.right-4");
      expect(popupCard).toBeNull();
    });
  });
});

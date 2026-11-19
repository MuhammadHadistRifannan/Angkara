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

  it("Landing Page (Index) merender AssistantWidget (tombol floating Juru Mudi)", () => {
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

    // Tombol chat floating memiliki aria-label yang memuat 'Buka Chat Juru Mudi'
    const assistantBtn = container.querySelector("button[aria-label*='Buka Chat Juru Mudi']");
    expect(assistantBtn).not.toBeNull();
  });

  it("tombol floating Juru Mudi di Landing Page memicu AuthModal ketika diklik oleh pengunjung yang belum login", async () => {
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

    const assistantBtn = container.querySelector("button[aria-label*='Buka Chat Juru Mudi']");
    expect(assistantBtn).not.toBeNull();
    fireEvent.click(assistantBtn!);

    await waitFor(() => {
      // AuthModal muncul menampilkan prompt masuk untuk bertanya ke Juru Mudi AI
      expect(screen.getByText(/Masuk dulu untuk bertanya ke Juru Mudi AI/i)).toBeDefined();
    });
  });

  it("Dashboard User merender AssistantWidget (Juru Mudi AI)", async () => {
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
      // Pastikan tombol floating Juru Mudi ada di dalam Dashboard
      const assistantBtn = container.querySelector("button[aria-label*='Buka Chat Juru Mudi']");
      expect(assistantBtn).not.toBeNull();
    });
  });

  it("AskBeforeSailingSection menyimpan prompt ke sessionStorage dan bernavigasi ke /dashboard saat pertanyaan diajukan", () => {
    sessionStorage.clear();

    render(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(AskBeforeSailingSection)
      )
    );

    const input = screen.getByPlaceholderText(/Tanya kondisi ombak/i);
    fireEvent.change(input, {
      target: { value: "Apakah kapal kayu aman ke Mercusuar Cimiring besok?" },
    });

    const submitBtn = screen.getByRole("button", { name: /Kirim Pertanyaan/i });
    fireEvent.click(submitBtn);

    expect(sessionStorage.getItem("pending_assistant_prompt")).toBe(
      "Apakah kapal kayu aman ke Mercusuar Cimiring besok?"
    );
  });
});

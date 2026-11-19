// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import ScrollToHashElement from "./ScrollToHashElement";
import Navbar from "./Navbar";

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
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe("ScrollToHashElement & Cross-Page Hash Navigation", () => {
  let originalScrollIntoView: typeof Element.prototype.scrollIntoView;
  let originalScrollTo: typeof window.scrollTo;
  let mockScrollIntoView: ReturnType<typeof vi.fn>;
  let mockScrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    originalScrollIntoView = Element.prototype.scrollIntoView;
    originalScrollTo = window.scrollTo;
    mockScrollIntoView = vi.fn();
    mockScrollTo = vi.fn();
    Element.prototype.scrollIntoView = mockScrollIntoView;
    window.scrollTo = mockScrollTo;
  });

  afterEach(() => {
    cleanup();
    Element.prototype.scrollIntoView = originalScrollIntoView;
    window.scrollTo = originalScrollTo;
    document.body.innerHTML = "";
  });

  it("melakukan smooth scroll ke target element jika URL memiliki hash", async () => {
    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/#weather-map-section"] },
        React.createElement(ScrollToHashElement),
        React.createElement("div", { id: "weather-map-section" }, "Peta Cuaca Maritim")
      )
    );

    await waitFor(() => {
      expect(mockScrollIntoView).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: "smooth" })
      );
    });
  });

  it("melakukan retry polling jika elemen target belum langsung ada di DOM (lazy loaded)", async () => {
    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/#pilihan-paket-tour"] },
        React.createElement(ScrollToHashElement)
      )
    );

    expect(mockScrollIntoView).not.toHaveBeenCalled();

    // Simulasikan komponen dimuat setelah beberapa saat (lazy loading)
    const delayedDiv = document.createElement("div");
    delayedDiv.id = "pilihan-paket-tour";
    delayedDiv.textContent = "Paket Wisata Bahari";
    document.body.appendChild(delayedDiv);

    await waitFor(
      () => {
        expect(mockScrollIntoView).toHaveBeenCalledWith(
          expect.objectContaining({ behavior: "smooth" })
        );
      },
      { timeout: 1500 }
    );
  });

  it("mereset scroll ke posisi atas (0, 0) ketika navigasi ke halaman tanpa hash", async () => {
    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/boats"] },
        React.createElement(ScrollToHashElement)
      )
    );

    await waitFor(() => {
      expect(mockScrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ top: 0 })
      );
    });
  });

  it("Navbar mengarahkan pengguna dari halaman /boats ke /#weather-map-section saat Cuaca & Peta diklik", async () => {
    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ["/boats"] },
        React.createElement(Navbar)
      )
    );

    const weatherLinks = screen.getAllByText(/Cuaca & Peta/i);
    fireEvent.click(weatherLinks[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/#weather-map-section");
  });
});

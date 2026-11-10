// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import React from "react";
import { WeatherMapPanel } from "./WeatherMapPanel";
import { supabase } from "@/integrations/supabase/client";

// Mock @/integrations/supabase/client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock react-leaflet
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "map-container" }, children),
  TileLayer: () => React.createElement("div", { "data-testid": "tile-layer" }),
  Marker: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "marker" }, children),
  Popup: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "popup" }, children),
}));

describe("WeatherMapPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("data unavailable → status keselamatan tidak pernah 'Aman' dan alert peringatan ditampilkan", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        source: "unavailable",
        fetched_at: "2026-11-10T08:00:00+07:00",
        stale: false,
        series: [
          {
            pointId: "teluk-penyu",
            samples: [],
            verdicts: [{ date: "2026-11-10", level: "aman", reasons: [] }], // Dikirim 'aman', tapi harus dipaksa jadi 'waspada'
          },
        ],
        attribution: ["BMKG"],
      },
      error: null,
    });

    render(React.createElement(WeatherMapPanel));

    // Harus menampilkan alert bahwa data tidak tersedia setelah selesai fetch
    await waitFor(() => {
      expect(screen.getByText(/Sumber Data Cuaca Tidak Tersedia/i)).toBeDefined();
    });

    // Status TIDAK BOLEH menampilkan "Aman untuk Berlayar", harus dipaksa menjadi "Perlu Kewaspadaan"
    expect(screen.queryByText(/Aman untuk Berlayar/i)).toBeNull();
    expect(screen.getByText(/Perlu Kewaspadaan/i)).toBeDefined();
  });

  it("data stale → menampilkan banner peringatan data cuaca tertunda", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        source: "official",
        fetched_at: "2026-11-10T08:00:00+07:00",
        stale: true,
        series: [
          {
            pointId: "teluk-penyu",
            samples: [],
            verdicts: [{ date: "2026-11-10", level: "waspada", reasons: ["Gelombang tinggi"] }],
          },
        ],
        attribution: ["BMKG"],
      },
      error: null,
    });

    render(React.createElement(WeatherMapPanel));

    await waitFor(() => {
      expect(screen.getByText(/Pemberitahuan Data Cuaca Tertunda/i)).toBeDefined();
    });
  });

  it("tombol 'Tanya Juru Mudi' memicu event open-assistant dengan prompt konteks titik", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: {
        source: "official",
        fetched_at: "2026-11-10T08:00:00+07:00",
        stale: false,
        series: [
          {
            pointId: "teluk-penyu",
            samples: [],
            verdicts: [{ date: "2026-11-10", level: "aman", reasons: [] }],
          },
        ],
        attribution: ["BMKG"],
      },
      error: null,
    });

    let receivedPrompt = "";
    const listener = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      receivedPrompt = customEvent.detail?.prompt || "";
    };
    window.addEventListener("open-assistant", listener);

    render(React.createElement(WeatherMapPanel));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Tanya Juru Mudi/i })).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: /Tanya Juru Mudi/i }));

    expect(receivedPrompt).toContain("Teluk Penyu");
    window.removeEventListener("open-assistant", listener);
  });
});

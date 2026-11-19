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
  Circle: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "circle" }, children),
  Polyline: ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "polyline" }, children),
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

  it("data unavailable → status keselamatan tidak pernah 'Aman' dan peringatan ditampilkan", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    render(React.createElement(WeatherMapPanel));

    await waitFor(() => {
      expect(screen.getByText(/Data cuaca tidak tersedia saat ini/i)).toBeDefined();
    });

    // Status TIDAK BOLEH menampilkan "Aman Berlayar", harus waspada
    expect(screen.queryByText(/Aman Berlayar/i)).toBeNull();
    expect(screen.getAllByText(/Waspada/i).length).toBeGreaterThanOrEqual(1);
  });

  it("data gelombang live → merender tinggi gelombang dan kategori keselamatan", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url: unknown) => {
      if (String(url).includes("marine")) {
        return {
          ok: true,
          json: async () => ({
            current: { wave_height: 0.8 },
            hourly: { wave_height: [0.8, 0.9, 0.7] },
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          current: { wind_speed_10m: 12 },
        }),
      } as Response;
    });

    render(React.createElement(WeatherMapPanel));

    await waitFor(() => {
      expect(screen.getAllByText(/0.80/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/KATEGORI: SEDANG/i)).toBeDefined();
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

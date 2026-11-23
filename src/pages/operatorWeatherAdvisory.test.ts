// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import OperatorDashboard from "./OperatorDashboard";
import { supabase } from "@/integrations/supabase/client";
import {
  evaluateSailingSafety,
  OperatorWeatherAdvisory,
} from "@/components/weather/OperatorWeatherAdvisory";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    }),
    removeChannel: vi.fn(),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: "operator-user-001",
            email: "operator@angkara.id",
            user_metadata: { role: "operator" },
          },
        },
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signOut: vi.fn(),
    },
    from: vi.fn((table: string) => {
      if (table === "operators") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: "op-001",
                  user_id: "operator-user-001",
                  company_name: "Koperasi Nelayan Pandanarang",
                  phone: "08123456789",
                  email: "operator@angkara.id",
                  verified: true,
                },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "boats") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                {
                  id: "boat-001",
                  operator_id: "op-001",
                  name: "KM Sri Rejeki 01",
                  type: "kapal_kayu",
                  capacity: 10,
                  base_price: 350000,
                  available: true,
                },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "bookings") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: "booking-001",
                    user_id: "user-101",
                    boat_id: "boat-001",
                    booking_date: "2026-11-20",
                    departure_time: "08:30:00",
                    passengers: 4,
                    total_price: 350000,
                    booking_status: "confirmed",
                    payment_status: "dp_paid",
                    notes: "Bawa anak kecil",
                    boats: {
                      id: "boat-001",
                      operator_id: "op-001",
                      name: "KM Sri Rejeki 01",
                      type: "kapal_kayu",
                    },
                  },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };
    }),
  },
}));

describe("Sailing Safety Rules & Operator Weather Advisory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url: unknown) => {
      if (String(url).includes("marine")) {
        return {
          ok: true,
          json: async () => ({ current: { wave_height: 0.8 } }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ current: { wind_speed_10m: 10 } }),
      } as Response;
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe("Mesin Aturan Deterministik Keselamatan Pelayaran", () => {
    it("gelombang 0.8m dan angin 9 knot -> status 'aman' (diizinkan berlayar normal)", () => {
      const result = evaluateSailingSafety(0.8, 9.0, true);
      expect(result.level).toBe("aman");
      expect(result.title).toMatch(/AMAN/i);
    });

    it("gelombang 1.1m (mendekati ambang 1.25m) -> status 'waspada' (wajib jaket pelampung)", () => {
      const result = evaluateSailingSafety(1.1, 10.0, true);
      expect(result.level).toBe("waspada");
      expect(result.title).toMatch(/WASPADA/i);
      expect(result.actionGuide).toMatch(/jaket pelampung/i);
    });

    it("gelombang 1.6m atau angin 18 knot -> status 'tunda' (jangan berlayar dulu)", () => {
      const result = evaluateSailingSafety(1.6, 11.0, true);
      expect(result.level).toBe("tunda");
      expect(result.title).toMatch(/TUNDA|LARANGAN/i);
    });

    it("data gelombang null (data tidak ada) -> status maksimal 'waspada', TIDAK PERNAH 'aman'", () => {
      const result = evaluateSailingSafety(null, 10.0, true);
      expect(result.level).toBe("waspada");
      expect(result.level).not.toBe("aman");
      expect(result.title).toMatch(/TIDAK ADA/i);
    });
  });

  describe("Komponen OperatorWeatherAdvisory Banner", () => {
    it("merender banner status cuaca maritim live di atas dashboard operator", async () => {
      render(
        React.createElement(OperatorWeatherAdvisory, {
          initialData: {
            waveM: 0.7,
            windKn: 8.5,
            trendM: 0.1,
            fetchedAt: new Date(),
            source: "model",
          },
        })
      );

      expect(screen.getByText(/Cuaca Laut Hari Ini/i)).toBeDefined();
      expect(screen.getAllByText(/0.7 m/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/8.5 knot/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Boleh Berlayar/i).length).toBeGreaterThanOrEqual(1);
    });

    it("menampilkan alert bahaya saat kondisi laut berstatus 'tunda'", async () => {
      render(
        React.createElement(OperatorWeatherAdvisory, {
          initialData: {
            waveM: 1.8,
            windKn: 19.0,
            trendM: 0.4,
            fetchedAt: new Date(),
            source: "model",
          },
        })
      );

      expect(screen.getAllByText(/TUNDA|LARANGAN BERLAYAR/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/1.8 m/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/19.0 knot/i).length).toBeGreaterThanOrEqual(1);
    });

    it("menampilkan kontrol realtime dan live ticker hitungan mundur", () => {
      render(
        React.createElement(OperatorWeatherAdvisory, {
          initialData: {
            waveM: 0.8,
            windKn: 10.0,
            trendM: 0.1,
            fetchedAt: new Date(),
            source: "Open-Meteo",
          },
        })
      );

      expect(screen.getAllByText(/Diperbarui otomatis|Otomatis diperbarui/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole("combobox", { name: /Mode Telemetri Cuaca/i })).toBeDefined();
    });

    it("mengubah skenario simulasi cuaca secara instan memutakhirkan telemetri dan memicu callback realtime", () => {
      const onStatusChange = vi.fn();
      render(
        React.createElement(OperatorWeatherAdvisory, {
          initialData: {
            waveM: 0.8,
            windKn: 10.0,
            trendM: 0.1,
            fetchedAt: new Date(),
            source: "Open-Meteo",
          },
          onStatusChange,
        })
      );

      const select = screen.getByRole("combobox", { name: /Mode Telemetri Cuaca/i });
      fireEvent.change(select, { target: { value: "simulasi_tunda" } });

      expect(screen.getAllByText(/TUNDA|LARANGAN BERLAYAR/i).length).toBeGreaterThanOrEqual(1);
      expect(onStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "tunda",
        })
      );
    });
  });

  describe("Integrasi di OperatorDashboard", () => {
    it("dashboard operator merender banner cuaca live dan badge kelaikan cuaca armada", async () => {
      render(
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(OperatorDashboard)
        )
      );

      await waitFor(() => {
        expect(screen.getByText(/Cuaca Laut Hari Ini/i)).toBeDefined();
        expect(screen.getByText(/Teluk Penyu & Nusakambangan/i)).toBeDefined();
      });
    });

    it("dashboard operator berlangganan channel realtime Supabase untuk sinkronisasi seketika", async () => {
      render(
        React.createElement(
          MemoryRouter,
          null,
          React.createElement(OperatorDashboard)
        )
      );

      await waitFor(() => {
        expect(supabase.channel).toHaveBeenCalledWith("operator-dashboard-sync");
      });
    });
  });
});

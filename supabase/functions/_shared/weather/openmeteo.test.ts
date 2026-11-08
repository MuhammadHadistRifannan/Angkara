import { describe, it, expect } from "vitest";
import { fetchWaves, fetchOpenMeteoForecast } from "./openmeteo";
import { UpstreamError } from "./bmkg";
import marineFixture from "./fixtures/openmeteo-marine.json";

describe("Open-Meteo Provider", () => {
  it("openmeteo normalisasi: gelombang null dipertahankan (bukan 0)", async () => {
    const fixtureWithNull = [
      {
        latitude: -7.74,
        longitude: 109.02,
        hourly: {
          time: ["2026-11-09T07:00", "2026-11-09T08:00"],
          wave_height: [1.2, null],
        },
      },
    ];
    const mockFetch = async () =>
      new Response(JSON.stringify(fixtureWithNull), { status: 200 });

    const waves = await fetchWaves(
      [{ lat: -7.74, lon: 109.02 }],
      mockFetch as typeof fetch
    );
    expect(waves[0][0].waveM).toBe(1.2);
    expect(waves[0][1].waveM).toBeNull();
    expect(waves[0][1].waveM).not.toBe(0);
  });

  it("fetchWaves dari marineFixture mengembalikan deret waktu gelombang valid", async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify(marineFixture), { status: 200 });

    const waves = await fetchWaves(
      [
        { lat: -7.7401, lon: 109.017 },
        { lat: -7.7348, lon: 108.9063 },
      ],
      mockFetch as typeof fetch
    );
    expect(waves.length).toBe(2);
    expect(waves[0].length).toBe(168);
  });

  it("fetchWaves error handling → melempar UpstreamError", async () => {
    const mockFail = async () => new Response("Internal Error", { status: 500 });
    await expect(
      fetchWaves([{ lat: -7.74, lon: 109.02 }], mockFail as typeof fetch)
    ).rejects.toThrow(UpstreamError);
  });

  it("fetchOpenMeteoForecast mengembalikan deret cuaca tanpa waveM", async () => {
    const forecastFixture = [
      {
        hourly: {
          time: ["2026-11-09T08:00"],
          wind_speed_10m: [18.52],
          precipitation: [2.5],
          weather_code: [95],
        },
      },
    ];
    const mockFetch = async () =>
      new Response(JSON.stringify(forecastFixture), { status: 200 });

    const forecast = await fetchOpenMeteoForecast(
      [{ lat: -7.74, lon: 109.02 }],
      mockFetch as typeof fetch
    );
    expect(forecast[0][0].windKn).toBe(10);
    expect(forecast[0][0].rainMmH).toBe(2.5);
    expect(forecast[0][0].thunder).toBe(true);
    expect("waveM" in forecast[0][0]).toBe(false);
  });
});

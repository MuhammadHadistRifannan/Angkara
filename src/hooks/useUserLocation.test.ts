// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUserLocation, CILACAP_CENTER } from "./useUserLocation";

describe("useUserLocation", () => {
  const originalGeolocation = navigator.geolocation;

  beforeEach(() => {
    if (typeof localStorage !== "undefined") localStorage.clear();
    if (typeof sessionStorage !== "undefined") sessionStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: originalGeolocation,
      configurable: true,
      writable: true,
    });
  });

  it("geolocation tidak tersedia → status 'unsupported' dan koordinat default Cilacap", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useUserLocation());
    expect(result.current.status).toBe("unsupported");
    expect(result.current.lat).toBe(CILACAP_CENTER.lat);
    expect(result.current.lon).toBe(CILACAP_CENTER.lon);
  });

  it("izin ditolak (denied) → status 'denied' dan koordinat default Cilacap", async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((_success, error) => {
        error({
          code: 1, // PERMISSION_DENIED
          message: "User denied Geolocation",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      }),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };

    Object.defineProperty(navigator, "geolocation", {
      value: mockGeolocation,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useUserLocation());
    expect(result.current.status).toBe("denied");
    expect(result.current.lat).toBe(CILACAP_CENTER.lat);
    expect(result.current.lon).toBe(CILACAP_CENTER.lon);
  });

  it("izin diberikan (granted) → status 'granted', koordinat dibulatkan 0,1°, TIDAK ditulis ke storage", async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) => {
        success({
          coords: {
            latitude: -7.734891,
            longitude: 109.012345,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
      }),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };

    Object.defineProperty(navigator, "geolocation", {
      value: mockGeolocation,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useUserLocation());
    expect(result.current.status).toBe("granted");
    expect(result.current.lat).toBe(-7.7);
    expect(result.current.lon).toBe(109.0);

    // Pastikan tidak ada data koordinat yang bocor ke localStorage / sessionStorage
    if (typeof localStorage !== "undefined") {
      expect(localStorage.getItem("user_lat")).toBeNull();
      expect(localStorage.getItem("user_lon")).toBeNull();
    }
    if (typeof sessionStorage !== "undefined") {
      expect(sessionStorage.getItem("user_lat")).toBeNull();
      expect(sessionStorage.getItem("user_lon")).toBeNull();
    }
  });
});

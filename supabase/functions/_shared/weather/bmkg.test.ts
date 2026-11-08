import { describe, it, expect } from "vitest";
import { fetchBmkg, UpstreamError } from "./bmkg";
import fixtureCilacap from "./fixtures/bmkg-33.01.21.1002.json";

describe("BMKG Provider", () => {
  it("bmkg normalisasi: dari fixture, jumlah jam > 0, windKn = km/jam ÷ 1.852 (satu nilai dicek hingga 2 desimal), thunder true untuk deskripsi yang memuat 'Petir'", async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify(fixtureCilacap), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    const hours = await fetchBmkg("33.01.21.1002", mockFetch as typeof fetch);
    expect(hours.length).toBeGreaterThan(0);

    // Cek nilai pertama
    const firstRaw = fixtureCilacap.data[0].cuaca[0][0];
    const expectedWindKn = Math.round((firstRaw.ws / 1.852) * 100) / 100;
    expect(hours[0].windKn).toBe(expectedWindKn);

    // Cek thunder
    const thunderFixture = {
      data: [
        {
          lokasi: fixtureCilacap.data[0].lokasi,
          cuaca: [
            [
              {
                datetime: "2026-11-09T08:00:00Z",
                local_datetime: "2026-11-09 15:00:00",
                ws: 10,
                tp: 15,
                weather_desc: "Hujan Petir",
              },
            ],
          ],
        },
      ],
    };
    const thunderMock = async () =>
      new Response(JSON.stringify(thunderFixture), { status: 200 });
    const thunderHours = await fetchBmkg("33.01.21.1002", thunderMock as typeof fetch);
    expect(thunderHours[0].thunder).toBe(true);
  });

  it("fetchBmkg dengan f yang melempar → melempar error terketik UpstreamError", async () => {
    const rejectingFetch = async () => {
      throw new Error("Koneksi gagal");
    };
    await expect(
      fetchBmkg("33.01.21.1002", rejectingFetch as typeof fetch)
    ).rejects.toThrow(UpstreamError);
  });
});

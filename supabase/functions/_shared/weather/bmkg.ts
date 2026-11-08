export class UpstreamError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "UpstreamError";
  }
}

export interface BmkgHour {
  time: string;
  windKn: number;
  rainMmH: number;
  thunder: boolean;
  weatherDesc: string;
}

export async function fetchBmkg(
  adm4: string,
  f: typeof fetch = fetch
): Promise<BmkgHour[]> {
  const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${encodeURIComponent(adm4)}`;

  let res: Response;
  try {
    res = await f(url);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new UpstreamError(`Gagal menghubungi API BMKG: ${msg}`);
  }

  if (!res.ok) {
    throw new UpstreamError(`BMKG merespons dengan status ${res.status}`, res.status);
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new UpstreamError(`Gagal membaca respons JSON dari BMKG: ${msg}`);
  }

  const payload = json as {
    data?: Array<{
      cuaca?: Array<
        Array<{
          datetime?: string;
          local_datetime?: string;
          ws?: number;
          tp?: number;
          weather_desc?: string;
        }>
      >;
    }>;
  };

  if (!payload?.data || !Array.isArray(payload.data) || payload.data.length === 0) {
    throw new UpstreamError("Data prakiraan cuaca BMKG kosong atau tidak ditemukan");
  }

  const rawCuaca = payload.data[0].cuaca;
  if (!rawCuaca || !Array.isArray(rawCuaca)) {
    throw new UpstreamError("Format data cuaca BMKG tidak valid");
  }

  const flatItems = rawCuaca.flat();
  return flatItems.map((item) => {
    let timeIso: string;
    if (item.local_datetime) {
      timeIso = item.local_datetime.replace(" ", "T") + "+07:00";
    } else if (item.datetime) {
      timeIso = item.datetime;
    } else {
      timeIso = "";
    }

    const windSpeedKmH = Number(item.ws ?? 0);
    const windKn = Math.round((windSpeedKmH / 1.852) * 100) / 100;
    const rainMmH = Number(item.tp ?? 0);
    const weatherDesc = item.weather_desc ?? "";
    const thunder = weatherDesc.includes("Petir");

    return {
      time: timeIso,
      windKn,
      rainMmH,
      thunder,
      weatherDesc,
    };
  });
}

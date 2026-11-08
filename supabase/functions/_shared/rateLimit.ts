export interface RateLimitClient {
  rpc: (func: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
}

export async function checkRateLimit(
  client: RateLimitClient,
  ip: string,
  service = "marine"
): Promise<{ allowed: boolean; limitType?: "minute" | "hour" }> {
  // Jendela 1 menit: maksimal 30 permintaan
  const minuteKey = `rl:${service}:${ip}:1m`;
  const { data: allowedMin, error: errMin } = await client.rpc("hit_rate_limit", {
    p_key: minuteKey,
    p_window_seconds: 60,
    p_limit: 30,
  });

  if (errMin || !allowedMin) {
    return { allowed: false, limitType: "minute" };
  }

  // Jendela 1 jam: maksimal 300 permintaan
  const hourKey = `rl:${service}:${ip}:1h`;
  const { data: allowedHour, error: errHour } = await client.rpc("hit_rate_limit", {
    p_key: hourKey,
    p_window_seconds: 3600,
    p_limit: 300,
  });

  if (errHour || !allowedHour) {
    return { allowed: false, limitType: "hour" };
  }

  return { allowed: true };
}

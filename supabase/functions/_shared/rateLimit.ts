export interface RateLimitClient {
  rpc: (func: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
}

export async function checkRateLimit(
  client: RateLimitClient,
  ip: string,
  service = "marine",
  limits: { minuteLimit: number; hourLimit: number } = { minuteLimit: 30, hourLimit: 300 }
): Promise<{ allowed: boolean; limitType?: "minute" | "hour" }> {
  // Jendela 1 menit
  const minuteKey = `rl:${service}:${ip}:1m`;
  const { data: allowedMin, error: errMin } = await client.rpc("hit_rate_limit", {
    p_key: minuteKey,
    p_window_seconds: 60,
    p_limit: limits.minuteLimit,
  });

  if (errMin || !allowedMin) {
    return { allowed: false, limitType: "minute" };
  }

  // Jendela 1 jam
  const hourKey = `rl:${service}:${ip}:1h`;
  const { data: allowedHour, error: errHour } = await client.rpc("hit_rate_limit", {
    p_key: hourKey,
    p_window_seconds: 3600,
    p_limit: limits.hourLimit,
  });

  if (errHour || !allowedHour) {
    return { allowed: false, limitType: "hour" };
  }

  return { allowed: true };
}

export interface CacheEntry<T = unknown> {
  key: string;
  payload: T;
  fetched_at: string;
}

export interface CacheDb {
  get<T = unknown>(key: string): Promise<CacheEntry<T> | null>;
  set<T = unknown>(key: string, payload: T, fetched_at?: string): Promise<void>;
  getDailyCount?(dateStr: string, service: string): Promise<number>;
  incrementDailyCount?(dateStr: string, service: string): Promise<number>;
}

export interface SupabaseLikeClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, val: unknown) => {
        maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
      };
    };
    upsert: (values: unknown) => Promise<{ error: unknown }>;
  };
  rpc: (func: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
}

export function createSupabaseCacheDb(supabaseClient: SupabaseLikeClient): CacheDb {
  return {
    async get<T = unknown>(key: string): Promise<CacheEntry<T> | null> {
      const { data, error } = await supabaseClient
        .from("weather_cache")
        .select("key, payload, fetched_at")
        .eq("key", key)
        .maybeSingle();

      if (error || !data) return null;
      const record = data as { key: string; payload: unknown; fetched_at: string };
      return {
        key: record.key,
        payload: record.payload as T,
        fetched_at: record.fetched_at,
      };
    },

    async set<T = unknown>(key: string, payload: T, fetched_at?: string): Promise<void> {
      const row = {
        key,
        payload,
        fetched_at: fetched_at || new Date().toISOString(),
      };
      await supabaseClient.from("weather_cache").upsert(row);
    },

    async getDailyCount(dateStr: string, service: string): Promise<number> {
      const key = `daily:${service}:${dateStr}`;
      const { data } = await supabaseClient
        .from("rate_limits")
        .select("count")
        .eq("key", key)
        .maybeSingle();
      const record = data as { count?: number } | null;
      return record?.count ?? 0;
    },

    async incrementDailyCount(dateStr: string, service: string): Promise<number> {
      const key = `daily:${service}:${dateStr}`;
      const { data } = await supabaseClient.rpc("hit_rate_limit", {
        p_key: key,
        p_window_seconds: 86400,
        p_limit: 8000,
      });
      const { data: row } = await supabaseClient
        .from("rate_limits")
        .select("count")
        .eq("key", key)
        .maybeSingle();
      const record = row as { count?: number } | null;
      return record?.count ?? (data ? 1 : 8001);
    },
  };
}

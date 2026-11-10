import type { z } from "zod";
import type { BoatType, HourSample, Level } from "./safety/rules";
import type { CacheDb } from "./cache";

export type MarineSource = "official" | "model" | "unavailable";

export interface MarineSeries {
  pointId: string;
  samples: HourSample[];
  verdicts: Array<{ date: string; level: Level; reasons: string[] }>;
}

export interface MarineResponse {
  source: MarineSource;
  fetched_at: string;
  stale: boolean;
  series: MarineSeries[];
  attribution: string[];
  thresholds?: {
    maxWaveM: number;
    maxWindKn: number;
    waspadaMmH: number;
    tundaMmH: number;
  };
}

export type MarineRequest =
  | { kind: "point"; pointId: string }
  | { kind: "user"; lat: number; lon: number };

export interface MarineDeps {
  fetch: typeof fetch;
  db: CacheDb;
  now: () => Date;
  forceUnavailable?: boolean;
}

// -------------------------------------------------------------
// Kartu Antarmuka Asisten (Assistant Cards)
// -------------------------------------------------------------

export interface BoatOptionsCard {
  type: "boat_options";
  boats: Array<{
    id: string;
    name: string;
    type: BoatType;
    capacity: number;
    basePrice: number;
    location: string;
    description?: string;
    imageUrl?: string;
  }>;
}

export interface WeatherVerdictCard {
  type: "weather_verdict";
  pointId: string;
  pointName: string;
  date: string;
  level: Level;
  reasons: string[];
  source: MarineSource;
  fetched_at: string;
}

export interface SafestWindowCard {
  type: "safest_window";
  pointId: string;
  pointName: string;
  days: Array<{
    date: string;
    level: Level;
    worstHour: string | null;
    reasons: string[];
  }>;
}

export interface BookingDraftCard {
  type: "booking_draft";
  boatId: string;
  boatName: string;
  date: string;
  time: string;
  passengers: number;
  totalPrice: number;
  dpPrice: number;
  verdict: Level;
  verdictReasons: string[];
  source: MarineSource;
  fetched_at: string;
}

export type AssistantCard =
  | BoatOptionsCard
  | WeatherVerdictCard
  | SafestWindowCard
  | BookingDraftCard;

// -------------------------------------------------------------
// Kontrak Tool Agen
// -------------------------------------------------------------

export type ToolResult<T> =
  | { ok: true; data: T; card?: AssistantCard }
  | { ok: false; reason: string };

export interface SupabaseLike {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, val: unknown) => {
        eq?: (column: string, val: unknown) => unknown;
        maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
      };
      gte?: (column: string, val: unknown) => unknown;
      order?: (column: string, opts?: unknown) => unknown;
    };
  };
  rpc: (func: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
}

export interface ToolCtx {
  supabase: SupabaseLike;
  marine: (pointId: string) => Promise<MarineResponse>;
  now: () => Date;
}

export interface ToolDef<I, O> {
  name: string;
  description: string;
  schema: z.ZodType<I>;
  run(input: I, ctx: ToolCtx): Promise<ToolResult<O>>;
}

// -------------------------------------------------------------
// Agent & LLM Chat Contracts (Task 7)
// -------------------------------------------------------------

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantReply {
  text: string;
  cards: AssistantCard[];
}

export type LlmTurn =
  | { role: "user"; content: string }
  | { role: "assistant"; content?: string; toolCalls?: Array<{ name: string; args: unknown }> }
  | { role: "tool"; name: string; response: unknown };

export interface ToolSpec {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export type LlmResult =
  | { kind: "text"; text: string }
  | { kind: "tool_calls"; calls: Array<{ name: string; args: unknown }> };

export interface LlmClient {
  generate(req: { system: string; messages: LlmTurn[]; tools: ToolSpec[] }): Promise<LlmResult>;
}

export interface ChatDeps {
  llm: LlmClient;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: ToolDef<any, any>[];
  ctx: ToolCtx;
  now: () => Date;
  clientIp?: string;
  supabase?: SupabaseLike;
}


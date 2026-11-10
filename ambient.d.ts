import "@supabase/supabase-js";
import type { Level } from "./supabase/functions/_shared/safety/rules";

declare module "@supabase/supabase-js" {
  interface SupabaseClient {
    rpc(fn: string, args?: Record<string, unknown>, options?: unknown): any;
  }
}

declare module "@supabase/postgrest-js" {
  interface PostgrestClient {
    rpc(fn: string, args?: Record<string, unknown>, options?: unknown): any;
  }
}

declare module "@supabase/auth-js" {
  interface GoTrueClient {
    signInWithOAuth(credentials: any): Promise<{ data: any; error: any }>;
  }
}

declare module "./supabase/functions/_shared/contracts" {
  export interface WeatherVerdictCard {
    verdict?: string;
    metrics?: {
      waveHeightMax: number | null;
      windSpeedMax: number;
      rainAccumulation: number;
      thunder: boolean;
    };
  }
  export interface SafestWindowCard {
    rankedDays?: Array<{
      date: string;
      level: Level;
      recommendation?: string;
    }>;
  }
  export interface BookingDraftCard {
    boatType?: string;
  }
}

declare module "../../../../supabase/functions/_shared/contracts" {
  export interface WeatherVerdictCard {
    verdict?: string;
    metrics?: {
      waveHeightMax: number | null;
      windSpeedMax: number;
      rainAccumulation: number;
      thunder: boolean;
    };
  }
  export interface SafestWindowCard {
    rankedDays?: Array<{
      date: string;
      level: Level;
      recommendation?: string;
    }>;
  }
  export interface BookingDraftCard {
    boatType?: string;
  }
}

// Setup global mocks for Vitest running in node environment

// Fallback environment variables untuk Supabase client dalam lingkungan CI tanpa file .env
if (!process.env.VITE_SUPABASE_URL) {
  process.env.VITE_SUPABASE_URL = "https://placeholder.supabase.co";
}
if (!process.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "placeholder-anon-key";
}

// Polyfill localStorage di Node environment agar library dan tes tidak melempar ReferenceError
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => {
      store.set(key, String(val));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
}

if (typeof globalThis.sessionStorage === "undefined") {
  const store = new Map<string, string>();
  globalThis.sessionStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => {
      store.set(key, String(val));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
}

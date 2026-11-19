import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 15000,
    include: ["src/**/*.test.{ts,tsx}", "supabase/functions/**/*.test.{ts,tsx}", "scripts/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    poolOptions: {
      forks: {
        execArgv: ["--require", path.resolve(__dirname, "./src/test/preload.cjs")],
      },
      threads: {
        execArgv: ["--require", path.resolve(__dirname, "./src/test/preload.cjs")],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

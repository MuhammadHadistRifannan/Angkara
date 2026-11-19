import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    testTimeout: 15000,
    environment: "node",
    include: ["src/**/*.test.ts", "supabase/functions/**/*.test.ts", "scripts/**/*.test.ts"],
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

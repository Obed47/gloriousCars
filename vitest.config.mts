import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // Resolves the "@/..." alias from tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    // Components run in jsdom. Pure-logic and database tests opt into the
    // node environment with a `@vitest-environment node` docblock.
    environment: "jsdom",
    // Full pages with motion and user-event are slow in jsdom.
    testTimeout: 20_000,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/components/**/*.test.{ts,tsx}", "tests/db/**/*.test.ts"],
    env: {
      // Fake project values so modules that read the env at import time work.
      NEXT_PUBLIC_SUPABASE_URL: "https://test-project.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
      NEXT_PUBLIC_SITE_URL: "https://www.example-dealer.test",
    },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/app/**/layout.tsx", "src/**/*.d.ts"],
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
    },
  },
});

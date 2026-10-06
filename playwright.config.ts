import { defineConfig, devices } from "@playwright/test";
import { E2E_ENV, E2E_PORT, E2E_SUPABASE_PORT } from "./scripts/e2e-env.mjs";

const reuse = !process.env.CI;

// Uses the Google Chrome already installed on this machine. Set
// E2E_BROWSER_CHANNEL to "" to use the Chromium that `npx playwright install` downloads.
const channel = process.env.E2E_BROWSER_CHANNEL ?? "chrome";
const browser = channel ? { channel } : {};

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.spec.ts",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], ...browser } },
    { name: "mobile", use: { ...devices["Pixel 7"], ...browser } },
  ],
  // Run `npm run test:e2e`, which builds first. The site is served from that build.
  webServer: [
    {
      command: "node tests/e2e/support/fake-supabase.mjs",
      url: `http://127.0.0.1:${E2E_SUPABASE_PORT}/__health`,
      reuseExistingServer: reuse,
      env: { FAKE_SUPABASE_PORT: String(E2E_SUPABASE_PORT) },
    },
    {
      command: `node_modules/.bin/next start --port ${E2E_PORT}`,
      url: `http://localhost:${E2E_PORT}`,
      reuseExistingServer: reuse,
      env: { ...E2E_ENV },
      timeout: 120_000,
    },
  ],
});

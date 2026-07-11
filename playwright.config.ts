import { defineConfig, devices } from "@playwright/test";

/**
 * Stage 11 e2e — Chromium only for now (kept fast/simple); WebKit/Firefox
 * are a real addition once cross-browser regressions actually surface,
 * not added speculatively. `webServer` boots the same production-mode
 * build the app actually ships, not `next dev`.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 180_000,
  },
});

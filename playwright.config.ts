import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  expect: { timeout: 10_000 },
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Locally, use the installed Google Chrome instead of downloading browsers.
    channel: isCI ? undefined : "chrome",
  },
  projects: [
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    ...(isCI ? [{ name: "mobile-safari", use: { ...devices["iPhone 14"] } }] : []),
  ],
  webServer: {
    // Always test a production build. CI builds in an earlier step.
    command: isCI ? `npm run start -- --port ${PORT}` : `npm run build && npm run start -- --port ${PORT}`,
    port: PORT,
    reuseExistingServer: !isCI,
    timeout: 240_000,
    env: { ENABLE_DESIGN_SYSTEM: "true" },
  },
});

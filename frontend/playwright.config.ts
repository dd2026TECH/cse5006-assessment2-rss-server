import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3457",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Serves the production build, so tests exercise the app as it actually
    // ships. The build itself runs in `npm test` rather than here: spawning
    // `next build` from this config crashed Turbopack's parallel workers on
    // Windows (exit 0xC0000409) even though the same build succeeds when run
    // directly from a shell.
    command: "npm run start -- --port 3457",
    url: "http://localhost:3457",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});

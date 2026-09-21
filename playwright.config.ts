import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  webServer: {
    command: "npm run dev -- --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:4173",
  },
  projects: [
    {
      name: "ipad-webkit",
      use: {
        ...devices["iPad (gen 7) landscape"],
        browserName: "webkit",
      },
    },
  ],
});

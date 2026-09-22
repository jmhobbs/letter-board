import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Letter Board",
        short_name: "Letter Board",
        description: "Arrange letter tiles on a board.",
        start_url: "/",
        display: "standalone",
        theme_color: "#7e14ff",
        background_color: "#f8fafc",
      },
      pwaAssets: {
        preset: "minimal-2023",
        overrideManifestIcons: true,
      },
    }),
  ],
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts"],
  },
});

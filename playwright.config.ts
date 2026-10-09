import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  timeout: 90_000,
  use: {
    browserName: "chromium",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "bun run build && MCP_PORT=9010 bun run apps/server-mcp/dist/index.js",
    port: 9010,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});

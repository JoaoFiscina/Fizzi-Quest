import { defineConfig } from "@playwright/test";

const testPort = Number(process.env.FIZZI_TEST_PORT ?? "5173");
const testUrl = `http://127.0.0.1:${testPort}`;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90000,
  workers: 1,
  use: {
    baseURL: testUrl,
    channel: "msedge",
    headless: true,
    viewport: { width: 1366, height: 768 },
  },
  webServer: {
    command: `node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port ${testPort} --strictPort`,
    url: testUrl,
    reuseExistingServer:
      !process.env.FIZZI_TEST_PORT ||
      process.env.FIZZI_REUSE_TEST_SERVER === "1",
  },
  reporter: "list",
});

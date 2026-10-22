import { defineConfig, devices } from "@playwright/test";

// E2E_PORT deixa rodar contra um build de produção enquanto o `next dev` ocupa a 3000.
const port = process.env.E2E_PORT ?? "3000";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: `http://localhost:${port}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});

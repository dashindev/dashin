import { defineConfig } from "@playwright/test"

const port = Number(process.env.DASHIN_E2E_PORT || 3000)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid DASHIN_E2E_PORT")
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: { baseURL, headless: true },
  // Vite dev server runs the dashin generator on startup.
  webServer: {
    command: `yarn dev --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
})

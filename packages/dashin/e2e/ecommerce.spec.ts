import { test, expect, Page } from "@playwright/test"

// Live e-commerce demo e2e. Drives a real dev server (VITE_MAIN_URL pointed at a
// local wrangler dev D1 gateway). Because the dev server may run off the single
// CORS-allowed port (:3000), we inject permissive CORS headers on the worker
// responses via route interception (the established off-port pattern). Logs in
// with the client-side auth-local plugin (admin / dashin), then asserts the
// dashboard KPIs + charts render with real data and entity tables load.
// Opt-in: this suite needs a running dev server + a reachable D1 gateway Worker,
// so it's skipped by default (incl. CI, which has no backend). Run it with
// E2E_LIVE=1 after starting `wrangler dev` and a dev server pointed at it.
const LIVE = !!process.env.E2E_LIVE
const BASE = process.env.E2E_BASE || "http://localhost:3100"
const WORKER = /127\.0\.0\.1:8790\//

test.skip(!LIVE, "live demo e2e — set E2E_LIVE=1 with a dev server + local D1 worker")

async function allowCors(page: Page) {
  await page.route(WORKER, async route => {
    const cors = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type,authorization"
    }
    if (route.request().method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers: cors })
    }
    const resp = await route.fetch()
    const body = await resp.body()
    await route.fulfill({ status: resp.status(), headers: { ...resp.headers(), ...cors }, body })
  })
}

async function login(page: Page) {
  await allowCors(page)
  await page.goto(`${BASE}/auth/sign-in`)
  await page.waitForLoadState("networkidle")
  const user = page.locator('input[name="username"]')
  if (await user.count()) {
    await user.fill("admin")
    await page.locator('input[name="password"]').fill("dashin")
    await page.locator('button[type="submit"]').click()
    await page.waitForLoadState("networkidle")
  }
}

test("dashboard renders KPIs + charts with real data", async ({ page }) => {
  await login(page)
  await page.goto(`${BASE}/`)
  await page.waitForLoadState("networkidle")

  await expect(page.getByRole("heading", { name: /Store/ })).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText("Revenue (30d)")).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText("Orders (30d)")).toBeVisible()

  // A real currency value in the KPI band (e.g. $1,234.00)
  await expect(page.getByText(/\$[\d,]+\.\d{2}/).first()).toBeVisible({ timeout: 30_000 })

  await expect(page.locator('svg[aria-label="Trend chart"]')).toBeVisible()
  await expect(page.locator('svg[aria-label="Donut chart"]')).toBeVisible()
  await expect(page.getByText("Orders by status")).toBeVisible()
  await expect(page.getByText("Products by category")).toBeVisible()
  await expect(page.getByText("Recent orders")).toBeVisible()
})

test("grouped sidebar + orders table loads real rows", async ({ page }) => {
  await login(page)
  await page.goto(`${BASE}/`)
  await page.waitForLoadState("networkidle")

  await expect(page.getByText("Catalog", { exact: true })).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText("Sales", { exact: true })).toBeVisible()

  await page.goto(`${BASE}/d1/orders`)
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1500)
  await expect(page.getByText(/\$[\d,]+\.\d{2}/).first()).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText(/Paid|Shipped|Pending|Cancelled/).first()).toBeVisible()
})

test("products table resolves category lookups", async ({ page }) => {
  await login(page)
  await page.goto(`${BASE}/d1/products`)
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1500)
  await expect(page.getByText(/Electronics|Apparel|Books|Grocery/).first()).toBeVisible({ timeout: 30_000 })
})

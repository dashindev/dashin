import { test, expect } from "@playwright/test"

// Backend-independent e2e. CI has no API/auth backend, so we cannot complete a
// real login or load remote table data. These tests assert the app boots and
// stays free of fatal runtime errors (the bug class from PR #48), and exercise
// the sign-in form only opportunistically (best-effort, never hard-failing).

function collectErrors(page) {
  const errors: string[] = []
  page.on("pageerror", e => errors.push(e.message))
  page.on("console", m => {
    if (m.type() === "error") errors.push(m.text())
  })
  return errors
}

const fatalRe = /auth plugin is required|does not provide an export|createRoot/i

test("app boots without fatal runtime errors", async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto("/")
  await page.waitForLoadState("networkidle")
  // #root must have mounted something (spinner, index, or sign-in).
  await expect(page.locator("#root")).not.toBeEmpty({ timeout: 30_000 })
  expect(errors.filter(e => fatalRe.test(e))).toHaveLength(0)
})

test("sign-in form is reachable (best-effort) without fatal errors", async ({
  page
}) => {
  const errors = collectErrors(page)
  await page.goto("/auth/sign-in")
  await page.waitForLoadState("networkidle")

  // If the auth route renders the form, fill it; otherwise just assert no crash.
  const user = page.locator('input[name="username"]')
  if (await user.count()) {
    await user.fill("admin")
    await page.locator('input[name="password"]').fill("bunadmin")
    await page.locator('button[type="submit"]').click()
    await page.waitForLoadState("networkidle")
  }
  expect(errors.filter(e => fatalRe.test(e))).toHaveLength(0)
})

test("local table route renders without fatal errors", async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto("/myblog/local")
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1500)
  expect(errors.filter(e => fatalRe.test(e))).toHaveLength(0)
})

import { test, expect } from "@playwright/test"

// Smoke test — loads the app and exercises the sign-in flow.
// This guards against the dev-mode plugin-resolution runtime errors that the
// build/unit tests could not catch (see PR #48).
test("app loads without console errors and reaches sign-in", async ({
  page
}) => {
  const errors: string[] = []
  page.on("pageerror", e => errors.push(e.message))
  page.on("console", m => {
    if (m.type() === "error") errors.push(m.text())
  })

  await page.goto("/")
  await page.waitForLoadState("networkidle")

  // The auth-gated app redirects to the sign-in page; assert it rendered.
  await expect(page.getByText(/sign in/i).first()).toBeVisible({
    timeout: 30_000
  })

  // No "auth plugin is required" / missing-export style runtime errors.
  const fatal = errors.filter(e =>
    /auth plugin is required|does not provide an export|createRoot/i.test(e)
  )
  expect(fatal, `fatal runtime errors:\n${fatal.join("\n")}`).toHaveLength(0)
})

test("sign in with default credentials", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", e => errors.push(e.message))

  await page.goto("/")
  await page.waitForLoadState("networkidle")

  const user = page.locator('input[name="username"]')
  await expect(user).toBeVisible({ timeout: 30_000 })
  await user.fill("admin")
  await page.locator('input[name="password"]').fill("bunadmin")
  await page.locator('button[type="submit"]').click()
  await page.waitForLoadState("networkidle")

  // Sign-in submit must not throw a runtime error.
  expect(errors, `errors after sign-in:\n${errors.join("\n")}`).toHaveLength(0)
})

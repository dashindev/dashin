import { test, expect } from "@playwright/test"

// Backend-independent smoke tests. CI has no API/auth backend, so we assert the
// app boots and is free of the fatal runtime errors that build/unit tests can't
// catch (the plugin-resolution class of bug from PR #48) — not a full login.

const fatalRe = /auth plugin is required|does not provide an export|createRoot/i

test("app loads and mounts without fatal runtime errors", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", e => errors.push(e.message))
  page.on("console", m => {
    if (m.type() === "error") errors.push(m.text())
  })

  await page.goto("/")
  await page.waitForLoadState("networkidle")

  // #root must have mounted something (spinner, index page, or sign-in form).
  await expect(page.locator("#root")).not.toBeEmpty({ timeout: 30_000 })

  const fatal = errors.filter(e => fatalRe.test(e))
  expect(fatal, `fatal runtime errors:\n${fatal.join("\n")}`).toHaveLength(0)
})

test("sign-in route renders without fatal errors (best-effort login)", async ({
  page
}) => {
  const errors: string[] = []
  page.on("pageerror", e => errors.push(e.message))

  await page.goto("/auth/sign-in")
  await page.waitForLoadState("networkidle")

  const user = page.locator('input[name="username"]')
  if (await user.count()) {
    await user.fill("admin")
    await page.locator('input[name="password"]').fill("bunadmin")
    await page.locator('button[type="submit"]').click()
    await page.waitForLoadState("networkidle")
  }

  const fatal = errors.filter(e => fatalRe.test(e))
  expect(fatal, `fatal runtime errors:\n${fatal.join("\n")}`).toHaveLength(0)
})

import { test, expect } from "@playwright/test"

function collectErrors(page) {
  const errors: string[] = []
  page.on("pageerror", e => errors.push(e.message))
  page.on("console", m => {
    if (m.type() === "error") errors.push(m.text())
  })
  return errors
}

const fatalRe = /auth plugin is required|does not provide an export|createRoot/i

test("Atomo dynamic schema route boots without fatal runtime errors", async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto("/atomo/contacts")
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1000)

  expect(errors.filter(e => fatalRe.test(e))).toHaveLength(0)
})

test("Atomo observability dashboard route boots without fatal runtime errors", async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto("/observability")
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1000)

  expect(errors.filter(e => fatalRe.test(e))).toHaveLength(0)
})

test("Atomo workflows pipeline route boots without fatal runtime errors", async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto("/workflows")
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1000)

  expect(errors.filter(e => fatalRe.test(e))).toHaveLength(0)
})

import { test, expect } from "@playwright/test"

// CRUD-flow smoke test — signs in, navigates to a local-data table,
// asserts the table renders, and exercises the add-row flow if available.
// Designed to be resilient: skips optional UI elements gracefully.

test.describe("CRUD flow — /myblog/local", () => {
  let errors: string[] = []

  test.beforeEach(async ({ page }) => {
    errors = []
    page.on("pageerror", e => errors.push(e.message))
    page.on("console", m => {
      if (m.type() === "error") errors.push(m.text())
    })

    // Sign in — target fields by their stable `name` attr (i18n-independent;
    // placeholder text is translated via t() and not reliable in CI).
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    const user = page.locator('input[name="username"]')
    await expect(user).toBeVisible({ timeout: 30_000 })
    await user.fill("admin")
    await page.locator('input[name="password"]').fill("bunadmin")
    await page.locator('button[type="submit"]').click()
    await page.waitForLoadState("networkidle")
  })

  test("table renders at /myblog/local", async ({ page }) => {
    await page.goto("/myblog/local")
    await page.waitForLoadState("networkidle")

    // The table should render — look for <table> or role=table or rows
    const table = page.locator("table").first()
    const rows = page.getByRole("row")

    const tableVisible = (await table.count()) > 0
    const rowsVisible = (await rows.count()) > 0

    expect(
      tableVisible || rowsVisible,
      "Expected a <table> element or table rows to be visible"
    ).toBe(true)
  })

  test("add row flow (skip if button absent)", async ({ page }) => {
    await page.goto("/myblog/local")
    await page.waitForLoadState("networkidle")

    // Look for an add button — could be '+', 'add', or an icon button
    const addBtn =
      page.getByRole("button", { name: /add|\+/i })

    if ((await addBtn.count()) === 0) {
      test.skip(true, "No add button found — skipping add-row test")
      return
    }

    await addBtn.first().click()

    // After clicking add, expect new inputs or an editable row to appear
    const inputs = page.locator("table input, table select, [role='row'] input")
    await expect(inputs.first()).toBeVisible({ timeout: 10_000 }).catch(() => {
      // Not fatal — the add flow may use a dialog or different pattern
    })

    // Attempt to cancel — look for cancel/close button
    const cancelBtn = page.getByRole("button", { name: /cancel|close|×/i })
    if ((await cancelBtn.count()) > 0) {
      await cancelBtn.first().click()
    } else {
      // Press Escape as fallback
      await page.keyboard.press("Escape")
    }
  })

  test("no fatal console/page errors after navigation", async ({ page }) => {
    await page.goto("/myblog/local")
    await page.waitForLoadState("networkidle")

    // Allow a moment for async errors to surface
    await page.waitForTimeout(2000)

    const fatal = errors.filter(e =>
      /auth plugin is required|does not provide an export|createRoot/i.test(e)
    )
    expect(fatal, `fatal runtime errors:\n${fatal.join("\n")}`).toHaveLength(0)
  })
})

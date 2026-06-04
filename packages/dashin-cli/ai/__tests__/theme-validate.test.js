// node --test ai/__tests__/theme-validate.test.js
const { test } = require("node:test")
const assert = require("node:assert")
const { validateTheme } = require("../theme-validate")

test("accepts a valid preset+mode+override", () => {
  const r = validateTheme({ preset: "modern", mode: "dark", overrides: { primary: "#7c3aed" } })
  assert.equal(r.ok, true)
  assert.deepEqual(r.theme, { preset: "modern", mode: "dark", overrides: { primary: "#7c3aed" } })
})

test("accepts gradient + radius values", () => {
  const r = validateTheme({
    overrides: { primaryGradient: "linear-gradient(135deg, #3b82f6, #8b5cf6)", radius: "16px" }
  })
  assert.equal(r.ok, true)
})

test("rejects unknown preset", () => {
  const r = validateTheme({ preset: "neon" })
  assert.equal(r.ok, false)
  assert.ok(r.errors.some(e => e.includes("unknown preset")))
})

test("rejects invalid mode", () => {
  assert.equal(validateTheme({ mode: "sepia" }).ok, false)
})

test("rejects hallucinated token name", () => {
  const r = validateTheme({ overrides: { backgroundColorFancy: "#000" } })
  assert.ok(r.errors.some(e => e.includes('unknown token "backgroundColorFancy"')))
})

test("rejects bad color value", () => {
  const r = validateTheme({ overrides: { primary: "purple-ish" } })
  assert.ok(r.errors.some(e => e.includes('invalid value for "primary"')))
})

test("rejects empty theme", () => {
  assert.equal(validateTheme({}).ok, false)
})

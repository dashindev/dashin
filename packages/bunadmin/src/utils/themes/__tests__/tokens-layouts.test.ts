import { describe, it, expect } from "vitest"
import { resolveLayout, getLayout, LAYOUT_A } from "../layouts"
import { tokensToCssVars, darkTokens } from "../tokens"

describe("resolveLayout", () => {
  it("returns Layout A baseline by default", () => {
    const r = resolveLayout({})
    expect(r.ok).toBe(true)
    expect(r.layout.id).toBe("layout-a")
    expect(r.layout.statBand).toBe(false)
  })

  it("composes Image 2 from Layout A via opt-in regions", () => {
    const r = resolveLayout({
      statBand: true,
      sidebarFooter: "stats",
      buttons: "labeled",
      dashboardNav: true
    })
    expect(r.ok).toBe(true)
    expect(r.layout).toMatchObject({
      id: "layout-a",
      statBand: true,
      sidebarFooter: "stats",
      buttons: "labeled"
    })
  })

  it("rejects unknown layout id and invalid slot values", () => {
    expect(resolveLayout({ id: "nope" }).ok).toBe(false)
    expect(resolveLayout({ sidebarFooter: "bogus" as any }).ok).toBe(false)
    expect(resolveLayout({ density: "huge" as any }).ok).toBe(false)
  })

  it("getLayout falls back to Layout A for unknown ids", () => {
    expect(getLayout("missing")).toEqual(LAYOUT_A)
  })
})

describe("tokensToCssVars", () => {
  it("maps token keys to --bn-* CSS variables", () => {
    const vars = tokensToCssVars({ primary: "#000", radius: "4px" })
    expect(vars["--bn-primary"]).toBe("#000")
    expect(vars["--bn-radius"]).toBe("4px")
  })
  it("maps a full dark token set", () => {
    const vars = tokensToCssVars(darkTokens)
    expect(vars["--bn-bg"]).toBe(darkTokens.bg)
    expect(Object.keys(vars)).toHaveLength(12)
  })
})

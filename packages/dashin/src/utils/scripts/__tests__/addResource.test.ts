import { describe, it, expect, vi, beforeEach } from "vitest"

// i18nCodes drives the loop; mock to a single language for determinism.
vi.mock("@/utils/i18n", () => ({ i18nCodes: { en: {} } }))

import addResource from "../addResource"

describe("addResource", () => {
  let i18n: any
  beforeEach(() => {
    i18n = { addResourceBundle: vi.fn() }
  })

  it("resolves a normal plugin name as dashin-plugin-{team}-{group}", () => {
    const requirePlugin = vi.fn(() => ({ plugins: { Hello: "Hi" } }))
    addResource({ i18n, team: "myteam", group: "blog", requirePlugin })
    expect(requirePlugin).toHaveBeenCalledWith("dashin-plugin-myteam-blog/utils/i18n/en")
    expect(i18n.addResourceBundle).toHaveBeenCalledWith("en", "plugins", { Hello: "Hi" }, true, true)
  })

  it("special-cases auth/upload groups as the bare {group}", () => {
    const requirePlugin = vi.fn(() => null)
    addResource({ i18n, team: "x", group: "auth-local", requirePlugin })
    expect(requirePlugin).toHaveBeenCalledWith("auth-local/utils/i18n/en")
  })

  it("skips bundling when the plugin lang is missing", () => {
    addResource({ i18n, team: "t", group: "g", requirePlugin: () => null })
    expect(i18n.addResourceBundle).not.toHaveBeenCalled()
  })

  it("adds the table bundle when present", () => {
    addResource({
      i18n, team: "t", group: "g",
      requirePlugin: () => ({ table: { Id: "ID" } })
    })
    expect(i18n.addResourceBundle).toHaveBeenCalledWith("en", "table", { Id: "ID" }, true, true)
  })
})

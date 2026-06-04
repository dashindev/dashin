import { describe, it, expect } from "vitest"
import { ENV, DEFAULT_AUTH_PLUGIN, SETTING_NAMES } from "../index"

describe("config ENV", () => {
  it("SITE_NAME is a non-empty string (falls back to Dashin if unset)", () => {
    expect(typeof ENV.SITE_NAME).toBe("string")
    expect(ENV.SITE_NAME.length).toBeGreaterThan(0)
  })

  it("AUTH_PLUGIN is a non-empty string (falls back to DEFAULT_AUTH_PLUGIN if unset)", () => {
    expect(typeof ENV.AUTH_PLUGIN).toBe("string")
    expect(ENV.AUTH_PLUGIN.length).toBeGreaterThan(0)
  })

  it("DB_VERSION is a string defaulting to '1' or set value", () => {
    expect(typeof ENV.DB_VERSION).toBe("string")
    expect(ENV.DB_VERSION.length).toBeGreaterThan(0)
  })

  it("SITE_URLS is an array (strToArr output)", () => {
    expect(Array.isArray(ENV.SITE_URLS)).toBe(true)
  })

  it("PATHS_WITHOUT_LAYOUT is an array", () => {
    expect(Array.isArray(ENV.PATHS_WITHOUT_LAYOUT)).toBe(true)
  })

  it("PATHS_WITHOUT_AUTH is an array", () => {
    expect(Array.isArray(ENV.PATHS_WITHOUT_AUTH)).toBe(true)
  })

  it("REACT_APP_IGNORED_PLUGINS is an array", () => {
    expect(Array.isArray(ENV.REACT_APP_IGNORED_PLUGINS)).toBe(true)
  })

  it("DEFAULT_AUTH_PLUGIN is a non-empty string", () => {
    expect(typeof DEFAULT_AUTH_PLUGIN).toBe("string")
    expect(DEFAULT_AUTH_PLUGIN.length).toBeGreaterThan(0)
  })
})

describe("SETTING_NAMES", () => {
  it("has expected keys", () => {
    expect(SETTING_NAMES).toHaveProperty("i18n_code")
    expect(SETTING_NAMES).toHaveProperty("site_name")
    expect(SETTING_NAMES).toHaveProperty("theme")
    expect(SETTING_NAMES).toHaveProperty("role")
    expect(SETTING_NAMES).toHaveProperty("init_status")
  })
})

import { describe, it, expect, vi } from "vitest"

// Mock heavy dependencies to allow module import without side effects
vi.mock("@/utils", () => ({
  SETTING_NAMES: { role: "role", i18n_code: "i18n_code" },
  store: { dispatch: vi.fn(), getState: vi.fn() },
  IAuthPlugin: {}
}))

vi.mock("@/core", () => ({
  MenuType: {},
  SchemaType: {}
}))

vi.mock("@/slices/nestedMenuSlice", () => ({
  setNestedMenu: vi.fn()
}))

vi.mock("@/slices/schemaSlice", () => ({
  setSchema: vi.fn()
}))

vi.mock("@/utils/scripts/authorization", () => ({
  default: vi.fn().mockResolvedValue(true)
}))

vi.mock("@/utils/scripts/addResource", () => ({
  default: vi.fn()
}))

vi.mock("@/utils/database/dx/dxInitData", () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

vi.mock("@/utils/database", () => ({
  BA_DB: {
    settings: {
      where: () => ({ equals: () => ({ first: () => Promise.resolve(null) }) }),
      filter: () => ({ first: () => Promise.resolve(null) })
    }
  }
}))

describe("initData (smoke)", () => {
  it("exports initData as a function", async () => {
    // Dynamic import after mocks are set up
    const mod = await import("../initData")
    expect(typeof mod.default).toBe("function")
  })

  // NOTE: Deeper unit testing of initData requires integration-level setup
  // because it orchestrates i18n, IndexedDB (dexie), redux store dispatch,
  // and auth checks. The internal helpers (initPluginsData, addSources,
  // checkAuth) are not exported and cannot be tested in isolation without
  // modifying source.
})

import { describe, it, expect } from "vitest"
import { readInitData } from "../plugin-action"

// readInitData normalizes where a plugin exposes its initData: at the module
// root (CommonJS / re-export) or under `default` (ESM namespace). This is what
// lets the generator support both CJS and ESM plugin packages.
describe("readInitData", () => {
  it("reads initData from the module root (CJS / re-export)", () => {
    const data = [{ id: "a" } as any]
    expect(readInitData({ initData: { data } })).toEqual({ data })
  })

  it("reads initData from default (ESM namespace)", () => {
    const data = [{ id: "b" } as any]
    expect(readInitData({ default: { initData: { data } } })).toEqual({ data })
  })

  it("prefers the root initData over default", () => {
    expect(
      readInitData({ initData: { data: [1] }, default: { initData: { data: [2] } } } as any)
    ).toEqual({ data: [1] })
  })

  it("returns undefined when there is no initData", () => {
    expect(readInitData({})).toBeUndefined()
    expect(readInitData(null)).toBeUndefined()
    expect(readInitData(undefined)).toBeUndefined()
  })
})

import { describe, it, expect } from "vitest"
import { payloadOp, buildParams } from "../filter"

describe("payloadOp", () => {
  it("maps operators to Payload where ops", () => {
    expect(payloadOp("=")).toBe("equals")
    expect(payloadOp("!=")).toBe("not_equals")
    expect(payloadOp("_cs=")).toBe("contains")
    expect(payloadOp(">")).toBe("greater_than")
    expect(payloadOp(">=")).toBe("greater_than_equal")
    expect(payloadOp("<=")).toBe("less_than_equal")
  })
})

describe("buildParams", () => {
  const f = (field: string, operator: string, value: any) =>
    ({ column: { field }, operator, value } as any)

  it("builds where + sort + 1-based page", () => {
    const p = buildParams([f("status", "=", "Published")], {
      searchWords: "hi", searchField: "name", page: 2, pageSize: 10,
      orderBy: { field: "views" }, orderDirection: "desc"
    })
    expect(p["where[status][equals]"]).toBe("Published")
    expect(p["where[name][contains]"]).toBe("hi")
    expect(p.sort).toBe("-views")
    expect(p.limit).toBe(10)
    expect(p.page).toBe(3) // 0-based page 2 -> Payload page 3
  })
  it("skips empty filter values", () => {
    expect(buildParams([f("a", "=", "")])["where[a][equals]"]).toBeUndefined()
  })
})

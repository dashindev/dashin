import { describe, it, expect } from "vitest"
import { directusOp, buildParams } from "../filter"

describe("directusOp", () => {
  it("maps operators to Directus filter ops", () => {
    expect(directusOp("=")).toBe("_eq")
    expect(directusOp("!=")).toBe("_neq")
    expect(directusOp("_cs=")).toBe("_contains")
    expect(directusOp("_ncs=")).toBe("_ncontains")
    expect(directusOp(">")).toBe("_gt")
    expect(directusOp("<=")).toBe("_lte")
  })
})

describe("buildParams", () => {
  const f = (field: string, operator: string, value: any) =>
    ({ column: { field }, operator, value } as any)

  it("builds nested filter + sort + pagination + meta", () => {
    const p = buildParams([f("status", "=", "Published")], {
      searchWords: "hi", page: 2, pageSize: 10,
      orderBy: { field: "views" }, orderDirection: "desc"
    })
    expect(p["filter[status][_eq]"]).toBe("Published")
    expect(p.search).toBe("hi")
    expect(p.sort).toBe("-views")
    expect(p.limit).toBe(10)
    expect(p.offset).toBe(20)
    expect(p.meta).toBe("filter_count")
  })
  it("skips empty filter values", () => {
    expect(buildParams([f("a", "=", "")])["filter[a][_eq]"]).toBeUndefined()
  })
})

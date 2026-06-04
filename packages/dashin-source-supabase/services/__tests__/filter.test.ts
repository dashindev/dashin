import { describe, it, expect } from "vitest"
import { buildClause, buildParams } from "../filter"

describe("buildClause (PostgREST)", () => {
  it("maps eq / ilike(contains) / neq", () => {
    expect(buildClause("=", "Published")).toBe("eq.Published")
    expect(buildClause("_cs=", "foo")).toBe("ilike.*foo*")
    expect(buildClause("!=", "x")).toBe("neq.x")
  })
  it("maps numeric comparisons", () => {
    expect(buildClause(">", 5)).toBe("gt.5")
    expect(buildClause(">=", 5)).toBe("gte.5")
    expect(buildClause("<", 5)).toBe("lt.5")
    expect(buildClause("<=", 5)).toBe("lte.5")
  })
  it("maps not-contains to not.ilike", () => {
    expect(buildClause("_ncs=", "bar")).toBe("not.ilike.*bar*")
  })
})

describe("buildParams", () => {
  const f = (field: string, operator: string, value: any) =>
    ({ column: { field }, operator, value } as any)

  it("builds select + filter + search + order + pagination", () => {
    const p = buildParams([f("status", "=", "Published")], {
      searchWords: "hi",
      searchField: "name",
      page: 2,
      pageSize: 10,
      orderBy: { field: "views" },
      orderDirection: "desc"
    })
    expect(p.select).toBe("*")
    expect(p.status).toBe("eq.Published")
    expect(p.name).toBe("ilike.*hi*")
    expect(p.order).toBe("views.desc")
    expect(p.limit).toBe(10)
    expect(p.offset).toBe(20)
  })

  it("skips empty filter values", () => {
    const p = buildParams([f("a", "=", "")])
    expect(p.a).toBeUndefined()
  })
})

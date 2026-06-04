import { describe, it, expect } from "vitest"
import { q, buildClause, buildQueries } from "../filter"

describe("buildClause (Appwrite query mapping)", () => {
  it("maps equal / search / notEqual", () => {
    expect(buildClause("status", "=", "Published")).toBe(
      JSON.stringify({ method: "equal", attribute: "status", values: ["Published"] })
    )
    expect(buildClause("name", "_cs=", "a")).toBe(
      JSON.stringify({ method: "search", attribute: "name", values: ["a"] })
    )
    expect(buildClause("name", "!=", "x")).toBe(
      JSON.stringify({ method: "notEqual", attribute: "name", values: ["x"] })
    )
  })
  it("maps numeric comparisons", () => {
    expect(buildClause("views", ">", 5)).toBe(
      JSON.stringify({ method: "greaterThan", attribute: "views", values: [5] })
    )
    expect(buildClause("views", "<=", 9)).toBe(
      JSON.stringify({ method: "lessThanEqual", attribute: "views", values: [9] })
    )
  })
  it("equal accepts array values", () => {
    expect(buildClause("tag", "=", ["a", "b"])).toContain('"values":["a","b"]')
  })
})

describe("buildQueries", () => {
  const f = (field: string, operator: string, value: any) =>
    ({ column: { field }, operator, value } as any)

  it("includes filter + search + sort + pagination", () => {
    const qs = buildQueries([f("status", "=", "Published")], {
      searchWords: "hello",
      searchField: "name",
      page: 2,
      pageSize: 10,
      orderBy: { field: "views" },
      orderDirection: "desc"
    })
    expect(qs.some(s => s.includes('"method":"equal"'))).toBe(true)
    expect(qs.some(s => s.includes('"method":"search"'))).toBe(true)
    expect(qs.some(s => s.includes('"method":"orderDesc"') && s.includes("views"))).toBe(true)
    expect(qs).toContain(q("limit", "", [10]))
    expect(qs).toContain(q("offset", "", [20]))
  })

  it("skips empty filter values, defaults sort to $createdAt", () => {
    const qs = buildQueries([f("a", "=", "")])
    expect(qs.some(s => s.includes('"attribute":"a"'))).toBe(false)
    expect(qs.some(s => s.includes("$createdAt"))).toBe(true)
  })
})

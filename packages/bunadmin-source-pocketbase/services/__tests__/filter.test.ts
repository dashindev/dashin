import { describe, it, expect } from "vitest"
import { escape, buildClause, buildFilter, buildSort } from "../filter"

describe("buildClause", () => {
  it("maps eq / contains / not-contains", () => {
    expect(buildClause("name", "=", "a")).toBe("name='a'")
    expect(buildClause("name", "_cs=", "a")).toBe("name~'a'")
    expect(buildClause("name", "_ncs=", "a")).toBe("name!~'a'")
    expect(buildClause("name", "!=", "a")).toBe("name!='a'")
  })
  it("maps numeric comparisons (unquoted)", () => {
    expect(buildClause("views", ">", 5)).toBe("views>5")
    expect(buildClause("views", ">=", 5)).toBe("views>=5")
    expect(buildClause("views", "<", 5)).toBe("views<5")
    expect(buildClause("views", "<=", 5)).toBe("views<=5")
  })
  it("defaults unknown operators to contains", () => {
    expect(buildClause("name", "???", "a")).toBe("name~'a'")
  })
})

describe("escape", () => {
  it("escapes single quotes", () => {
    expect(escape("o'brien")).toBe("o\\'brien")
  })
})

describe("buildFilter", () => {
  const f = (field: string, operator: string, value: any) =>
    ({ column: { field }, operator, value } as any)

  it("joins multiple clauses with &&", () => {
    expect(
      buildFilter([f("status", "=", "Published"), f("views", ">", 5)])
    ).toBe("status='Published' && views>5")
  })
  it("skips empty/undefined values", () => {
    expect(buildFilter([f("a", "=", ""), f("b", "=", undefined)])).toBe("")
  })
  it("appends a search clause on the search field", () => {
    expect(buildFilter([], "hello", "name")).toBe("name~'hello'")
  })
})

describe("buildSort", () => {
  it("defaults to -created with no orderBy", () => {
    expect(buildSort(undefined, "asc")).toBe("-created")
  })
  it("prefixes - for desc", () => {
    expect(buildSort({ field: "views" }, "desc")).toBe("-views")
    expect(buildSort({ field: "views" }, "asc")).toBe("views")
  })
})

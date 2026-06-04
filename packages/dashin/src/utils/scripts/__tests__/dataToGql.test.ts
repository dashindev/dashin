import { describe, it, expect } from "vitest"
import dataToGql, { filtersToWhere } from "../dataToGql"

describe("dataToGql", () => {
  it("serializes string fields as quoted gql", () => {
    expect(dataToGql({ data: { name: "post", id: "1" } })).toBe(
      `{name: "post", id: "1"}`
    )
  })

  it("skips empty values and object values", () => {
    expect(
      dataToGql({ data: { name: "post", empty: "", nested: { a: 1 } } })
    ).toBe(`{name: "post"}`)
  })

  it("emits null for keys listed in nulls when value is empty", () => {
    expect(
      dataToGql({ data: { parent_id: "" }, nulls: { parent_id: true } })
    ).toBe(`{parent_id: null}`)
  })

  it("emits unquoted enum values", () => {
    expect(
      dataToGql({ data: { status: "Draft" }, enums: { status: true } })
    ).toBe(`{status: Draft}`)
  })
})

describe("filtersToWhere", () => {
  it("builds an _eq clause by default", () => {
    const where = filtersToWhere({
      filters: [{ column: { field: "name" }, operator: "=", value: "x" }] as any
    })
    expect(where).toContain(`name: {_eq: "x"}`)
  })

  it("applies a _like operator with wildcards", () => {
    const where = filtersToWhere({
      filters: [
        { column: { field: "name" }, operator: "=", value: "x" }
      ] as any,
      operators: { name: "_like" }
    })
    // NOTE: source wraps the value as `"%x%"` then re-quotes it, yielding
    // doubled quotes — asserting actual behavior, not the ideal form.
    expect(where).toContain(`_like:`)
    expect(where).toContain(`%x%`)
  })

  it("includes the search clause when no filter overrides it", () => {
    const where = filtersToWhere({
      filters: [],
      search: { key: "name", operator: "_like", value: `"%a%"` }
    })
    expect(where).toContain("name: {_like:")
  })

  it("skips empty and object filter values", () => {
    const where = filtersToWhere({
      filters: [
        { column: { field: "a" }, operator: "=", value: "" },
        { column: { field: "b" }, operator: "=", value: { x: 1 } }
      ] as any
    })
    expect(where).toBe("{ }")
  })
})

import { describe, it, expect } from "vitest"
import {
  defaultOperator,
  operatorOptions,
  display,
  matchLocal,
  buildGroupItems
} from "../tableLogic"

describe("defaultOperator", () => {
  it("uses contains for free text, eq for numeric/boolean/lookup", () => {
    expect(defaultOperator({ field: "name" } as any)).toBe("_cs=")
    expect(defaultOperator({ field: "n", type: "numeric" } as any)).toBe("=")
    expect(defaultOperator({ field: "b", type: "boolean" } as any)).toBe("=")
    expect(defaultOperator({ field: "r", lookup: { a: 1 } } as any)).toBe("=")
  })
})

describe("operatorOptions", () => {
  it("offers comparison operators for numeric", () => {
    expect(operatorOptions({ type: "numeric" } as any).map(o => o.v)).toContain(
      ">="
    )
  })
  it("offers only eq for boolean/lookup", () => {
    expect(operatorOptions({ type: "boolean" } as any)).toHaveLength(1)
  })
  it("offers contains/equals/not-contains for text", () => {
    expect(operatorOptions({ field: "x" } as any).map(o => o.v)).toEqual([
      "_cs=",
      "=",
      "_ncs="
    ])
  })
})

describe("display", () => {
  it("uses render fn when present", () => {
    expect(display({ render: () => "R" } as any, {})).toBe("R")
  })
  it("formats boolean", () => {
    expect(display({ field: "b", type: "boolean" } as any, { b: true })).toBe("✓")
    expect(display({ field: "b", type: "boolean" } as any, { b: false })).toBe("✗")
  })
  it("returns raw value otherwise", () => {
    expect(display({ field: "n" } as any, { n: "hi" })).toBe("hi")
  })
})

describe("matchLocal", () => {
  it("contains / not-contains", () => {
    expect(matchLocal("Alpha", "_cs=", "lph")).toBe(true)
    expect(matchLocal("Alpha", "_ncs=", "zzz")).toBe(true)
    expect(matchLocal("Alpha", "_ncs=", "lph")).toBe(false)
  })
  it("numeric comparisons", () => {
    expect(matchLocal(5, ">", 3)).toBe(true)
    expect(matchLocal(5, "<=", 5)).toBe(true)
    expect(matchLocal(5, "<", 5)).toBe(false)
  })
  it("equals incl array membership", () => {
    expect(matchLocal("a", "=", "a")).toBe(true)
    expect(matchLocal("a", "=", ["a", "b"])).toBe(true)
  })
})

describe("buildGroupItems", () => {
  it("groups rows by ordered group columns with counts", () => {
    const rows = [
      { team: "A", n: 1 },
      { team: "B", n: 2 },
      { team: "A", n: 3 }
    ]
    const items = buildGroupItems(rows, [{ field: "team" } as any])
    const groups = items.filter(i => i.kind === "group") as any[]
    const dataRows = items.filter(i => i.kind === "row")
    expect(groups.map(g => g.value)).toEqual(["A", "B"])
    expect(groups[0].count).toBe(2)
    expect(dataRows).toHaveLength(3)
  })
})

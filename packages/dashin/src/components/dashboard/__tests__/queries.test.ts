import { describe, it, expect } from "vitest"
import {
  totalsQuery,
  activeProductsQuery,
  newCustomersQuery,
  dailySalesQuery,
  statusBreakdownQuery,
  topCategoriesQuery,
  recentOrdersQuery,
  buildDayAxis,
  mergeDailySeries,
  computeDelta
} from "../queries"

// The D1 gateway guard rejects DDL / comments / multi-statements and only
// allows the four store tables — so the builders must stay plain SELECTs.
const ALLOWED = ["categories", "products", "customers", "orders"]
function assertGuardSafe(sql: string) {
  expect(sql.trim().toUpperCase().startsWith("SELECT")).toBe(true)
  expect(sql).not.toMatch(/;/) // single statement
  expect(sql).not.toMatch(/--|\/\*/) // no comments
  // every quoted "table" reference is allow-listed
  const tables = [...sql.matchAll(/"([a-z_]+)"/g)].map(m => m[1])
  for (const t of tables) expect(ALLOWED).toContain(t)
}

describe("dashboard query builders", () => {
  it("totalsQuery counts a table, parameter-free", () => {
    const q = totalsQuery("orders")
    expect(q.sql).toBe('SELECT COUNT(*) AS c FROM "orders"')
    expect(q.args).toEqual([])
    assertGuardSafe(q.sql)
  })

  it("activeProductsQuery filters by status", () => {
    const q = activeProductsQuery()
    expect(q.sql).toContain("status = 'active'")
    assertGuardSafe(q.sql)
  })

  it("newCustomersQuery binds a relative day offset", () => {
    const q = newCustomersQuery(30)
    expect(q.sql).toContain("date('now', ?)")
    expect(q.args).toEqual(["-30 days"])
    assertGuardSafe(q.sql)
  })

  it("dailySalesQuery groups by day and only sums paid/shipped revenue", () => {
    const q = dailySalesQuery(30)
    expect(q.sql).toContain("GROUP BY day")
    expect(q.sql).toContain("strftime('%Y-%m-%d', created_at)")
    expect(q.sql).toContain("status IN ('paid','shipped')")
    expect(q.args).toEqual(["-29 days"]) // inclusive window of `days`
    assertGuardSafe(q.sql)
  })

  it("statusBreakdownQuery groups orders by status", () => {
    const q = statusBreakdownQuery()
    expect(q.sql).toContain("GROUP BY status")
    assertGuardSafe(q.sql)
  })

  it("topCategoriesQuery joins products⋈categories with a bound limit", () => {
    const q = topCategoriesQuery(6)
    expect(q.sql).toContain('"products" p JOIN "categories" c')
    expect(q.sql).toContain("LIMIT ?")
    expect(q.args).toEqual([6])
    assertGuardSafe(q.sql)
  })

  it("recentOrdersQuery orders by id desc with a bound limit", () => {
    const q = recentOrdersQuery(5)
    expect(q.sql).toContain("ORDER BY id DESC")
    expect(q.args).toEqual([5])
    assertGuardSafe(q.sql)
  })
})

describe("buildDayAxis", () => {
  it("returns `days` ascending UTC dates ending at `end`", () => {
    const axis = buildDayAxis(new Date("2026-06-04T10:00:00Z"), 5)
    expect(axis).toEqual([
      "2026-05-31",
      "2026-06-01",
      "2026-06-02",
      "2026-06-03",
      "2026-06-04"
    ])
  })

  it("spans month boundaries correctly", () => {
    const axis = buildDayAxis(new Date("2026-03-01T00:00:00Z"), 2)
    expect(axis).toEqual(["2026-02-28", "2026-03-01"])
  })
})

describe("mergeDailySeries", () => {
  it("projects rows onto the axis, 0-filling gaps", () => {
    const axis = ["2026-06-01", "2026-06-02", "2026-06-03"]
    const rows = [
      { day: "2026-06-01", revenue: 100, orders: 2 },
      { day: "2026-06-03", revenue: 50, orders: 1 }
    ]
    expect(mergeDailySeries(rows, axis, "revenue")).toEqual([100, 0, 50])
    expect(mergeDailySeries(rows, axis, "orders")).toEqual([2, 0, 1])
  })
})

describe("computeDelta", () => {
  it("computes percentage change of last window vs prior window", () => {
    // prior 2 = [10,10]=20, last 2 = [15,15]=30 → +50%
    expect(computeDelta([10, 10, 15, 15], 2)).toEqual({ pct: 50, trend: "up" })
  })

  it("flags a decrease as down", () => {
    expect(computeDelta([20, 20, 5, 5], 2)).toEqual({ pct: -75, trend: "down" })
  })

  it("treats growth from zero prior as +100% up", () => {
    expect(computeDelta([0, 0, 5, 5], 2)).toEqual({ pct: 100, trend: "up" })
  })

  it("returns neutral when there is no movement", () => {
    expect(computeDelta([5, 5, 5, 5], 2)).toEqual({ pct: 0, trend: "neutral" })
  })

  it("is safe with insufficient history", () => {
    expect(computeDelta([5], 7).trend).toBe("up")
    expect(computeDelta([], 7)).toEqual({ pct: 0, trend: "neutral" })
  })
})

/**
 * Pure SQL builders + transforms for the e-commerce dashboard.
 *
 * Every builder returns a `{ sql, args }` statement understood by the
 * `@dashin-dev/source-d1` connector (and the D1 gateway Worker's guard: only
 * SELECT on the allow-listed tables, no DDL / comments / multi-statements).
 * Kept side-effect-free so they're unit-testable without a database.
 */

export interface Stmt {
  sql: string
  args: any[]
}

/** Statuses that count toward realised revenue. */
export const REVENUE_STATUSES = ["paid", "shipped"] as const

/** Colors for the order-status donut/legend (match the column status pills). */
export const STATUS_COLORS: Record<string, string> = {
  paid: "#22c55e",
  shipped: "#3b82f6",
  pending: "#f59e0b",
  cancelled: "#94a3b8"
}

// ── Row counts ───────────────────────────────────────────────
export const totalsQuery = (table: string): Stmt => ({
  sql: `SELECT COUNT(*) AS c FROM "${table}"`,
  args: []
})

export const activeProductsQuery = (): Stmt => ({
  sql: `SELECT COUNT(*) AS c FROM "products" WHERE status = 'active'`,
  args: []
})

export const newCustomersQuery = (days: number): Stmt => ({
  sql: `SELECT COUNT(*) AS c FROM "customers" WHERE created_at >= date('now', ?)`,
  args: [`-${days} days`]
})

// ── Daily orders + revenue over the last `days` days ─────────
// revenue counts only paid/shipped orders; orders counts every status.
export const dailySalesQuery = (days: number): Stmt => ({
  sql:
    "SELECT strftime('%Y-%m-%d', created_at) AS day, " +
    "COUNT(*) AS orders, " +
    "ROUND(COALESCE(SUM(CASE WHEN status IN ('paid','shipped') THEN total ELSE 0 END), 0), 2) AS revenue " +
    'FROM "orders" WHERE created_at >= date(\'now\', ?) GROUP BY day ORDER BY day',
  args: [`-${days - 1} days`]
})

// ── Order-status breakdown (all statuses) ────────────────────
export const statusBreakdownQuery = (): Stmt => ({
  sql: 'SELECT status, COUNT(*) AS c FROM "orders" GROUP BY status',
  args: []
})

// ── Top categories by product count (products ⋈ categories) ──
export const topCategoriesQuery = (limit: number): Stmt => ({
  sql:
    'SELECT c.name AS label, COUNT(*) AS value ' +
    'FROM "products" p JOIN "categories" c ON c.id = p.category_id ' +
    "GROUP BY p.category_id ORDER BY value DESC LIMIT ?",
  args: [limit]
})

// ── Latest orders for the activity list ──────────────────────
export const recentOrdersQuery = (limit: number): Stmt => ({
  sql:
    'SELECT id, customer_id, total, status, created_at ' +
    'FROM "orders" ORDER BY id DESC LIMIT ?',
  args: [limit]
})

// ── Pure transforms (testable without a DB) ──────────────────

/** UTC `YYYY-MM-DD` axis of the last `days` days ending at `end` (inclusive). */
export function buildDayAxis(end: Date, days: number): string[] {
  const DAY = 86_400_000
  const endUTC = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate())
  const axis: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    axis.push(new Date(endUTC - i * DAY).toISOString().slice(0, 10))
  }
  return axis
}

/** Project DB day-rows onto a continuous axis, 0-filling missing days. */
export function mergeDailySeries(
  rows: Array<Record<string, any>>,
  axis: string[],
  field: string
): number[] {
  const byDay = new Map<string, number>()
  for (const r of rows) byDay.set(String(r.day), Number(r[field]) || 0)
  return axis.map(d => byDay.get(d) ?? 0)
}

/**
 * Percentage change of the last `window` values vs the `window` before them.
 * Returns a rounded pct and a trend direction (for KPI deltas/sparkline color).
 */
export function computeDelta(
  values: number[],
  window: number
): { pct: number; trend: "up" | "down" | "neutral" } {
  if (values.length < window * 2) {
    // Not enough history for a clean prior period.
    const recent = values.slice(-window).reduce((s, v) => s + v, 0)
    return { pct: 0, trend: recent > 0 ? "up" : "neutral" }
  }
  const recent = values.slice(-window).reduce((s, v) => s + v, 0)
  const prior = values.slice(-window * 2, -window).reduce((s, v) => s + v, 0)
  if (prior === 0) return { pct: recent > 0 ? 100 : 0, trend: recent > 0 ? "up" : "neutral" }
  const pct = Math.round(((recent - prior) / prior) * 100)
  return { pct, trend: pct > 0 ? "up" : pct < 0 ? "down" : "neutral" }
}

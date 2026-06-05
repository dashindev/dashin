import { Column } from "./models/material-table-shim"
import { Stat } from "../regions/StatBand"

/** Minimal fetcher: the table's `data(query)` → we only read totalCount. */
export type CountFetch = (query: any) => Promise<{ totalCount: number }>

const PALETTE = ["#3366ff", "#00d68f", "#ffaa00", "#ff3d71", "#8b5cf6", "#22b8cf"]

const countQuery = (filters: any[] = []) => ({
  page: 0,
  pageSize: 1,
  search: "",
  orderDirection: "asc" as const,
  filters
})

const pct = (n: number, total: number) =>
  total > 0 ? `${((n / total) * 100).toFixed(1)}% of total` : "—"

/** "Posts (Cloudflare D1)" -> "Posts" */
const shortLabel = (title?: string) =>
  (title || "").replace(/\s*\(.*?\)\s*/g, "").trim()

/**
 * Compute real list-page stats from the table's own data source — no connector
 * change: one unfiltered count for the total, plus one filtered count per value
 * of the first enum/lookup column (the "status"-style field).
 *
 * - With an enum column: a Total card (with a distribution bar) + a card per
 *   value (count + % of total).
 * - Without one: just the Total card.
 * Returns null on error (band stays hidden).
 */
export async function computeStats<RowData extends object>(
  cols: Column<RowData>[],
  fetch: CountFetch,
  title?: string
): Promise<Stat[] | null> {
  try {
    const total = (await fetch(countQuery())).totalCount

    const enumCol = cols.find(
      c =>
        c.field &&
        c.lookup &&
        Object.keys(c.lookup).length >= 2 &&
        Object.keys(c.lookup).length <= 8
    )

    const totalLabel = `Total ${shortLabel(title) || "records"}`.trim()
    if (!enumCol || !enumCol.lookup) {
      return [{ label: totalLabel, value: total, trend: "neutral" }]
    }

    const entries = Object.entries(enumCol.lookup).slice(0, 6)
    const counts = await Promise.all(
      entries.map(async ([value, label]) => ({
        value,
        label: String(label),
        count: (
          await fetch(
            countQuery([{ column: { field: enumCol.field }, operator: "=", value }])
          )
        ).totalCount
      }))
    )

    const dist = counts
      .map((c, i) => ({ label: c.label, value: c.count, color: PALETTE[i % PALETTE.length] }))
      .filter(s => s.value > 0)

    const totalCard: Stat = {
      label: totalLabel,
      value: total,
      delta: `by ${enumCol.title || "category"}`,
      trend: "neutral",
      dist
    }

    const valueCards: Stat[] = counts.slice(0, 3).map((c, i) => ({
      label: c.label,
      value: c.count,
      delta: pct(c.count, total),
      trend: "neutral",
      dist: [
        { label: c.label, value: c.count, color: PALETTE[i % PALETTE.length] },
        { label: "other", value: Math.max(0, total - c.count), color: "var(--bn-border)" }
      ]
    }))

    return [totalCard, ...valueCards].slice(0, 4)
  } catch {
    return null
  }
}

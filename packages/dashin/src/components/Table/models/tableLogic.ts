import React from "react"
import { Column } from "./material-table-shim"

export type Dir = "asc" | "desc"
export type Editing<R> = {
  mode: "add" | "update"
  data: R
  original?: R
} | null

export type GroupItem<R> =
  | {
      kind: "group"
      key: string
      field: string
      value: any
      depth: number
      count: number
    }
  | { kind: "row"; key: string; row: R; index: number }

/** Default filter operator per column type (material-table parity). */
export function defaultOperator<R extends object>(c: Column<R>): string {
  if (c.type === "numeric") return "="
  if (c.type === "boolean") return "="
  if (c.lookup) return "="
  return "_cs=" // case-insensitive contains for free text
}

/** Operators offered in the filter row, by column type. */
export function operatorOptions<R extends object>(
  c: Column<R>
): { v: string; label: string }[] {
  if (c.type === "numeric")
    return [
      { v: "=", label: "=" },
      { v: "!=", label: "≠" },
      { v: ">", label: ">" },
      { v: ">=", label: "≥" },
      { v: "<", label: "<" },
      { v: "<=", label: "≤" }
    ]
  if (c.type === "boolean" || c.lookup) return [{ v: "=", label: "=" }]
  return [
    { v: "_cs=", label: "contains" },
    { v: "=", label: "equals" },
    { v: "_ncs=", label: "not contains" }
  ]
}

/** Map a status-ish value to pill color classes. */
function statusPillClass(value: string): string {
  const v = String(value).toLowerCase()
  if (/(publish|active|approved|success|done|complete)/.test(v))
    return "bg-success/15 text-success"
  if (/(pending|draft|review|waiting)/.test(v))
    return "bg-warning/15 text-warning"
  if (/(reject|error|failed|inactive|banned)/.test(v))
    return "bg-danger/15 text-danger"
  return "bg-primary/10 text-primary"
}

/** Display value for a cell (render fn, or typed formatting). */
export function display<R extends object>(col: Column<R>, row: R) {
  if (col.render) return col.render(row)
  const v = (row as any)[col.field as string]
  if (col.type === "boolean") return v ? "✓" : "✗"
  if ((col.type === "datetime" || col.type === "date") && v)
    return new Date(v).toLocaleString()
  // Lookup columns (status/category) render as colored pills (mockup-3).
  if ((col as any).lookup && v !== undefined && v !== null && v !== "") {
    const label = ((col as any).lookup[v] as string) ?? v
    return React.createElement(
      "span",
      {
        className: `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusPillClass(
          String(v)
        )}`
      },
      React.createElement("span", {
        className: "h-1.5 w-1.5 rounded-full bg-current opacity-70"
      }),
      String(label)
    )
  }
  return v as any
}

/** Local-data filtering predicate for a given operator. */
export function matchLocal(cell: any, operator: string, value: any): boolean {
  const s = String(cell ?? "").toLowerCase()
  const q = String(value ?? "").toLowerCase()
  switch (operator) {
    case "=":
      return Array.isArray(value)
        ? value.map(String).includes(String(cell))
        : s === q
    case "!=":
      return s !== q
    case ">":
      return Number(cell) > Number(value)
    case ">=":
      return Number(cell) >= Number(value)
    case "<":
      return Number(cell) < Number(value)
    case "<=":
      return Number(cell) <= Number(value)
    case "_ncs=":
      return !s.includes(q)
    case "_cs=":
    default:
      return s.includes(q)
  }
}

/**
 * Group rows by the ordered group columns into a flat list of render items
 * (group header rows interleaved with their data rows).
 */
export function buildGroupItems<R extends object>(
  rows: R[],
  groupCols: Column<R>[]
): GroupItem<R>[] {
  const out: GroupItem<R>[] = []
  const recurse = (
    subset: { row: R; index: number }[],
    depth: number,
    prefix: string
  ) => {
    if (depth >= groupCols.length) {
      subset.forEach(s =>
        out.push({ kind: "row", key: prefix, row: s.row, index: s.index })
      )
      return
    }
    const field = groupCols[depth].field as string
    const buckets = new Map<any, { row: R; index: number }[]>()
    subset.forEach(s => {
      const v = (s.row as any)[field]
      if (!buckets.has(v)) buckets.set(v, [])
      buckets.get(v)!.push(s)
    })
    buckets.forEach((items, value) => {
      const key = `${prefix}/${field}:${value}`
      out.push({ kind: "group", key, field, value, depth, count: items.length })
      recurse(items, depth + 1, key)
    })
  }
  recurse(rows.map((row, index) => ({ row, index })), 0, "")
  return out
}

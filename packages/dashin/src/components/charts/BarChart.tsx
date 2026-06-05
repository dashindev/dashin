import React from "react"

export interface BarDatum {
  label: string
  value: number
  /** optional per-bar color; falls back to the primary gradient */
  color?: string
}

export interface BarChartProps {
  data: BarDatum[]
  /** Format the value shown at the end of each bar. */
  format?: (n: number) => string
}

/**
 * Horizontal bar chart (no chart lib) — one row per datum, bar width
 * proportional to the max value. Token-styled; falls back to the primary
 * gradient when a datum has no explicit color.
 */
export default function BarChart({ data, format = n => String(n) }: BarChartProps) {
  if (!data || data.length === 0) {
    return <div className="py-6 text-sm text-icon-muted">No data.</div>
  }
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-foreground">{d.label}</span>
            <span className="text-icon-muted">{format(d.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-bn-border">
            <div
              className={d.color ? "" : "bg-primary-gradient"}
              style={{
                width: `${Math.max((d.value / max) * 100, 2)}%`,
                height: "100%",
                background: d.color || undefined
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

import React from "react"

/**
 * StatBand — optional KPI card band above content (mockup Image 2).
 * Pure presentational + data-driven: the layout decides IF it renders
 * (`LayoutConfig.statBand`), the caller supplies WHAT (stats). Token-styled.
 */
export interface Stat {
  label: string
  value: string | number
  /** optional trend text, e.g. "+12.5% from last month" */
  delta?: string
  /** trend direction → color */
  trend?: "up" | "down" | "neutral"
  /** optional lucide-style icon node */
  icon?: React.ReactNode
}

export interface StatBandProps {
  stats: Stat[]
}

const trendColor: Record<NonNullable<Stat["trend"]>, string> = {
  up: "text-success",
  down: "text-danger",
  neutral: "text-icon-muted"
}

export default function StatBand({ stats }: StatBandProps) {
  if (!stats || stats.length === 0) return null
  return (
    <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="bg-content-box border border-bn-border rounded-bn p-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <span className="text-sm text-icon-muted">{s.label}</span>
            {s.icon && <span className="text-primary">{s.icon}</span>}
          </div>
          <div className="mt-2 text-2xl font-semibold text-foreground">
            {s.value}
          </div>
          {s.delta && (
            <div className={`mt-1 text-xs ${trendColor[s.trend || "neutral"]}`}>
              {s.delta}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

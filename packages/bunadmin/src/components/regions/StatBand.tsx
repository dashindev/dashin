import React from "react"

/**
 * StatBand — optional KPI card band above content (mockups Image 2 & 3).
 * Pure presentational + data-driven: the layout decides IF it renders
 * (`LayoutConfig.statBand`), the caller supplies WHAT (stats). Token-styled,
 * with a gradient icon chip and an optional sparkline (mockup-3 look).
 */
export interface Stat {
  label: string
  value: string | number
  /** optional trend text, e.g. "35.2% of total" */
  delta?: string
  /** trend direction → sparkline/delta color */
  trend?: "up" | "down" | "neutral"
  /** optional lucide-style icon node (rendered in a gradient chip) */
  icon?: React.ReactNode
  /** optional sparkline data points (mockup-3 mini chart) */
  spark?: number[]
}

export interface StatBandProps {
  stats: Stat[]
}

const trendColor: Record<NonNullable<Stat["trend"]>, string> = {
  up: "text-success",
  down: "text-danger",
  neutral: "text-icon-muted"
}
const sparkStroke: Record<NonNullable<Stat["trend"]>, string> = {
  up: "var(--bn-success)",
  down: "var(--bn-danger)",
  neutral: "var(--bn-muted)"
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  if (!points || points.length < 2) return null
  const w = 96
  const h = 28
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p - min) / span) * h
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
  return (
    <svg width={w} height={h} className="mt-2 overflow-visible" aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
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
            {s.icon && (
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-bn bg-primary-gradient text-primary-foreground">
                {s.icon}
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-semibold text-foreground">
            {s.value}
          </div>
          {s.delta && (
            <div className={`mt-1 text-xs ${trendColor[s.trend || "neutral"]}`}>
              {s.delta}
            </div>
          )}
          {s.spark && (
            <Sparkline points={s.spark} color={sparkStroke[s.trend || "neutral"]} />
          )}
        </div>
      ))}
    </div>
  )
}

import React, { useId } from "react"

export interface TrendChartProps {
  /** Y values, oldest → newest. */
  points: number[]
  /** Optional X labels aligned to `points` (only first/last are drawn). */
  labels?: string[]
  height?: number
  /** Stroke/area color (defaults to the primary token). */
  color?: string
  /** Format a Y value for the hover title / peak label. */
  format?: (n: number) => string
}

/**
 * Hand-rolled area + line trend chart (no chart lib), styled with design
 * tokens. Scales to its container width via a viewBox; the area uses a soft
 * vertical gradient and the latest point is marked.
 */
export default function TrendChart({
  points,
  labels,
  height = 220,
  color = "var(--bn-primary, #6366f1)",
  format = n => String(n)
}: TrendChartProps) {
  const gid = useId().replace(/:/g, "")
  const W = 720
  const H = height
  const padX = 8
  const padY = 16

  if (!points || points.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-sm text-icon-muted"
        style={{ height }}
      >
        Not enough data yet.
      </div>
    )
  }

  const max = Math.max(...points)
  const min = Math.min(...points, 0)
  const span = max - min || 1
  const innerW = W - padX * 2
  const innerH = H - padY * 2

  const x = (i: number) => padX + (i / (points.length - 1)) * innerW
  const y = (v: number) => padY + innerH - ((v - min) / span) * innerH

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(" ")
  const area = `${line} L${x(points.length - 1).toFixed(1)},${(H - padY).toFixed(1)} L${x(0).toFixed(1)},${(H - padY).toFixed(1)} Z`

  const lastI = points.length - 1
  const peakI = points.indexOf(max)

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        role="img"
        aria-label="Trend chart"
      >
        <defs>
          <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* baseline */}
        <line
          x1={padX}
          y1={H - padY}
          x2={W - padX}
          y2={H - padY}
          stroke="var(--bn-border, #e5e7eb)"
          strokeWidth={1}
        />
        <path d={area} fill={`url(#area-${gid})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* peak + latest markers */}
        <circle cx={x(peakI)} cy={y(max)} r={3.5} fill={color} opacity={0.5} />
        <circle cx={x(lastI)} cy={y(points[lastI])} r={4} fill={color}>
          <title>{format(points[lastI])}</title>
        </circle>
      </svg>
      {labels && labels.length === points.length && (
        <div className="mt-1 flex justify-between text-[11px] text-icon-muted">
          <span>{labels[0]}</span>
          <span>{labels[lastI]}</span>
        </div>
      )}
    </div>
  )
}

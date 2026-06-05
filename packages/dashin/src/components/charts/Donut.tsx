import React from "react"

export interface DonutSegment {
  label: string
  value: number
  color: string
}

export interface DonutProps {
  data: DonutSegment[]
  size?: number
  thickness?: number
  /** Big number shown in the center (defaults to the segment total). */
  centerValue?: string | number
  centerLabel?: string
}

/**
 * Donut/ring chart (no chart lib) — each segment is a stroked circle arc drawn
 * with stroke-dasharray, rotated so segments sit end-to-end starting at 12
 * o'clock. Includes a centered total and a legend.
 */
export default function Donut({
  data,
  size = 168,
  thickness = 20,
  centerValue,
  centerLabel
}: DonutProps) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0)
  const r = (size - thickness) / 2
  const c = size / 2
  const circ = 2 * Math.PI * r

  let offset = 0
  const arcs = total > 0
    ? data
        .filter(d => d.value > 0)
        .map((d, i) => {
          const frac = d.value / total
          const seg = (
            <circle
              key={i}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${(frac * circ).toFixed(2)} ${(circ - frac * circ).toFixed(2)}`}
              strokeDashoffset={(-offset * circ).toFixed(2)}
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          )
          offset += frac
          return seg
        })
    : null

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} role="img" aria-label="Donut chart">
        {/* track */}
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--bn-border, #e5e7eb)"
          strokeWidth={thickness}
        />
        {/* rotate -90deg so the first arc starts at the top */}
        <g transform={`rotate(-90 ${c} ${c})`}>{arcs}</g>
        <text
          x={c}
          y={c - 2}
          textAnchor="middle"
          className="fill-foreground"
          style={{ fontSize: 22, fontWeight: 600 }}
        >
          {centerValue ?? total}
        </text>
        {centerLabel && (
          <text
            x={c}
            y={c + 16}
            textAnchor="middle"
            className="fill-icon-muted"
            style={{ fontSize: 11 }}
          >
            {centerLabel}
          </text>
        )}
      </svg>
      <ul className="space-y-1.5">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2 whitespace-nowrap text-sm">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="text-foreground">{d.label}</span>
            <span className="ml-auto pl-3 text-icon-muted">
              {d.value}
              {total > 0 ? ` · ${Math.round((d.value / total) * 100)}%` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

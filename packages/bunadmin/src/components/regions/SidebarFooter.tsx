import React from "react"
import { Stat } from "./StatBand"
import { SidebarFooter as SidebarFooterVariant } from "@/utils/themes/layouts"

/**
 * SidebarFooter — the left-menu footer slot. The layout selects the variant
 * ("upgrade" card vs "stats" widget vs "none", mockups Image 1 vs Image 2);
 * the caller supplies data. Pre-designed → professional by construction.
 */
export interface SidebarFooterProps {
  variant: SidebarFooterVariant
  /** for "upgrade" */
  upgrade?: { title: string; description?: string; cta?: string; onClick?: () => void }
  /** for "stats" */
  statsTitle?: string
  stats?: Stat[]
}

export default function SidebarFooter({
  variant,
  upgrade,
  statsTitle = "System Overview",
  stats = []
}: SidebarFooterProps) {
  if (variant === "none") return null

  if (variant === "stats") {
    if (stats.length === 0) return null
    return (
      <div className="m-3 p-3 rounded-bn border border-bn-border bg-content-box/40">
        <div className="text-sm font-medium text-foreground mb-2">{statsTitle}</div>
        <ul className="space-y-1.5">
          {stats.map((s, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="text-icon-muted">{s.label}</span>
              <span className="font-medium text-foreground">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // "upgrade"
  if (!upgrade) return null
  return (
    <div className="m-3 p-4 rounded-bn border border-bn-border bg-primary/5">
      <div className="text-sm font-semibold text-foreground">{upgrade.title}</div>
      {upgrade.description && (
        <p className="mt-1 text-xs text-icon-muted">{upgrade.description}</p>
      )}
      {upgrade.cta && (
        <button
          onClick={upgrade.onClick}
          className="mt-3 w-full rounded-bn bg-primary text-primary-foreground text-sm py-2 hover:opacity-90 transition-opacity"
        >
          {upgrade.cta}
        </button>
      )}
    </div>
  )
}

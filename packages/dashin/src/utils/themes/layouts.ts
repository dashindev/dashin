/**
 * Layout registry — the constrained "structure" axis of the admin design space.
 * The AI (or a user) SELECTS a layout id and toggles slot options; it never
 * writes layout code. Every combination is pre-designed, so the result is
 * professional by construction. Image 1 = Layout A baseline; Image 2 = Layout A
 * with the `statBand` region + `sidebarFooter: "stats"` + labeled buttons.
 */
export type SidebarFooter = "none" | "upgrade" | "stats"

export interface LayoutConfig {
  id: string
  name: string
  /** Optional KPI/stat-card band above content (Image 2). */
  statBand: boolean
  /** Left-menu footer slot variant. */
  sidebarFooter: SidebarFooter
  /** Show a top-level Dashboard nav entry. */
  dashboardNav: boolean
  /** Action button style. */
  buttons: "icon" | "labeled"
  /** Table row density. */
  density: "comfortable" | "compact"
  /**
   * Wrap page content in the white content-box card. Default (undefined/true)
   * suits tables; set false for self-carded pages like the dashboard so their
   * own cards sit on the page background instead of white-on-white.
   */
  contentCard?: boolean
}

export const LAYOUT_A: LayoutConfig = {
  id: "layout-a",
  name: "Classic",
  statBand: false,
  sidebarFooter: "upgrade",
  dashboardNav: false,
  buttons: "icon",
  density: "comfortable"
}

/** Registry of available layouts (currently one; designed to grow to N). */
export const layouts: Record<string, LayoutConfig> = {
  [LAYOUT_A.id]: LAYOUT_A
}

export const DEFAULT_LAYOUT_ID = LAYOUT_A.id

export function getLayout(id?: string): LayoutConfig {
  return (id && layouts[id]) || LAYOUT_A
}

const SIDEBAR_FOOTERS: SidebarFooter[] = ["none", "upgrade", "stats"]

/**
 * Validate a (partial) layout selection against the registry — the same
 * "constrained, validated contract" pattern as the AI schema generator.
 * Returns the resolved config or a list of errors.
 */
export function resolveLayout(
  input: Partial<LayoutConfig> & { id?: string }
): { ok: boolean; errors: string[]; layout: LayoutConfig } {
  const errors: string[] = []
  const base = input.id ? layouts[input.id] : LAYOUT_A
  if (input.id && !base) errors.push(`unknown layout id "${input.id}"`)
  if (input.sidebarFooter && !SIDEBAR_FOOTERS.includes(input.sidebarFooter))
    errors.push(`invalid sidebarFooter "${input.sidebarFooter}"`)
  if (input.buttons && !["icon", "labeled"].includes(input.buttons))
    errors.push(`invalid buttons "${input.buttons}"`)
  if (input.density && !["comfortable", "compact"].includes(input.density))
    errors.push(`invalid density "${input.density}"`)
  const layout = { ...(base || LAYOUT_A), ...input } as LayoutConfig
  return { ok: errors.length === 0, errors, layout }
}

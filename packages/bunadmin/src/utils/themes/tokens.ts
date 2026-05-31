/**
 * Design tokens — the single source of truth for bunadmin theming AND the
 * constrained, validated surface an AI "theme" command edits (set values, never
 * write CSS). The CSS variables in `tailwind.css` mirror these keys
 * (`:root` = light, `.dark` = dark); `tailwind.config.js` maps utility color
 * names to `var(--bn-*)`. Keep the three in sync.
 */
export interface ThemeTokens {
  bg: string // app background (content area)
  surface: string // cards / content boxes
  sidebar: string // left menu background
  foreground: string // primary text
  muted: string // muted text / icons
  border: string // hairlines / dividers
  primary: string // brand accent
  primaryForeground: string // text/icon on primary
  success: string
  warning: string
  danger: string
  radius: string // base corner radius
}

export const lightTokens: ThemeTokens = {
  bg: "#edf1f7",
  surface: "#ffffff",
  sidebar: "#ffffff",
  foreground: "#1f2937",
  muted: "#8f9bb3",
  border: "#e5e9f2",
  primary: "#3366ff",
  primaryForeground: "#ffffff",
  success: "#00d68f",
  warning: "#ffaa00",
  danger: "#ff1744",
  radius: "10px"
}

export const darkTokens: ThemeTokens = {
  bg: "#0a0e17",
  surface: "#121826",
  sidebar: "#0d1117",
  foreground: "#e5e7eb",
  muted: "#8f9bb3",
  border: "#1f2937",
  primary: "#6366f1",
  primaryForeground: "#ffffff",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#f43f5e",
  radius: "10px"
}

/** Token key -> CSS variable name (the contract the AI/theme writer targets). */
export const tokenCssVar: Record<keyof ThemeTokens, string> = {
  bg: "--bn-bg",
  surface: "--bn-surface",
  sidebar: "--bn-sidebar",
  foreground: "--bn-foreground",
  muted: "--bn-muted",
  border: "--bn-border",
  primary: "--bn-primary",
  primaryForeground: "--bn-primary-foreground",
  success: "--bn-success",
  warning: "--bn-warning",
  danger: "--bn-danger",
  radius: "--bn-radius"
}

/** Apply a (partial) token set as inline CSS variables at runtime. */
export function tokensToCssVars(tokens: Partial<ThemeTokens>): Record<string, string> {
  const out: Record<string, string> = {}
  ;(Object.keys(tokens) as (keyof ThemeTokens)[]).forEach(k => {
    const v = tokens[k]
    if (v !== undefined) out[tokenCssVar[k]] = v
  })
  return out
}

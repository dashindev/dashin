/**
 * Design tokens — the single source of truth for bunadmin theming AND the
 * constrained, validated surface an AI "theme" command edits (set values, never
 * write CSS). Presets are named (light+dark) token sets — the AI/user SELECTS a
 * preset and/or overrides individual tokens, all pre-designed. CSS variables in
 * `tailwind.css` mirror these keys (`:root` = light default, `.dark` = dark);
 * `tailwind.config.js` maps utility names to `var(--bn-*)`. Keep the three in sync.
 */
export interface ThemeTokens {
  bg: string // app background (content area)
  surface: string // cards / content boxes
  sidebar: string // left menu background
  foreground: string // primary text
  muted: string // muted text / icons
  border: string // hairlines / dividers
  primary: string // brand accent (solid)
  primaryGradient: string // brand accent (gradient — buttons/logo, mockup-3)
  primaryForeground: string // text/icon on primary
  success: string
  warning: string
  danger: string
  radius: string // base corner radius
}

/** "classic" — the original flat bunadmin look (mockup 1). */
export const classicLight: ThemeTokens = {
  bg: "#edf1f7",
  surface: "#ffffff",
  sidebar: "#ffffff",
  foreground: "#1f2937",
  muted: "#8f9bb3",
  border: "#e5e9f2",
  primary: "#3366ff",
  primaryGradient: "linear-gradient(135deg, #3366ff, #5b8def)",
  primaryForeground: "#ffffff",
  success: "#00d68f",
  warning: "#ffaa00",
  danger: "#ff1744",
  radius: "10px"
}

export const classicDark: ThemeTokens = {
  bg: "#0a0e17",
  surface: "#121826",
  sidebar: "#0d1117",
  foreground: "#e5e7eb",
  muted: "#8f9bb3",
  border: "#1f2937",
  primary: "#6366f1",
  primaryGradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  primaryForeground: "#ffffff",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#f43f5e",
  radius: "10px"
}

/** "modern" — the refined default (mockup 3): softer surfaces, indigo→violet
 * gradient brand, rounder corners, glow-friendly dark navy. */
export const modernLight: ThemeTokens = {
  bg: "#f8fafc",
  surface: "#ffffff",
  sidebar: "#ffffff",
  foreground: "#1e293b",
  muted: "#94a3b8",
  border: "#eef2f7",
  primary: "#6366f1",
  primaryGradient: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  primaryForeground: "#ffffff",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  radius: "12px"
}

export const modernDark: ThemeTokens = {
  bg: "#0a0e1a",
  surface: "#111729",
  sidebar: "#0a0e1a",
  foreground: "#e5e7eb",
  muted: "#64748b",
  border: "#1e293b",
  primary: "#818cf8",
  primaryGradient: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  primaryForeground: "#ffffff",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
  radius: "12px"
}

export interface ThemePreset {
  id: string
  name: string
  light: ThemeTokens
  dark: ThemeTokens
}

/** Registry of named theme presets (the AI/user selects one; grows over time). */
export const themePresets: Record<string, ThemePreset> = {
  classic: { id: "classic", name: "Classic", light: classicLight, dark: classicDark },
  modern: { id: "modern", name: "Modern", light: modernLight, dark: modernDark }
}

export const DEFAULT_PRESET = "modern"

export function getPreset(id?: string): ThemePreset {
  return (id && themePresets[id]) || themePresets[DEFAULT_PRESET]
}

// Default-preset aliases (the values mirrored as CSS-var defaults in tailwind.css).
export const lightTokens = themePresets[DEFAULT_PRESET].light
export const darkTokens = themePresets[DEFAULT_PRESET].dark

/** Token key -> CSS variable name (the contract the AI/theme writer targets). */
export const tokenCssVar: Record<keyof ThemeTokens, string> = {
  bg: "--bn-bg",
  surface: "--bn-surface",
  sidebar: "--bn-sidebar",
  foreground: "--bn-foreground",
  muted: "--bn-muted",
  border: "--bn-border",
  primary: "--bn-primary",
  primaryGradient: "--bn-primary-gradient",
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

/**
 * Apply a preset (+ mode + optional per-token overrides) to the document at
 * runtime: writes --bn-* vars on <html> and toggles the `.dark` class. This is
 * the single entrypoint a theme switcher OR a future `ai theme` command calls.
 * No-op outside the browser (SSR-safe).
 */
export function applyPreset(
  presetId?: string,
  mode: "light" | "dark" = "light",
  overrides: Partial<ThemeTokens> = {}
): void {
  if (typeof document === "undefined") return
  const preset = getPreset(presetId)
  const tokens = { ...(mode === "dark" ? preset.dark : preset.light), ...overrides }
  const root = document.documentElement
  const vars = tokensToCssVars(tokens)
  Object.keys(vars).forEach(k => root.style.setProperty(k, vars[k]))
  root.classList.toggle("dark", mode === "dark")
}

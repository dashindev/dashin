/**
 * Theme validation — THE MOAT for `ai theme`, mirroring the schema validator.
 * The LLM may only SELECT a known preset/mode and OVERRIDE known token keys with
 * valid CSS values. Anything else (invented tokens, bad colors, unknown preset)
 * is rejected. Keep KNOWN_* in sync with src/utils/themes/tokens.ts.
 */
const KNOWN_PRESETS = ["classic", "modern"]
const KNOWN_MODES = ["light", "dark"]
// ThemeTokens keys (tokens.ts)
const KNOWN_TOKENS = [
  "bg",
  "surface",
  "sidebar",
  "foreground",
  "muted",
  "border",
  "primary",
  "primaryGradient",
  "primaryForeground",
  "success",
  "warning",
  "danger",
  "radius"
]

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const FUNC = /^(rgb|rgba|hsl|hsla|linear-gradient|radial-gradient)\(.+\)$/i
const LEN = /^\d+(\.\d+)?(px|rem|em|%)$/

function isValidValue(key, value) {
  if (typeof value !== "string") return false
  if (key === "radius") return LEN.test(value.trim())
  return HEX.test(value.trim()) || FUNC.test(value.trim())
}

/** Validate a generated theme config. Returns { ok, errors[], theme }. */
function validateTheme(gen) {
  const errors = []
  const out = { preset: undefined, mode: undefined, overrides: {} }

  if (gen && gen.preset !== undefined) {
    if (!KNOWN_PRESETS.includes(gen.preset))
      errors.push(`unknown preset "${gen.preset}" (known: ${KNOWN_PRESETS.join(", ")})`)
    else out.preset = gen.preset
  }
  if (gen && gen.mode !== undefined) {
    if (!KNOWN_MODES.includes(gen.mode))
      errors.push(`invalid mode "${gen.mode}" (must be light|dark)`)
    else out.mode = gen.mode
  }
  const ov = (gen && gen.overrides) || {}
  if (typeof ov !== "object" || Array.isArray(ov)) {
    errors.push("`overrides` must be an object")
  } else {
    Object.keys(ov).forEach(k => {
      if (!KNOWN_TOKENS.includes(k)) {
        errors.push(`unknown token "${k}" — not a theme token`)
        return
      }
      if (!isValidValue(k, ov[k])) {
        errors.push(`invalid value for "${k}": ${JSON.stringify(ov[k])}`)
        return
      }
      out.overrides[k] = ov[k]
    })
  }

  // must do *something*
  if (!out.preset && !out.mode && Object.keys(out.overrides).length === 0 && errors.length === 0)
    errors.push("empty theme (no preset, mode, or valid overrides)")

  return { ok: errors.length === 0, errors, theme: out }
}

module.exports = { validateTheme, KNOWN_PRESETS, KNOWN_MODES, KNOWN_TOKENS }

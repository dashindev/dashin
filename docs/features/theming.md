# Theming

dashin's look is driven by **design tokens** — CSS variables for color, surface,
border, radius, and a gradient brand accent. Themes are **named presets** (each
with light + dark), and the AI can compose them ([`ai theme`](/ai/)).

## Tokens

Defined in `src/utils/themes/tokens.ts` and mirrored as CSS variables
(`:root` = light, `.dark` = dark), mapped into Tailwind utilities:

| Token | Utility | Meaning |
| --- | --- | --- |
| `--bn-bg` | `bg-content-bg` | app background |
| `--bn-surface` | `bg-content-box` | cards / content |
| `--bn-sidebar` | `bg-sidebar` | left menu / topbar |
| `--bn-foreground` | `text-foreground` | primary text |
| `--bn-muted` | `text-icon-muted` | muted text/icons |
| `--bn-border` | `border-bn-border` | hairlines |
| `--bn-primary` | `text/bg-primary` | brand accent |
| `--bn-primary-gradient` | `bg-primary-gradient` | gradient buttons/logo |
| `--bn-radius` | `rounded-bn` | corner radius |

## Presets & dark mode

Two built-in presets: `classic` (flat) and `modern` (default — softer surfaces,
indigo→violet gradient, glow-friendly dark). Switch at runtime:

```ts
import { applyPreset } from "@dashin-dev/dashin"
applyPreset("modern", "dark")              // preset + mode
applyPreset("modern", "light", { primary: "#7c3aed", radius: "16px" }) // + overrides
```

`applyPreset` writes the `--bn-*` variables and toggles the `.dark` class. The
TopBar theme toggle and `ai theme` both call it.

## AI theming

```bash
dashin ai theme "dark mode with a purple accent and rounded corners"
```

Emits a validated `{ preset, mode, overrides }` config for `applyPreset` — the AI
can only choose known presets/modes and override known tokens with valid CSS, so
the result is always on-brand. See [AI generation](/ai/).

# Changelog

## Unreleased

### Added
- **AI-assisted admin generation** (BYOK, validated): `bunadmin ai generate`
  (backend schema → validated table definition) and `bunadmin ai theme`
  (description → validated `{preset,mode,overrides}` theme). Providers:
  OpenAI-compatible / Anthropic / Ollama. See `docs/ai/README.md`.
- **Design-token system + theme presets** (`classic`, `modern` default) with
  light/dark via CSS variables; `applyPreset()` runtime entrypoint; theme toggle.
- **Slotted layout registry** + opt-in regions (KPI stat band with sparklines,
  sidebar footer) — a constrained, validated, AI-composable design space.
- **PocketBase** data-source + auth plugins; **Appwrite** data-source connector
  (`@dashin-dev/source-appwrite`).
- Pre-commit secret-scan hook (`scripts/pre-commit.sh`, install via
  `scripts/install-hooks.sh`).

### Changed
- Icons migrated from unmaintained `react-eva-icons` to **lucide-react** (via a
  drop-in `EvaIcon` adapter; topbar/selectors/repeater/file-explorer SVGs too).
- UI fully tokenized for dark mode; bunadmin-3 visual refresh (gradient brand,
  section headers, status pills).
- `@dashin-dev/dashin` no longer hard-depends on auth-local (loaded dynamically).

### Notes
- Test suite: 88 app + plugin/connector + AI validator tests.

## 1.6.0-beta.0

### BREAKING CHANGES — Migrated UI from Material-UI to Tailwind CSS

The entire UI layer has been migrated off Material-UI. All `@mui/*`, `@emotion/*`,
`formik-mui`, `material-table`, and `mui-tiptap` dependencies have been removed.

**Removed dependencies**
- `@mui/material`, `@mui/icons-material`, `@mui/lab`, `@mui/styles`
- `@emotion/react`, `@emotion/styled`
- `formik-mui`
- `material-table`
- `mui-tiptap` (rich-text-editor package)

**New stack**
- `tailwindcss` — styling (compiled via standalone CLI to `public/tailwind.out.css`,
  linked from `index.html`; Preflight enabled).
- `@headlessui/react` — accessible Dialog / Menu / Listbox / Combobox primitives.
- `@tiptap/react` — rich-text editor (replaces `mui-tiptap`).
- `notistack` upgraded `2.x` → `3.x` (MUI-free; `withSnackbar` HOC replaced by `useSnackbar`).

**What changed**
- All components, layouts, providers, plugins, and CLI scaffolding templates
  converted to Tailwind + Headless UI.
- `material-table` replaced by a lightweight in-house Tailwind table
  (`src/components/Table`) supporting filtering, search, column sort, inline
  add/edit/delete, selection, detail panel, row click, and pagination — for both
  local-array and remote (`query => QueryResult`) data.
- The `material-table` type surface (`Column`, `Query`, `QueryResult`,
  `EditComponentProps`, `Filter`, `Action`, etc.) is reproduced locally in
  `src/components/Table/models/material-table-shim.ts` and re-exported from
  `@dashin-dev/dashin`. Plugins importing these types from `material-table`
  must import them from `@dashin-dev/dashin` instead.
- `defaultTheme` is now a plain object (no `createTheme`); global base styles
  moved into `src/tailwind.css`.
- `config-overrides.js` transpiles the `@tanstack` ESM pulled in by
  `@headlessui/react` so CRA 4 can build it.

**Migration notes for plugin authors**
- Replace `import { Column } from "material-table"` with
  `import { Column } from "@dashin-dev/dashin"`.
- Column `filterComponent` / `editComponent` contracts are unchanged
  (`columnDef`, `onFilterChanged`, `editProps.{onChange,onRowDataChange}`).
- Some material-table-only features are not reimplemented: tree data, grouping,
  column drag, CSV export, and the bulk-edit grid.

### Known gaps
- Rich-text editor toolbar is minimal (bold / italic / headings).
- Pre-existing ESLint `array-callback-return` warnings remain (non-blocking).

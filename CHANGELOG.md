# Changelog

## Unreleased

### Added

- **`@dashin-dev/auth-payload`** — auth plugin for a Payload CMS backend
  (email/password → JWT, stored for `@dashin-dev/source-payload`). The Payload
  demo referenced this package but it didn't exist.

### Fixed

- **Production build crash** — the Vite template now sets
  `build.commonjsOptions.strictRequires`, so production builds no longer throw
  `Object.defineProperty called on non-object` (Rollup evaluating a CommonJS
  module before its exports object exists; the dev/esbuild path tolerated it).
- **Dev startup crash** — the template `pluginRegistry` excludes the CommonJS
  core package from the plugin-i18n `import.meta.glob`, fixing
  `exports is not defined` (core i18n init already runs via the optimized core
  bundle).
- **Template theme** — the template adopts the core token system
  (`tailwind.config` + `--bn-*` CSS variables, light/dark), so a freshly
  scaffolded app's shell renders fully styled (sidebar, borders, radius,
  gradient logo) and the theme toggle works.
- **`source-payload` double `/api`** — `apiBase()` strips a trailing `/api`
  from the configured base, so `VITE_MAIN_URL` set to either the origin or
  origin + `/api` works (no more `/api/api/…` and empty tables).
- **ESM plugin packages** — the plugin generator loads plugins via `require()`
  with a dynamic-import fallback, so ESM (not just CommonJS) plugin packages are
  supported.

### Docs

- Document `@dashin-dev/auth-payload`, the `VITE_MAIN_URL` = origin convention,
  and CORS in the Payload guide + demo; add Payload to the README backend list.

## 2.0.0-alpha.0

### BREAKING — Rebranded BunAdmin → Dashin (`@dashin-dev`)

The project is now **Dashin** (https://dashin.dev). All packages move to the
`@dashin-dev` npm scope, the CLI command becomes `dashin`, and `bunadmin`-named
conventions are renamed. This is a major, breaking change.

**Package renames**

| Old | New |
| --- | --- |
| `@xbuilder/bunadmin` | `@dashin-dev/dashin` |
| `@xbuilder/bunadmin-cli` | `@dashin-dev/cli` (bin: `dashin`) |
| `@xbuilder/bunadmin-source-*` | `@dashin-dev/source-*` |
| `@xbuilder/bunadmin-auth-*` | `@dashin-dev/auth-*` |
| `@xbuilder/bunadmin-upload-*` | `@dashin-dev/upload-*` |
| `@xbuilder/bunadmin-rich-text-editor` | `@dashin-dev/rich-text-editor` |
| `@xbuilder/bunadmin-auth-buncms` | **removed** |

**Conventions & runtime**
- CLI command `bunadmin` → `dashin` (`dashin new`, `dashin plugin`, `dashin schema`, `dashin ai …`).
- Plugin prefix `bunadmin-plugin-[team]-[group]` → `dashin-plugin-[team]-[group]`.
- Generated registry folder `src/.bunadmin/dynamic/` → `src/.dashin/dynamic/`.
- AI env vars `BUNADMIN_AI_*` → `DASHIN_AI_*`.
- Theme namespace `{ bunadmin: { … } }` / `theme.bunadmin` → `{ dashin: { … } }` / `theme.dashin`.
- Exported identifiers `BunadminFile*` → `DashinFile*`, `BunadminDatabase` → `DashinDatabase`.
- Default auth plugin → `@dashin-dev/auth-local`.
- Local IndexedDB name → `DashinDatabase` (**local browser data resets**; export via Data Migration first if you need it).
- `.env` files are now `.env.example` (gitignored real `.env`); `dashin new` materializes `.env` from the example.

**Migration**
1. Update dependencies to `@dashin-dev/*` and update all imports.
2. Replace CLI usage `bunadmin …` → `dashin …`; reinstall the CLI: `npm i -g @dashin-dev/cli`.
3. Rename custom plugin folders `bunadmin-plugin-*` → `dashin-plugin-*`.
4. In `.env`: point `VITE_AUTH_PLUGIN` to `@dashin-dev/auth-*`; rename `BUNADMIN_AI_*` → `DASHIN_AI_*`.
5. Update theme objects `{ bunadmin: … }` → `{ dashin: … }`.
6. Re-seed local data if needed (the IndexedDB name changed).

### Added
- **AI-assisted admin generation** (BYOK, validated): `dashin ai generate`
  (backend schema → validated table definition) and `dashin ai theme`
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
- UI fully tokenized for dark mode; dashin-3 visual refresh (gradient brand,
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

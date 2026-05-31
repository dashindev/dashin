# Changelog

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
  `@xbuilder/bunadmin`. Plugins importing these types from `material-table`
  must import them from `@xbuilder/bunadmin` instead.
- `defaultTheme` is now a plain object (no `createTheme`); global base styles
  moved into `src/tailwind.css`.
- `config-overrides.js` transpiles the `@tanstack` ESM pulled in by
  `@headlessui/react` so CRA 4 can build it.

**Migration notes for plugin authors**
- Replace `import { Column } from "material-table"` with
  `import { Column } from "@xbuilder/bunadmin"`.
- Column `filterComponent` / `editComponent` contracts are unchanged
  (`columnDef`, `onFilterChanged`, `editProps.{onChange,onRowDataChange}`).
- Some material-table-only features are not reimplemented: tree data, grouping,
  column drag, CSV export, and the bulk-edit grid.

### Known gaps
- Rich-text editor toolbar is minimal (bold / italic / headings).
- Pre-existing ESLint `array-callback-return` warnings remain (non-blocking).

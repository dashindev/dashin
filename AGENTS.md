# AGENTS.md

Guidelines for AI agents and contributors working in the Dashin monorepo.

## Project overview

Dashin is an open-source admin dashboard framework (React + Vite + Tailwind).
The monorepo uses **Yarn 1 workspaces** + **Lerna 9** for package management and publishing.
All publishable packages live under the `@dashin-dev` npm scope.

## Repo layout

```
packages/
  dashin/              # Core UI framework (the main app)
  dashin-cli/          # CLI scaffolding tool + project templates
  dashin-rich-text-editor/
  dashin-source-*/     # Data-source connectors (d1, strapi, supabase, etc.)
plugins/
  auth-*/              # Authentication plugins (local, strapi, payload, pocketbase)
  docs/                # Documentation plugin
  upload-strapi/       # File upload plugin
workers/
  d1-demo-api/         # Cloudflare Worker gateway for the live demo
```

## Build & dev

**Engine constraint:** `package.json` specifies `node >=20 <21`. On Node 22+, prefix
commands with `YARN_IGNORE_ENGINES=true` (bash) or `$env:YARN_IGNORE_ENGINES = "true"` (PowerShell).

```bash
# Build all packages (core first, then the rest in parallel)
yarn tsc:build

# Dev server (packages/dashin)
yarn dev               # starts Vite on localhost:1911

# Typecheck
yarn workspace @dashin-dev/dashin typecheck
```

**Important:** `yarn dev` loads zero plugins unless all library packages are built first.
Always run `yarn tsc:build` after a fresh clone or after changing any package outside `packages/dashin`.

## Testing

```bash
# Run all tests
cd packages/dashin && yarn test

# Run a specific test file
cd packages/dashin && yarn vitest run src/components/Table/__tests__/Table.test.tsx
```

Tests use **Vitest** + **jsdom**. The vitest config is inlined in `packages/dashin/vite.config.ts`.
Run tests from the `packages/dashin` directory — running from the workspace root can cause
module resolution issues.

## Releasing & publishing

Lerna manages versioning across all 18 `@dashin-dev` packages.
Current release line: `2.0.0-alpha.*` (pre-release).

### Before release

1. **Tests pass** — `cd packages/dashin && yarn test`
2. **Typecheck clean** — `yarn workspace @dashin-dev/dashin typecheck`
3. **Sync CLI templates** — check that `packages/dashin-cli/templates/` matches
   the core app's layout, env vars, and config. Templates drift silently.
4. **Bump template dependency versions** — update `@dashin-dev/*` versions in
   `packages/dashin-cli/templates/*/package.json` to the new release version.
5. **Check docs/READMEs** — env var names (`VITE_*`), package names (`@dashin-dev/*`),
   and CLI commands should reflect current state.

### Release steps

1. **Bump version** in `lerna.json` + all 18 `package.json` files.
   Use the Edit tool or `node -e` — **never** PowerShell `Set-Content` (see encoding warning below).
2. **Commit and push** — `git add -A && git commit -m "chore(release): X.Y.Z" && git push`
3. **Build** — `yarn tsc:build`
4. **Publish** — `npx lerna publish from-package --yes`

### After release

1. **Smoke-test the published packages** — in a temp directory, scaffold a fresh
   project with `npx @dashin-dev/cli@latest` (or install `@dashin-dev/dashin@<version>`
   manually), run `yarn install && yarn build`, and verify it works. Local builds
   hide registry-side breakage (missing files, wrong `main`/`exports`).
2. **Update the live demo** if the release includes demo-visible changes (see demo checklist below).

## File encoding

**Never use PowerShell `Set-Content` or `Out-File` to write JSON files** without explicit
`-Encoding utf8`. PowerShell 5.1 defaults to UTF-16 LE with BOM, which breaks Lerna and npm
JSON parsers. Prefer the Edit tool, `Write` tool, or `node -e` for JSON modifications.

## Environment variables

Dashin reads env vars prefixed with `VITE_*` (Vite's static replacement).
See `packages/dashin/.env.example` for the full list.

**Security:** Never commit account-specific values (Cloudflare account IDs, database IDs,
worker subdomains, API tokens) to tracked files. These belong in gitignored `.env.local`
or `wrangler.local.jsonc`.

## Design tokens

The UI uses Tailwind CSS with custom design tokens. Use these instead of raw colors:

- `bg-content-box` — card/panel background
- `bg-content-bg` — page background
- `bg-sidebar` — sidebar background
- `text-foreground` — primary text
- `text-icon-muted` — secondary/icon text
- `border-bn-border` — borders
- `rounded-bn` — standard border radius
- `bg-primary-gradient` — primary action gradient
- `shadow-bn` — standard box shadow

## Key components

### CrudTable

`@dashin-dev/dashin` exports `CrudTable` — a batteries-included component that wires
`<Table>` + `<DetailDrawer>` + the view/create/edit/delete state machine. Use it instead
of hand-rolling Table + drawer state in every plugin page:

```tsx
import { CrudTable, useTranslation } from "@dashin-dev/dashin"
import { dataCtrl, editableCtrl, bulkDeleteCtrl } from "@dashin-dev/source-d1"

export default function MyPage() {
  const { t } = useTranslation("table")
  return (
    <CrudTable
      title="My Entity"
      columns={columns}
      data={query => dataCtrl({ t, tableQuery: query, path: "my-table", searchField: "name" })}
      editable={editableCtrl({ t, SchemaName: "my-table" })}
      actions={[bulkDeleteCtrl({ SchemaName: "my-table", t, tableRef })]}
    />
  )
}
```

### DetailDrawer

Slide-out side panel for record view/create/edit. Supports `mode: "view" | "create" | "edit"`,
inline error banners via `formatError`, custom read-only renderers via column `renderDetail`,
and z-index stacking via `zBase`.

### UI primitives

All exported from `@dashin-dev/dashin`: `Button`, `Input`, `Select`, `Card`, `Badge`, `Avatar`,
`Modal`, `Tabs`, `Toggle`, `Tooltip`, `Dropdown`, `Textarea`, `Label`, `DatePicker`, `ImageEdit`.
These use the design tokens and support light/dark themes.

### RelatedPreview

Stacked related-record preview with nested editing — for showing associated records
(e.g. a customer's orders) inside the DetailDrawer.

### Source package helpers

Each `@dashin-dev/source-*` package exports `dataCtrl`, `editableCtrl`, `bulkDeleteCtrl`
for wiring `CrudTable`. The Payload source also exports `errMessage`, `mediaUrl`,
`photoThumb`, `photoLarge`, `uploadMedia`, and `payloadCrud`/`payloadCollection` bindings.

## CLI templates

`packages/dashin-cli/templates/` contains starter project templates (Vite, Next.js).
When changing the core app's layout, config, or env vars, check whether the templates
need a matching update — they drift easily.

## Demo deployment

The live demo at `demo.dashin.dev` has two independently deployed parts:
- **Frontend:** Cloudflare Workers Builds (auto-deploys on push to `master` via the domain account's GitHub connection)
- **Backend:** `workers/d1-demo-api` — a Cloudflare Worker + D1 database (manual deploy)

### When to update the demo

- **Frontend changes** (UI, layout, plugins, env config): auto-deployed on push — no action needed.
- **Backend changes** (schema, seed data, API logic in `workers/d1-demo-api/`): requires manual deploy.
- **Both** (e.g. new entity tables + matching plugins): deploy backend first, then push frontend.

### Backend deploy steps

1. **Test locally first** — `cd workers/d1-demo-api && wrangler dev --local`, then curl endpoints.
2. **Deploy** — `gh workflow run deploy-d1-demo.yml` (GitHub Actions, uses repo secrets for auth).
   The workflow runs `wrangler deploy` and optionally reseeds if `GATEWAY_URL` + `RESET_TOKEN` secrets are set.
3. **Verify** — hit the live gateway URL and confirm the API returns expected data.

### After demo update

1. **Check demo.dashin.dev** — load the site, verify sidebar navigation, entity tables,
   and any dashboard/landing page render correctly.
2. **Test CRUD** if schema changed — create, edit, delete a record through the UI.
3. **Check both themes** — light and dark mode should both render correctly.

### Demo security notes

- Account-specific values (account ID, D1 database ID, worker subdomain, API tokens)
  live in **GitHub repo secrets** for CI and in **gitignored** `.env.local` / `wrangler.local.jsonc`
  for local dev. Never commit these to tracked files.

## CI

GitHub Actions (`.github/workflows/ci.yml`) is **manual-only** — trigger via the Actions tab
or `gh workflow run ci.yml`. It does not run automatically on push/PR to avoid spend.

Jobs:
- **build-test:** `yarn tsc:build` → typecheck → unit tests → production build
- **e2e:** Playwright end-to-end smoke tests
- **template-smoke:** scaffold the Vite template against locally-packed tarballs, run `vite build`,
  headless-load the preview — catches prod-only regressions (CJS init crashes, missing i18n globs, unstyled shell)

Run CI before merging significant changes. For trivial fixes (typos, docs), it's optional.

## PR conventions

- Keep PRs focused; one concern per PR
- Verified PRs can be merged to `master` immediately (no separate approval wait)
- Commit messages: conventional commits style (`fix:`, `feat:`, `chore:`, etc.)
- **Stacked PRs:** if a PR targets another feature branch (not `master`), merging it
  only lands code on that branch. After the full stack is reviewed, merge the **top**
  branch into `master` to land all accumulated work. Always check `baseRefName` before
  assuming a "merged" PR is on `master`.

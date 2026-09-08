# Deploying the docs (Cloudflare Pages)

The docs site is a standalone [VitePress](https://vitepress.dev) project in
`docs/`. It is **not** part of the yarn workspace — it has its own
`package.json` + `package-lock.json` and is built with `npm`.

Hosting: **Cloudflare Pages** (Git integration). CF builds and deploys on every
push to `master`. No GitHub secrets or workflow required.

## One-time setup (Cloudflare dashboard)

1. **Workers & Pages → Create → Pages → Connect to Git** → pick
   `dashindev/dashin`.
2. Set the build configuration:

   | Setting                   | Value              |
   | ------------------------- | ------------------ |
   | Production branch         | `master`           |
   | Framework preset          | `VitePress`        |
   | Root directory            | `docs`             |
   | Build command             | `npm run build`    |
   | Build output directory    | `.vitepress/dist`  |

   Node version is pinned by `docs/.node-version` (20). Because
   `docs/package-lock.json` is committed, CF installs with `npm ci`
   (deterministic).

3. **Save and Deploy.** First build lands at `https://<project>.pages.dev`.

## Custom domain (dashin.dev)

Pages → your project → **Custom domains → Set up a domain** → `dashin.dev`
(and optionally `www`). If the domain's DNS is already on Cloudflare it's a
one-click CNAME + automatic SSL.

> `cleanUrls: true` (extensionless URLs) is set in `.vitepress/config.ts` and
> is served natively by Cloudflare Pages — no redirect rules needed.

## Local

```
cd docs
npm ci
npm run dev      # http://localhost:5174
npm run build    # outputs .vitepress/dist
npm run preview
```

---

# Deploying the demo app (Cloudflare Workers — static assets)

The **demo** is the Dashin admin SPA (`packages/dashin`) built with the default
`auth-local` plugin — **fully self-contained**: no backend, login `admin` /
`dashin`, sample data seeded into the browser (IndexedDB). It's a separate
Cloudflare project from the docs (suggested domain: `demo.dashin.dev`).

Because it's a yarn-workspace build (not a single VitePress folder), the
account's "Build output directory" field doesn't fit — use the committed
[`wrangler.demo.jsonc`](https://github.com/dashindev/dashin/blob/master/wrangler.demo.jsonc), which declares the output via
`assets.directory`.

## One-time setup (Cloudflare dashboard)

Create a **second** Workers project from the same repo:

| Setting | Value |
| --- | --- |
| Production branch | `master` |
| Root directory | *(repo root)* |
| Build command | `yarn tsc:build && yarn workspace @dashin-dev/dashin build` |
| Deploy command | `npx wrangler deploy -c wrangler.demo.jsonc` |

`yarn tsc:build` builds all plugin `lib/` (the Vite plugin generator needs them)
**before** `vite build`. Node is pinned to 20 by the repo-root `.node-version`.
Then add the custom domain **`demo.dashin.dev`**.

## Local

```
yarn install
yarn tsc:build && yarn workspace @dashin-dev/dashin build   # -> packages/dashin/dist
npx wrangler deploy -c wrangler.demo.jsonc                  # or: serve packages/dashin/dist
```

> The sidebar's **Local** section works fully offline. The **Blog** / **Remote**
> sections expect a live connector backend — to show only the offline-working
> parts in the public demo, set `VITE_IGNORED_PLUGINS` at build time (follow-up).

---

# Publishing NPM Packages (@dashin-dev/*)

Dashin publishes 23 scoped packages under `@dashin-dev/*`.

## Prerequisites

1. Ensure unit tests pass: `yarn test` (from `packages/dashin`).
2. Verify TypeScript type checking: `yarn workspace @dashin-dev/dashin typecheck`.
3. Build all packages: `yarn tsc:build`.

## WebAuthn 2FA Publishing (Security Key / Biometrics)

If your npm account uses hardware security keys (FIDO2 / WebAuthn) without a TOTP authenticator app, direct subshell execution fails with `EOTP` because non-interactive pipes suppress browser prompts.

Use the built-in runner:

```bash
# 1. Establish web login session (1st browser confirmation)
npm login --auth-type=web

# 2. Batch publish with automated WebAuth detection (2nd browser confirmation)
yarn release:publish
```

`yarn release:publish` invokes `scripts/npm-publish-web.js --all`, which:
- Verifies registry versions and skips already-published packages.
- Enables TTY simulation so npm's `otplease` activates browser authorization.
- Automatically captures `https://www.npmjs.com/auth/cli/<guid>` and opens it in your default browser.
- Once approved on the webpage, automatically publishes all remaining packages with zero extra prompts.

## Automation Token / CI

For automated CI environments configured with `NODE_AUTH_TOKEN`:

```bash
npx lerna publish from-package --yes
```


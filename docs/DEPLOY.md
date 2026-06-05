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

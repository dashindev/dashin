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

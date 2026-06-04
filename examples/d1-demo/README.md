# dashin Demo (Cloudflare D1) — 100% free, all-Cloudflare

Run a real database-backed Dashin admin **entirely on Cloudflare's free tier**:

```
browser (Dashin + @dashin-dev/source-d1)   ->  Cloudflare Pages   (free)
        │  POST /query
        ▼
   d1-demo-api Worker  ->  Cloudflare D1     (Workers + D1 free tier)
```

Unlike PocketBase / Strapi / Payload (stateful servers that can't run on
Cloudflare), **D1 is serverless SQLite** — so there's nothing to host and no
recurring cost.

## 1. Deploy the gateway Worker + D1

See [`workers/d1-demo-api`](../../workers/d1-demo-api):

```bash
cd workers/d1-demo-api && npm install
npx wrangler d1 create dashin-demo                      # paste database_id into wrangler.jsonc
npx wrangler d1 execute dashin-demo --remote --file=schema.sql
npx wrangler deploy                                     # -> https://<worker>.workers.dev
curl -X POST https://<worker>.workers.dev/reset         # seed
```

The Worker also re-seeds every 30 min (cron), so a public demo never drifts.

## 2. Point a Dashin admin at it

```bash
dashin new my-admin && cd my-admin
```

`.env`:
```
VITE_AUTH_PLUGIN=@dashin-dev/auth-local   # client-side login (admin / dashin)
VITE_MAIN_URL=https://<worker>.workers.dev
```

Drop [`example-admin.tsx`](./example-admin.tsx) into a plugin (a `posts` table),
`yarn dev`, and you have a working D1-backed admin — create / edit / delete,
filter, sort, paginate.

## Why credentials can't be changed

Auth is the **client-side `auth-local`** plugin: each visitor logs in locally
(`admin` / `dashin`), so there's no shared server account to change. Data lives
in D1 and resets on the cron.

## Local development

Run the Worker locally (`wrangler dev` + `--local` D1) and set
`VITE_MAIN_URL=http://127.0.0.1:8787`. See the Worker README.

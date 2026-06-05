# dashin-d1-demo-api — Cloudflare D1 gateway for the Dashin demo

A tiny Worker that exposes a Cloudflare **D1** database over HTTP so the
browser-side [`@dashin-dev/source-d1`](../../packages/dashin-source-d1) connector
can run its parameterised SQL. It also resets the demo data on a schedule.

This is what makes a **100%-free, all-Cloudflare** Dashin demo possible: D1
(free tier) + Workers (free tier) + Pages for the frontend (free tier).

## API

| Route | Body | Returns |
|-------|------|---------|
| `POST /query` | `{ sql, args }` | `{ rows, rowsAffected }` or `{ error }` |
| `POST /reset` | — (Bearer `RESET_TOKEN`) | `{ ok: true }` — re-seed now |
| `GET /health` | — | `{ ok: true }` |

**Safety / anti-abuse (this is a public, write-enabled API):**
- **Per-IP rate limit** — `RATE_LIMITER` binding, 30 POSTs / 10s per client IP (429 over that). Caps request floods; Cloudflare's automatic DDoS protection covers volumetric attacks.
- **SQL guard** — only `SELECT/INSERT/UPDATE/DELETE` on the allow-listed store tables (`categories`, `products`, `customers`, `orders`); no DDL, multi-statements or comments; statement length ≤ 2000; an oversized literal `LIMIT` (> 200) is rejected; ≤ 64 bound args.
- **Write cap** — `INSERT` is refused once a table hits 500 rows, so storage / the D1 write budget can't be inflated.
- **`/reset` requires `RESET_TOKEN`** (Bearer); the cron resets without it.
- **30-min re-seed cron** reverts any change.
- **No server credentials** — login is the client-side `auth-local` plugin.

> Cost: keep the account on the **Workers Free plan** and there is no overage
> billing — abuse just hits daily limits and is throttled, never charged. The
> caps above keep usage well inside the free tier in normal operation.

## Deploy (your Cloudflare account)

Keep your account-specific `database_id` **out of git** — put it in a gitignored
`wrangler.local.jsonc` and pass `-c` on every remote command:

```bash
cd workers/d1-demo-api
npm install

npx wrangler d1 create dashin-demo                 # note the database_id
cp wrangler.jsonc wrangler.local.jsonc             # gitignored; put your real id here
npx wrangler d1 execute dashin-demo --remote --file=schema.sql -c wrangler.local.jsonc
npx wrangler secret put RESET_TOKEN -c wrangler.local.jsonc   # required — gates POST /reset
npx wrangler deploy -c wrangler.local.jsonc
curl -X POST https://<worker-url>/reset -H "Authorization: Bearer <token>"   # initial seed
```

Then point the Dashin demo frontend at the Worker URL via `VITE_MAIN_URL`
(set it in the frontend's gitignored `.env.local`, not in any committed file).

## Local development

```bash
npm install
npx wrangler d1 execute dashin-demo --local --file=schema.sql   # create local tables
npx wrangler dev                                                # http://localhost:8787
curl -X POST localhost:8787/reset                               # seed (no token locally)
curl -X POST localhost:8787/query -d '{"sql":"SELECT * FROM \"orders\" LIMIT 5","args":[]}'
```

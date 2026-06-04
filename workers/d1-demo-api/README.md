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

**Safety (public demo):** `/query` only allows `SELECT/INSERT/UPDATE/DELETE` on the
demo tables (`posts`, `products`); DDL, multi-statements and comments are rejected.
The `scheduled` cron (`*/30 * * * *`, in `wrangler.jsonc`) re-seeds every 30 min, so
any visitor edits revert. There are **no server credentials** — the demo logs in
via the client-side `auth-local` plugin.

## Deploy (your Cloudflare account)

```bash
cd workers/d1-demo-api
npm install

npx wrangler d1 create dashin-demo          # paste database_id into wrangler.jsonc
npx wrangler d1 execute dashin-demo --remote --file=schema.sql
npx wrangler secret put RESET_TOKEN          # optional, gates /reset
npx wrangler deploy
curl -X POST https://<worker-url>/reset -H "Authorization: Bearer <token>"   # initial seed
```

Then point the Dashin demo frontend at the Worker URL via `VITE_MAIN_URL`.

## Local development

```bash
npm install
npx wrangler d1 execute dashin-demo --local --file=schema.sql   # create local tables
npx wrangler dev                                                # http://localhost:8787
curl -X POST localhost:8787/reset                               # seed (no token locally)
curl -X POST localhost:8787/query -d '{"sql":"SELECT * FROM \"posts\"","args":[]}'
```

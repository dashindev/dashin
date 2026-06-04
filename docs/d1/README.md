# Cloudflare D1

Run Dashin **100% free on Cloudflare** with a real SQL database.
[`@dashin-dev/source-d1`](https://github.com/dashindev/dashin/tree/master/packages/dashin-source-d1)
is a data-source connector for **Cloudflare D1** (serverless SQLite).

Because D1 is reachable only through a Worker binding, the connector talks to a
tiny gateway Worker that runs its (parameterised, injection-safe) SQL on D1:

```
browser (source-d1)  ──POST /query {sql,args}──▶  Worker  ──▶  Cloudflare D1
```

This is what makes an all-Cloudflare-free demo possible — Pages (frontend) +
Workers + D1 are all on free tiers. Servers like PocketBase / Strapi / Payload
can't run on Cloudflare; D1 can.

## Setup

1. **Deploy the gateway Worker + database** —
   [`workers/d1-demo-api`](https://github.com/dashindev/dashin/tree/master/workers/d1-demo-api):

   ```bash
   cd workers/d1-demo-api && npm install
   npx wrangler d1 create dashin-demo                     # → paste database_id into wrangler.jsonc
   npx wrangler d1 execute dashin-demo --remote --file=schema.sql
   npx wrangler deploy
   curl -X POST https://<worker>.workers.dev/reset        # seed
   ```

2. **Point your admin at it** (`.env`):

   ```
   VITE_AUTH_PLUGIN=@dashin-dev/auth-local
   VITE_MAIN_URL=https://<worker>.workers.dev
   ```

3. **Add a table** — import the connector in a plugin:

   ```tsx
   import { dataCtrl, editableCtrl, bulkDeleteCtrl } from "@dashin-dev/source-d1"

   <Table
     columns={columns({ t })}
     data={query => dataCtrl({ t, tableQuery: query, path: "posts" })}
     editable={editableCtrl({ t, SchemaName: "posts" })}
     actions={[bulkDeleteCtrl({ SchemaName: "posts", t, tableRef })]}
   />
   ```

   See the full [d1-demo example](https://github.com/dashindev/dashin/tree/master/examples/d1-demo).

## Public-demo safety

The gateway Worker is hardened for public exposure:

- **Per-IP rate limit** (30 POSTs / 10s) + Cloudflare's automatic DDoS protection.
- **SQL guard** — only `SELECT/INSERT/UPDATE/DELETE` on the demo tables; no DDL /
  multi-statements / comments; bounded length; `SELECT` must carry a small `LIMIT`.
- **Write cap** — `INSERT` is refused past 500 rows, so storage can't be inflated.
- **`/reset` is token-gated**; the cron **re-seeds every 30 min**, reverting edits.
- Auth is client-side `auth-local`, so there are **no server credentials** to change.

On the **Workers Free plan** there is no overage billing — abuse is throttled, not
charged.

## How it differs from the Turso connector

Both are SQLite-over-HTTP and share the same SQL builders. Turso speaks the
libSQL `/v2/pipeline` protocol directly; D1 goes through your Worker's simple
`POST /query` — which also lets the Worker enforce the safety rules above.

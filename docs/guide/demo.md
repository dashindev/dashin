# Flagship Demo

Boot a real backend, seed data, and generate a working admin — in minutes. The
runnable demo lives in [`examples/pocketbase-demo`](https://github.com/Chris533/dashin/tree/master/examples/pocketbase-demo).

Runnable demos exist for every connector — pick your backend:

| Backend | Example | Start |
| --- | --- | --- |
| PocketBase | [`examples/pocketbase-demo`](https://github.com/Chris533/dashin/tree/master/examples/pocketbase-demo) | `./start.sh` |
| Payload + SQLite | [`examples/payload-demo`](https://github.com/Chris533/dashin/tree/master/examples/payload-demo) | `./start.sh` |
| Supabase / Postgres | [`examples/supabase-demo`](https://github.com/Chris533/dashin/tree/master/examples/supabase-demo) | `./start.sh` |
| Appwrite | [`examples/appwrite-demo`](https://github.com/Chris533/dashin/tree/master/examples/appwrite-demo) | `./start.sh` |
| Directus | [`examples/directus-demo`](https://github.com/Chris533/dashin/tree/master/examples/directus-demo) | `docker compose up -d` |
| Turso / libSQL | [`examples/turso-demo`](https://github.com/Chris533/dashin/tree/master/examples/turso-demo) | `./start.sh` |

## One command

```bash
cd examples/pocketbase-demo
./start.sh
```

Downloads PocketBase, creates an admin, serves it on `http://127.0.0.1:8090`, and
seeds demo collections (`posts`, `products`) + a `demo` user.

> Docker alternative: `docker compose up -d` then `node ../../docs/pocketbase/seed.js`.

## Generate the admin

```bash
bunadmin new my-admin && cd my-admin
# .env: VITE_AUTH_PLUGIN=@dashin-dev/auth-pocketbase, VITE_AUTH_URL=http://127.0.0.1:8090
export DASHIN_AI_PROVIDER=openai DASHIN_AI_API_KEY=sk-... DASHIN_AI_MODEL=gpt-4o-mini
bunadmin ai generate --url http://127.0.0.1:8090 --collection posts --token <admin-token>
yarn dev
```

Sign in as `demo` / `bunadmin123`. See the [AI guide](/ai/) for the full flow,
including `ai theme` and `ai refine`.

### Flagship example (no AI key)

The PocketBase demo ships drop-in files that exercise the **plugin-level**
features: `example-admin.tsx` (posts — filtering, inline CRUD, **bulk delete**,
status-pill lookup, custom `render`), `example-products.tsx` (a second schema),
and `example-menu.ts` (registers both as a **multi-level menu**: Blog → Posts +
Products).

The surrounding shell — **KPI stat band**, modern layout, **dark-mode toggle**,
i18n, dynamic routing — is added automatically by `bunadmin new` on every list
view, so it needs no code in these files.

## Credentials (PocketBase)
- PocketBase admin: `admin@bunadmin.test` / `bunadmin123`
- Demo user (app login): `demo` / `bunadmin123`

---

## Payload CMS + SQLite

A second demo uses [Payload CMS](https://payloadcms.com) with SQLite — no external
database required.

```bash
cd examples/payload-demo
./start.sh
```

Scaffolds Payload, installs deps, seeds `posts` and `products` collections, and
serves on `http://127.0.0.1:3001`.

> Docker alternative: `docker compose up -d`

### Generate the admin

```bash
bunadmin new my-admin && cd my-admin
# .env: VITE_AUTH_PLUGIN=@dashin-dev/auth-payload, VITE_AUTH_URL=http://127.0.0.1:3001
export DASHIN_AI_PROVIDER=openai DASHIN_AI_API_KEY=sk-... DASHIN_AI_MODEL=gpt-4o-mini
bunadmin ai generate --url http://127.0.0.1:3001 --collection posts --token <admin-token>
yarn dev
```

Or drop in the pre-built [`example-admin.tsx`](https://github.com/Chris533/dashin/tree/master/examples/payload-demo/example-admin.tsx) — no AI key needed.

### Credentials (Payload)
- Payload admin: `admin@bunadmin.test` / `bunadmin123`

---

## Supabase / Postgres

Local Supabase stack (via the Supabase CLI + Docker) with seeded `posts` and
`products` tables.

```bash
cd examples/supabase-demo
./start.sh
```

Studio runs at `http://127.0.0.1:54323`, the API at `http://127.0.0.1:54321`. The
script prints the anon key to use in `.env`.

```
VITE_AUTH_PLUGIN=@dashin-dev/auth-supabase
VITE_MAIN_URL=http://127.0.0.1:54321
VITE_SUPABASE_KEY=<anon-key>
```

> Stop with `npx supabase stop`.

---

## Appwrite

Self-hosted Appwrite via Docker.

```bash
cd examples/appwrite-demo
./start.sh
```

Serves the console on `http://127.0.0.1:8080`. Create a project + database +
`posts` collection in the console (one-time), then:

```
VITE_AUTH_PLUGIN=@dashin-dev/auth-appwrite
VITE_AUTH_URL=http://127.0.0.1:8080
VITE_APPWRITE_PROJECT=<your-project-id>
VITE_APPWRITE_DATABASE=<your-database-id>
```

> Appwrite rows use `$id`. Stop with `docker compose down`.

---

## Directus

Self-hosted Directus (SQLite-backed) via Docker.

```bash
cd examples/directus-demo
docker compose up -d
```

Serves on `http://127.0.0.1:8055`. Create a `posts` collection in the data studio
(one-time), then:

```
VITE_AUTH_PLUGIN=@dashin-dev/auth-directus
VITE_MAIN_URL=http://127.0.0.1:8055
```

### Credentials (Directus)
- Directus admin: `admin@bunadmin.test` / `bunadmin123`

---

## Turso / libSQL

Local libSQL server (`sqld`) over SQLite, seeded with `posts` and `products`.

```bash
cd examples/turso-demo
./start.sh
```

Serves the libSQL HTTP protocol on `http://127.0.0.1:8080`.

```
VITE_AUTH_PLUGIN=@dashin-dev/auth-local
VITE_MAIN_URL=http://127.0.0.1:8080
```

> For hosted Turso, point `VITE_MAIN_URL` at your `*.turso.io` URL and sign in
> with a DB auth token.

Each demo ships a pre-built `example-admin.tsx` you can drop in without an AI key.

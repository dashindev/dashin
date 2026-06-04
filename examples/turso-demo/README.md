# dashin Demo (Turso / libSQL)

Boot a local libSQL server (`sqld`) with SQLite + seed data + a working admin.

## One command

```bash
./start.sh
```

Seeds a local SQLite file with `posts` and `products`, then serves it over the
libSQL HTTP protocol (`sqld` via Docker) on `http://127.0.0.1:8080`. Ctrl-C stops it.

> Requires Docker + `sqlite3` (for seeding).

## Hosted Turso alternative

```bash
turso db create dashin-demo
turso db shell dashin-demo < seed.sql   # same DDL as start.sh
turso db show dashin-demo --url         # → VITE_MAIN_URL
turso db tokens create dashin-demo      # → auth token
```

## Then: generate the admin

```bash
dashin new my-admin && cd my-admin
```

`.env`:
```
VITE_AUTH_PLUGIN=@dashin-dev/auth-local
VITE_MAIN_URL=http://127.0.0.1:8080
```

For hosted Turso, set `VITE_MAIN_URL` to your `*.turso.io` URL and sign in with
the DB auth token.

```bash
yarn dev
```

Or drop in [`example-admin.tsx`](./example-admin.tsx) directly.

## Notes

- The connector executes parameterized SQL over the libSQL HTTP pipeline
  (`POST /v2/pipeline`). See [`docs/turso/`](../../docs/turso/README.md) for details.

# bunadmin Flagship Demo (PocketBase)

Boot a real backend + seed data + generate a working admin — in minutes.

## One command (no Docker)

```bash
./start.sh
```

Downloads PocketBase, creates an admin, serves it on `http://127.0.0.1:8090`, and
seeds demo collections (`posts`, `products`, `customers`) + a `demo` user. The
script prints the exact next steps. Ctrl-C stops it.

> Linux x64 by default. For macOS/Windows, set `PB_VERSION` and edit the download
> URL in `start.sh` (or use the Docker path below).

## Docker alternative

```bash
docker compose up -d
node ../../docs/pocketbase/seed.js   # PB_URL defaults to http://127.0.0.1:8090
```

## Then: generate the admin

```bash
bunadmin new my-admin && cd my-admin
```

`.env`:
```
VITE_AUTH_PLUGIN=@xbuilder/bunadmin-auth-pocketbase
VITE_AUTH_URL=http://127.0.0.1:8090
```

Generate a validated admin table from the live `posts` collection (BYOK):
```bash
export BUNADMIN_AI_PROVIDER=openai BUNADMIN_AI_API_KEY=sk-... BUNADMIN_AI_MODEL=gpt-4o-mini
bunadmin ai generate --url http://127.0.0.1:8090 --collection posts \
  --token <admin-token> --out src/plugins/blog/post
yarn dev
```

Sign in as `demo` / `bunadmin123`. You now have a themed, validated admin for real
PocketBase data — see [`../../docs/ai/README.md`](../../docs/ai/README.md) for the
full AI walkthrough and [`example-admin.tsx`](./example-admin.tsx) for a
pre-generated table you can drop in without an API key.

## Credentials
- PocketBase admin: `admin@bunadmin.test` / `bunadmin123`
- Demo user (app login): `demo` / `bunadmin123`

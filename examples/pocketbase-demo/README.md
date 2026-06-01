# bunadmin Flagship Demo (PocketBase)

Boot a real backend + seed data + generate a working admin — in minutes.

## One command (no Docker)

```bash
./start.sh
```

Downloads PocketBase, creates an admin, serves it on `http://127.0.0.1:8090`, and
seeds demo collections (`posts`, `products`) + a `demo` user. The
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
VITE_AUTH_PLUGIN=@dashin-dev/auth-pocketbase
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
full AI walkthrough.

## Flagship example (no AI key needed)

Drop-in files showing the **plugin-level** features end to end:

| File | Shows |
| --- | --- |
| [`example-admin.tsx`](./example-admin.tsx) | `posts` table — filtering/search, inline CRUD, **bulk delete**, status-pill `lookup`, numeric column, custom `render` |
| [`example-products.tsx`](./example-products.tsx) | `products` table — numeric + boolean columns, bulk delete |
| [`example-menu.ts`](./example-menu.ts) | registers both as a **multi-level menu** (Blog → Posts + Products) |

Place them under `src/plugins/bunadmin-plugin-xbuilder-blog/` (posts/products in
their own folders, `example-menu.ts` as the plugin `index.ts`).

### Provided for free by `bunadmin new`

The app shell adds these automatically on every list view — no code in the files
above:

- **KPI stat band** + modern layout (`statBand`, upgrade footer)
- **Dark-mode toggle** (TopBar) via the theme preset system
- **i18n** (`t()` / `useTranslation`), dynamic routing, permission-aware menus

## Credentials
- PocketBase admin: `admin@bunadmin.test` / `bunadmin123`
- Demo user (app login): `demo` / `bunadmin123`

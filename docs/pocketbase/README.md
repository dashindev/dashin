# Using PocketBase with BunAdmin

[PocketBase](https://pocketbase.io) is a single-binary backend (auth + collections
+ REST API, embedded SQLite) — a zero-build way to run a real auth + CMS backend
for a BunAdmin project.

BunAdmin ships two plugins for it:

- **`@xbuilder/bunadmin-source-pocketbase`** — data source (list/add/update/delete/
  bulk) mapping the table query to PocketBase's REST API.
- **`@xbuilder/bunadmin-auth-pocketbase`** — auth plugin (sign-in via
  `users` collection).

## 1. Run PocketBase

```bash
# download the binary for your OS from https://pocketbase.io/docs/
./pocketbase admin create admin@bunadmin.test bunadmin123   # PocketBase 0.22
# (0.23+: ./pocketbase superuser create admin@bunadmin.test bunadmin123)
./pocketbase serve --http=127.0.0.1:8090
```

Admin UI: http://127.0.0.1:8090/_/

## 2. Seed demo data

With PocketBase running:

```bash
node docs/pocketbase/seed.js
```

Creates a `posts` collection, a demo user (`demo` / `bunadmin123`), and a few
records. Override with `PB_URL`, `PB_ADMIN`, `PB_ADMIN_PW` env vars.

## 3. Point your BunAdmin project at it

In your project's `.env`:

```
VITE_AUTH_PLUGIN=@xbuilder/bunadmin-auth-pocketbase
VITE_AUTH_URL=http://127.0.0.1:8090
```

Install the plugins:

```bash
yarn add @xbuilder/bunadmin-auth-pocketbase @xbuilder/bunadmin-source-pocketbase
```

## 4. Render a collection as a table

See [`example-posts.tsx`](./example-posts.tsx) for a complete `posts` page.
The key wiring:

```tsx
import { dataCtrl, editableCtrl } from "@xbuilder/bunadmin-source-pocketbase"

<Table
  columns={columns}
  data={query => dataCtrl({ t, tableQuery: query, path: "posts" })}  // PB collection
  editable={editableCtrl({ t, SchemaName: "posts" })}
  options={{ filtering: true }}
/>
```

- `dataCtrl` maps the table query → `?page=&perPage=&filter=&sort=` and returns
  `{ data, totalCount }`. Column filter operators map to PocketBase filter
  expressions (`=` `~` `!~` `>` `>=` `<` `<=`).
- `editableCtrl` wires inline create/update/delete to
  `POST/PATCH/DELETE /api/collections/posts/records`.

## Notes

- The auth plugin authenticates against PocketBase's built-in `users` collection
  (`/api/collections/users/auth-with-password`) and stores the returned token.
- Auth-plugin selection is `.env`-driven; no source changes are needed to switch
  backends.

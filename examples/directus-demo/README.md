# bunadmin Demo (Directus)

Boot a self-hosted Directus (SQLite-backed) + wire it to a bunadmin admin.

## One command

```bash
docker compose up -d
```

Starts Directus on `http://127.0.0.1:8055` with SQLite — no external DB needed.
Wait ~15s for first-boot migrations, then sign in to the app at `/admin`.

> Stop with `docker compose down`.

## One-time setup (Directus app)

Create the demo collection once in the Directus data studio:

1. Sign in at `http://127.0.0.1:8055` (`admin@bunadmin.test` / `bunadmin123`).
2. Create a `posts` collection with fields: `title` (string), `status`
   (string), `views` (integer).
3. Under **Settings → Roles & Permissions**, grant read/write on `posts`.

## Then: generate the admin

```bash
bunadmin new my-admin && cd my-admin
```

`.env`:
```
VITE_AUTH_PLUGIN=@xbuilder/bunadmin-auth-directus
VITE_MAIN_URL=http://127.0.0.1:8055
```

```bash
yarn dev
```

Or drop in [`example-admin.tsx`](./example-admin.tsx) directly.

## Credentials

- Directus admin: `admin@bunadmin.test` / `bunadmin123`

## Notes

- See [`docs/directus/`](../../docs/directus/README.md) for the connector reference.

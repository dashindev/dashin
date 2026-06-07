# dashin Demo (Payload CMS + SQLite)

Boot Payload CMS with SQLite + seed data + generate a working admin — in minutes.

## One command (no Docker)

```bash
./start.sh
```

Scaffolds a Payload project with SQLite, installs deps, creates an admin user,
seeds demo collections (`posts`, `products`) and serves on `http://127.0.0.1:3001`.
Ctrl-C stops it.

> Requires Node ≥ 20. First run takes ~1 min for `npm install`.

## Docker alternative

```bash
docker compose up -d
```

## Then: generate the admin

```bash
dashin new my-admin && cd my-admin
```

Install the Payload auth + data plugins:
```bash
yarn add @dashin-dev/auth-payload @dashin-dev/source-payload
```

`.env` (note: the URLs are the API **origin** — no `/api`. `source-payload` and
`auth-payload` append the Payload `/api` segment themselves; setting
`…/api` here causes a double `/api/api/...` and empty tables):
```
VITE_AUTH_PLUGIN=@dashin-dev/auth-payload
VITE_MAIN_URL=http://127.0.0.1:3001
VITE_AUTH_URL=http://127.0.0.1:3001
```

`@dashin-dev/auth-payload` signs in against a Payload auth collection
(`POST /api/users/login` with email/password → JWT) and stores the token so
`source-payload` sends it as a Bearer token on every request.

Generate a validated admin table from the live `posts` collection (BYOK):
```bash
export DASHIN_AI_PROVIDER=openai DASHIN_AI_API_KEY=sk-... DASHIN_AI_MODEL=gpt-4o-mini
dashin ai generate --url http://127.0.0.1:3001 --collection posts \
  --token <admin-token> --out src/plugins/blog/post
yarn dev
```

Or drop in [`example-admin.tsx`](./example-admin.tsx) directly — no AI key needed.

Sign in as `admin@dashin.test` / `dashin123`.

## Credentials

- Payload admin: `admin@dashin.test` / `dashin123`

## API endpoints

| Endpoint | Description |
| --- | --- |
| `GET /api/posts` | List posts |
| `GET /api/posts/:id` | Get single post |
| `POST /api/posts` | Create post |
| `PATCH /api/posts/:id` | Update post |
| `DELETE /api/posts/:id` | Delete post |
| `GET /admin` | Payload admin panel |

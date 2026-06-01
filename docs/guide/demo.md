# Flagship Demo

Boot a real backend, seed data, and generate a working admin — in minutes. The
runnable demo lives in [`examples/pocketbase-demo`](https://github.com/Chris533/bunadmin/tree/master/examples/pocketbase-demo).

## One command

```bash
cd examples/pocketbase-demo
./start.sh
```

Downloads PocketBase, creates an admin, serves it on `http://127.0.0.1:8090`, and
seeds demo collections (`posts`, `products`, `customers`) + a `demo` user.

> Docker alternative: `docker compose up -d` then `node ../../docs/pocketbase/seed.js`.

## Generate the admin

```bash
bunadmin new my-admin && cd my-admin
# .env: VITE_AUTH_PLUGIN=@xbuilder/bunadmin-auth-pocketbase, VITE_AUTH_URL=http://127.0.0.1:8090
export BUNADMIN_AI_PROVIDER=openai BUNADMIN_AI_API_KEY=sk-... BUNADMIN_AI_MODEL=gpt-4o-mini
bunadmin ai generate --url http://127.0.0.1:8090 --collection posts --token <admin-token>
yarn dev
```

Sign in as `demo` / `bunadmin123`. See the [AI guide](/ai/) for the full flow,
including `ai theme` and `ai refine`.

## Credentials
- PocketBase admin: `admin@bunadmin.test` / `bunadmin123`
- Demo user (app login): `demo` / `bunadmin123`

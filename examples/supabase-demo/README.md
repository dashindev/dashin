# bunadmin Demo (Supabase / Postgres)

Boot a local Supabase stack + seed data + generate a working admin.

## One command

```bash
./start.sh
```

Starts a local Supabase (via the Supabase CLI + Docker), seeds `posts` and
`products` tables, and prints the API URL + anon key. Studio runs at
`http://127.0.0.1:54323`, the API at `http://127.0.0.1:54321`.

> Requires Docker + Node ≥ 20. Stop with `npx supabase stop`.

## Then: generate the admin

```bash
bunadmin new my-admin && cd my-admin
```

`.env` (use the values printed by `start.sh`):
```
VITE_AUTH_PLUGIN=@xbuilder/bunadmin-auth-supabase
VITE_MAIN_URL=http://127.0.0.1:54321
VITE_SUPABASE_KEY=<anon-key>
```

Generate a validated admin table from the live `posts` table (BYOK):
```bash
export BUNADMIN_AI_PROVIDER=openai BUNADMIN_AI_API_KEY=sk-... BUNADMIN_AI_MODEL=gpt-4o-mini
bunadmin ai generate --url http://127.0.0.1:54321 --collection posts \
  --token <anon-key> --out src/plugins/blog/post
yarn dev
```

Or drop in [`example-admin.tsx`](./example-admin.tsx) directly — no AI key needed.

## Notes

- Local Supabase ships with permissive RLS for the default keys. For a hosted
  project, ensure your RLS policies permit the anon/service key.
- See [`docs/supabase/`](../../docs/supabase/README.md) for the full connector reference.

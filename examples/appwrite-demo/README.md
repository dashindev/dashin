# bunadmin Demo (Appwrite)

Boot a self-hosted Appwrite + wire it to a bunadmin admin.

## One command

```bash
./start.sh
```

Starts Appwrite (Docker) on `http://127.0.0.1:8080`. The console is at
`/console`.

> Requires Docker. Stop with `docker compose down`.

## One-time setup (Appwrite console)

Appwrite collections can't be seeded headlessly without an API key, so create
them once in the console:

1. Create an account + project — note the **Project ID**.
2. Create a database — note its **Database ID**.
3. Add a `posts` collection with attributes: `title` (string), `status`
   (string), `views` (integer).
4. Set collection **permissions** to allow your user to read/write.

## Then: generate the admin

```bash
bunadmin new my-admin && cd my-admin
```

`.env`:
```
VITE_AUTH_PLUGIN=@xbuilder/bunadmin-auth-appwrite
VITE_AUTH_URL=http://127.0.0.1:8080
VITE_APPWRITE_PROJECT=<your-project-id>
VITE_APPWRITE_DATABASE=<your-database-id>
```

```bash
yarn dev
```

Or drop in [`example-admin.tsx`](./example-admin.tsx) directly. Note Appwrite
rows use `$id`.

## Notes

- This compose file is a trimmed single-service setup for local demos. For
  production use Appwrite's [official self-hosting guide](https://appwrite.io/docs/advanced/self-hosting).
- See [`docs/appwrite/`](../../docs/appwrite/README.md) for the connector reference.

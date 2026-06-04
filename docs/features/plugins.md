# Plugins & Auth

dashin is plugin-driven: schemas, data sources, auth, and uploads are all
plugins, discovered by the generator and loaded dynamically.

## Plugin types

| Kind | Example | Role |
| --- | --- | --- |
| **Schema/feature** | `dashin-plugin-[team]-[group]` | menus + schemas (tables) |
| **Data source** | `dashin-source-*` | list/CRUD against a backend ([Connectors](/connectors/)) |
| **Auth** | `dashin-auth-*` | sign-in + token handling |
| **Upload** | `dashin-upload-*` | file storage |

Create one with the CLI:

```bash
dashin plugin myteam-blog     # in plugins/
dashin schema post            # in the plugin dir
```

The generator scans your `dependencies` + `devDependencies` for dashin plugins
and emits `.dashin/dynamic/` (menus, schema data, an import map) consumed at
runtime via the plugin registry (`import.meta.glob`).

## Auth

Set the active auth plugin in `.env`:

```
VITE_AUTH_PLUGIN=@dashin-dev/auth-pocketbase
VITE_AUTH_URL=http://127.0.0.1:8090
```

Available: `auth-local`, `auth-pocketbase`, `auth-strapi`. The
sign-in component is resolved dynamically from the configured plugin (no hardcoded
import) — switching auth backends is a `.env` change. After sign-in the token is
stored (IndexedDB) and read by connectors via `storedToken()`.

## Backend-agnostic by design

Because data access goes through a connector and auth through a plugin, the same
schema/table UI runs on PocketBase, Appwrite, Supabase, Strapi, Directus, Payload,
or GraphQL — swap the plugin, keep the UI.

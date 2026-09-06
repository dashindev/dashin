# Connectors

A connector is a **data-source plugin** that maps dashin's table query
(filter / sort / search / pagination / CRUD / bulk) to a specific backend's API.
Swap the connector import to change backends — the table UI is unchanged.

## Available connectors

| Backend | Package | API |
| --- | --- | --- |
| **Atomo (Rust Core)** | `@dashin-dev/source-atomo` | `/meta/schema` Introspection + GraphQL / REST |
| [PocketBase](/pocketbase/) | `@dashin-dev/source-pocketbase` | REST `/api/collections` |
| [Appwrite](/appwrite/) | `@dashin-dev/source-appwrite` | Databases REST |
| [Supabase / Postgres](/supabase/) | `@dashin-dev/source-supabase` | PostgREST |
| [Directus](/directus/) | `@dashin-dev/source-directus` | REST `/items` |
| [Payload](/payload/) | `@dashin-dev/source-payload` | REST `/api` |
| [Turso / libSQL](/turso/) | `@dashin-dev/source-turso` | SQLite over HTTP (SQL) |
| Strapi | `@dashin-dev/source-strapi` | REST |
| GraphQL | `@dashin-dev/source-graphql` | any GraphQL API |

## Common shape

Every connector exports `dataCtrl`, `editableCtrl`, and `bulkDeleteCtrl`:

```tsx
import { dataCtrl, editableCtrl, bulkDeleteCtrl } from "@dashin-dev/source-<backend>"

<Table
  data={query => dataCtrl({ t, tableQuery: query, path: "<collection-or-table>" })}
  editable={editableCtrl({ t, SchemaName: "<collection-or-table>" })}
  actions={[bulkDeleteCtrl({ t, SchemaName, tableRef })]}
/>
```

## GraphQL-native CMSes (Keystone, Hasura, …)

CMSes and backends that expose a **GraphQL API** — including **KeystoneJS**,
**Hasura**, and GraphQL-mode Strapi — are supported through the
**`@dashin-dev/source-graphql`** connector rather than a dedicated package.
Point it at the GraphQL endpoint and map your query/mutations; no separate
connector is needed.

## Writing a connector

Mirror an existing `source-*` package: a pure `filter` module (operators → the
backend's query language, unit-tested), `listSer` + CRUD/bulk services, and the
three controllers. Add a `vite.config.ts` alias to the `.ts` source (so Vite gets
clean ESM rather than the CJS `lib/`).

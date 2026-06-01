# Connectors

A connector is a **data-source plugin** that maps bunadmin's table query
(filter / sort / search / pagination / CRUD / bulk) to a specific backend's API.
Swap the connector import to change backends — the table UI is unchanged.

## Available connectors

| Backend | Package | API |
| --- | --- | --- |
| [PocketBase](/pocketbase/) | `@xbuilder/bunadmin-source-pocketbase` | REST `/api/collections` |
| [Appwrite](/appwrite/) | `@xbuilder/bunadmin-source-appwrite` | Databases REST |
| [Supabase / Postgres](/supabase/) | `@xbuilder/bunadmin-source-supabase` | PostgREST |
| [Directus](/directus/) | `@xbuilder/bunadmin-source-directus` | REST `/items` |
| [Payload](/payload/) | `@xbuilder/bunadmin-source-payload` | REST `/api` |
| Strapi | `@xbuilder/bunadmin-source-strapi` | REST |
| GraphQL | `@xbuilder/bunadmin-source-graphql` | any GraphQL API |

## Common shape

Every connector exports `dataCtrl`, `editableCtrl`, and `bulkDeleteCtrl`:

```tsx
import { dataCtrl, editableCtrl, bulkDeleteCtrl } from "@xbuilder/bunadmin-source-<backend>"

<Table
  data={query => dataCtrl({ t, tableQuery: query, path: "<collection-or-table>" })}
  editable={editableCtrl({ t, SchemaName: "<collection-or-table>" })}
  actions={[bulkDeleteCtrl({ t, SchemaName, tableRef })]}
/>
```

## GraphQL-native CMSes (Keystone, Hasura, …)

CMSes and backends that expose a **GraphQL API** — including **KeystoneJS**,
**Hasura**, and GraphQL-mode Strapi — are supported through the
**`@xbuilder/bunadmin-source-graphql`** connector rather than a dedicated package.
Point it at the GraphQL endpoint and map your query/mutations; no separate
connector is needed.

## Writing a connector

Mirror an existing `source-*` package: a pure `filter` module (operators → the
backend's query language, unit-tested), `listSer` + CRUD/bulk services, and the
three controllers. Add a `vite.config.ts` alias to the `.ts` source (so Vite gets
clean ESM rather than the CJS `lib/`).

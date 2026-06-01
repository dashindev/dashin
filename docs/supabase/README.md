# Supabase / Postgres Connector

`@dashin-dev/source-supabase` — use [Supabase](https://supabase.com)
(PostgREST) as the data source for any bunadmin schema. Same table UI, backed by
your Postgres tables.

## Install

```bash
yarn add @dashin-dev/source-supabase
```

## Configure (`.env`)

```
VITE_MAIN_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_KEY=<anon-or-service-key>      # or VITE_SUPABASE_ANON_KEY
```

Surfaced on `ENV.SUPABASE_KEY` and sent as the `apikey` header; the stored auth
token (or the key) is sent as `Authorization: Bearer …`. Requests go to
`/rest/v1/{table}`.

## Use in a schema

```tsx
import { dataCtrl, editableCtrl, bulkDeleteCtrl } from "@dashin-dev/source-supabase"

export default function Posts() {
  const { t } = useTranslation("table")
  const SchemaName = "posts" // Postgres table name
  return (
    <Table
      columns={columns}
      data={query => dataCtrl({ t, tableQuery: query, path: SchemaName })}
      editable={editableCtrl({ t, SchemaName })}
      actions={[bulkDeleteCtrl({ t, SchemaName, tableRef })]}
      options={{ ...DP.options, filtering: true }}
    />
  )
}
```

## How filters map

bunadmin table operators → PostgREST `column=operator.value`:

| Table operator | PostgREST |
| --- | --- |
| `=` | `eq.value` |
| `!=` | `neq.value` |
| contains | `ilike.*value*` |
| not contains | `not.ilike.*value*` |
| `>` `>=` `<` `<=` | `gt.` / `gte.` / `lt.` / `lte.` |
| sort | `order=col.asc\|desc` |
| pagination | `limit` + `offset` |

Total count uses `Prefer: count=exact`. Row ops target `?id=eq.<id>`.

## Notes
- Row-Level Security must permit the key/user; the anon key + RLS policies is the
  typical setup. A service key bypasses RLS — use only in trusted contexts.
- Primary key assumed `id` (override via `primaryKey` in update/delete props).

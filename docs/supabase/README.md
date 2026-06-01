# Supabase / Postgres Connector

`@xbuilder/bunadmin-source-supabase` — use Supabase (PostgREST) as the data source
for any bunadmin schema. Same table/CRUD UI, backed by your Postgres tables.

```bash
yarn add @xbuilder/bunadmin-source-supabase
```

```tsx
import { dataCtrl, editableCtrl } from "@xbuilder/bunadmin-source-supabase"

<Table
  columns={columns}
  data={query => dataCtrl({ t, tableQuery: query, path: "<table>" })}
  editable={editableCtrl({ t, SchemaName: "<table>" })}
/>
```

Filters map to PostgREST (`col=eq.value`, `ilike`, comparisons), with `order`,
`limit`/`offset`, and `apikey` + `Authorization: Bearer` headers.

::: warning
Full environment-variable wiring (`SUPABASE_KEY` etc.) + an end-to-end walkthrough
are being finalized. See the
[source-supabase package](https://github.com/Chris533/bunadmin/tree/master/packages/bunadmin-source-supabase)
meanwhile.
:::

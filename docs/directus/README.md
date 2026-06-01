# Directus Connector

`@xbuilder/bunadmin-source-directus` — use [Directus](https://directus.io) as the
data source (list / filter / sort / CRUD / bulk via the Items REST API).

## Install

```bash
yarn add @xbuilder/bunadmin-source-directus
```

## Configure (`.env`)

```
VITE_MAIN_URL=https://your-directus-instance.example.com
```

Auth uses the bunadmin stored token as `Authorization: Bearer …`.

## Use in a schema

```tsx
import { dataCtrl, editableCtrl, bulkDeleteCtrl } from "@xbuilder/bunadmin-source-directus"

<Table
  columns={columns}
  data={query => dataCtrl({ t, tableQuery: query, path: "posts" })}  // collection
  editable={editableCtrl({ t, SchemaName: "posts" })}
  actions={[bulkDeleteCtrl({ t, SchemaName, tableRef })]}
/>
```

## Filter mapping

bunadmin operators → Directus `filter[field][_op]`:

| Table operator | Directus |
| --- | --- |
| `=` `!=` | `_eq` `_neq` |
| contains / not contains | `_contains` / `_ncontains` |
| `>` `>=` `<` `<=` | `_gt` `_gte` `_lt` `_lte` |
| sort | `sort=-field` |
| pagination | `limit` + `offset` |

Total count comes from `meta=filter_count`. Endpoints: `/items/{collection}` and
`/items/{collection}/{id}`.

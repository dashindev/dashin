# Payload Connector

`@dashin-dev/source-payload` — use [Payload CMS](https://payloadcms.com) as
the data source (list / filter / sort / CRUD / bulk via the REST API).

## Install

```bash
yarn add @dashin-dev/source-payload
```

## Configure (`.env`)

```
VITE_MAIN_URL=https://your-payload-app.example.com
```

Auth uses the bunadmin stored token as `Authorization: Bearer …`.

## Use in a schema

```tsx
import { dataCtrl, editableCtrl, bulkDeleteCtrl } from "@dashin-dev/source-payload"

<Table
  columns={columns}
  data={query => dataCtrl({ t, tableQuery: query, path: "posts" })}  // collection slug
  editable={editableCtrl({ t, SchemaName: "posts" })}
  actions={[bulkDeleteCtrl({ t, SchemaName, tableRef })]}
/>
```

## Filter mapping

bunadmin operators → Payload `where[field][operator]`:

| Table operator | Payload |
| --- | --- |
| `=` `!=` | `equals` `not_equals` |
| contains | `contains` |
| `>` `>=` `<` `<=` | `greater_than` `greater_than_equal` `less_than` `less_than_equal` |
| sort | `sort=-field` |
| pagination | `limit` + `page` (1-based) |

Responses are `{ docs, totalDocs }`. Endpoints: `/api/{collection}` and
`/api/{collection}/{id}`.

# Appwrite Connector

`@dashin-dev/source-appwrite` — use [Appwrite](https://appwrite.io)
Databases as the data source for any bunadmin schema (list / filter / sort /
CRUD / bulk), reusing the same table UI.

## Install

```bash
yarn add @dashin-dev/source-appwrite
```

## Configure (`.env`)

```
VITE_AUTH_URL=https://<region>.cloud.appwrite.io
VITE_APPWRITE_PROJECT=<your-project-id>
VITE_APPWRITE_DATABASE=<your-database-id>   # defaults to "default"
```

These are surfaced on bunadmin's `ENV` (`ENV.APPWRITE_PROJECT`,
`ENV.APPWRITE_DATABASE`) and sent as the `X-Appwrite-Project` header; the stored
auth token is sent as `X-Appwrite-JWT`.

## Use in a schema

```tsx
import { Table, TableHead, tableIcons, TableDefaultProps as DP, useTranslation } from "@dashin-dev/dashin"
import { dataCtrl, editableCtrl, bulkDeleteCtrl } from "@dashin-dev/source-appwrite"

export default function Posts() {
  const { t } = useTranslation("table")
  const SchemaName = "posts" // Appwrite collectionId
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

bunadmin table operators → Appwrite query JSON
(`/v1/databases/{db}/collections/{col}/documents?queries[]=`):

| Table operator | Appwrite query |
| --- | --- |
| `=` | `equal` |
| `!=` | `notEqual` |
| contains | `search` |
| `>` `>=` `<` `<=` | `greaterThan` / `greaterThanEqual` / `lessThan` / `lessThanEqual` |
| sort | `orderAsc` / `orderDesc` |
| pagination | `limit` + `offset` |

## Notes
- Rows use Appwrite's `$id`; create wraps fields as `{ documentId: "unique()", data }`.
- Collection permissions must allow the signed-in user to read/write.

# Tables & CRUD

The `Table` component is the core of a dashin admin: a data grid with filtering,
sorting, search, pagination, inline editing, bulk actions, grouping, and row
detail — backed by any [connector](/connectors/).

## Minimal example

```tsx
import { Table, TableHead, tableIcons, TableDefaultProps as DP, useTranslation } from "@dashin-dev/dashin"
import { dataCtrl, editableCtrl, bulkDeleteCtrl } from "@dashin-dev/source-pocketbase"

export default function Posts() {
  const { t } = useTranslation("table")
  const SchemaName = "posts"
  const columns = [
    { title: t("Id"), field: "id", editable: "never" },
    { title: t("Name"), field: "name" },
    { title: t("Status"), field: "status", lookup: { Draft: "Draft", Published: "Published" } },
    { title: t("Views"), field: "views", type: "numeric" }
  ]
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

## Columns

| Field | Purpose |
| --- | --- |
| `title` | header label (wrap in `t()` for i18n) |
| `field` | data key |
| `type` | `numeric` / `boolean` / `date` / `datetime` |
| `lookup` | `{ value: label }` → renders a **status pill** |
| `editable: "never"` | read-only cell |
| `render` | custom cell renderer |

## Filtering & search

Set `filtering: true` in `options` to show a per-column filter row. Operators (eq,
contains, not-contains, `> >= < <=`) are translated to each backend's query
language by the connector. The toolbar search box maps to the connector's
`searchField` (default `name`).

## Inline CRUD & bulk

`editable={editableCtrl(...)}` wires inline add/edit/delete; `onBulkUpdate`
handles multi-row edits. `bulkDeleteCtrl` adds a "delete selected" toolbar action.
All map to the connector's CRUD services.

## Data sources

The `data` and `editable` props come from a connector — swap the import to change
backends with no UI change. See [Connectors](/connectors/).

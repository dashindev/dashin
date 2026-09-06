# @dashin-dev/source-atomo

Official Atomo data source connector for [Dashin](https://dashin.dev). Connects Dashin's `<CrudTable>` and dynamic schema engine to an [Atomo](https://github.com/atomo-cc/atomo) ultra-high-performance Rust backend.

## Features

- **Runtime Schema Introspection**: Fetches model metadata dynamically from `/meta/schema` ? zero code-generation required.
- **Dual-Channel Querying**: Seamlessly converts Dashin `TableQuery` (pagination, filtering, sorting, search) into Atomo GraphQL `paginatedRecords` queries with REST fallback.
- **Full CRUD Support**: Pre-wired `dataCtrl`, `editableCtrl`, and `bulkDeleteCtrl` for instant create, read, update, delete, and bulk operations.
- **Dynamic Schema Engine**: `atomoFieldsToDashinColumns` maps Atomo fields (strings, numbers, booleans, dates, lookups, JSON) directly into Dashin `Column` definitions.
- **Automatic Menu Generation**: `buildAtomoMenuData` automatically derives semantic sidebar navigation from model metadata with permission checks.
- **Cross-Entity Drill-in (RelatedPreview)**: `buildAtomoRegistry` extracts foreign keys and one-to-many relationships, wiring stacked slide-out cards (`RelatedCard`) with breadcrumbs and loop guards.
- **CQRS Consistency Tuning**: Built-in optimistic updates with configurable `consistencyDelayMs` to eliminate read-model projection lag flicker.

## Installation

```bash
yarn add @dashin-dev/source-atomo @dashin-dev/dashin
# or
pnpm add @dashin-dev/source-atomo @dashin-dev/dashin
```

## Quick Start (Zero-Code Dynamic Entities)

Wrap your app or entity router in `<DynamicAtomoProvider>` to introspect and render all Atomo models automatically:

```tsx
import React from 'react'
import { DynamicAtomoProvider, DynamicAtomoEntity } from '@dashin-dev/source-atomo'

export default function AtomoAdminApp() {
  return (
    <DynamicAtomoProvider baseUrl="http://localhost:3000" consistencyDelayMs={150}>
      {/* DynamicAtomoEntity loads the schema for the model name and renders CrudTable + RelatedPreview */}
      <DynamicAtomoEntity modelName="Contact" />
    </DynamicAtomoProvider>
  )
}
```

## Manual Wiring with `<CrudTable>`

If you want fine-grained control over individual entity pages, use the exported controllers:

```tsx
import React from 'react'
import { CrudTable, useTranslation } from '@dashin-dev/dashin'
import { dataCtrl, editableCtrl, bulkDeleteCtrl } from '@dashin-dev/source-atomo'

const columns = [
  { title: 'ID', field: 'id', editable: 'never' },
  { title: 'Full Name', field: 'name' },
  { title: 'Email', field: 'email' },
  { title: 'Status', field: 'status', lookup: { Active: 'Active', Inactive: 'Inactive' } }
]

export default function ContactsPage() {
  const { t } = useTranslation('table')
  const tableRef = React.useRef(null)

  return (
    <CrudTable
      ref={tableRef}
      title="Contacts"
      columns={columns}
      data={query =>
        dataCtrl({
          t,
          tableQuery: query,
          path: 'Contact',
          searchField: 'name',
          baseUrl: 'http://localhost:3000'
        })
      }
      editable={editableCtrl({
        t,
        SchemaName: 'Contact',
        baseUrl: 'http://localhost:3000',
        consistencyDelayMs: 200
      })}
      actions={[
        bulkDeleteCtrl({
          t,
          SchemaName: 'Contact',
          tableRef,
          baseUrl: 'http://localhost:3000'
        })
      ]}
    />
  )
}
```

## Related Records & Stacked Preview

Use `buildAtomoRegistry` to create a `CollectionRegistry` for Dashin's `<RelatedPreviewProvider>`:

```tsx
import { RelatedPreviewProvider } from '@dashin-dev/dashin'
import { buildAtomoRegistry, fetchAtomoMetadata } from '@dashin-dev/source-atomo'

// Load metadata and build the relation registry:
const meta = await fetchAtomoMetadata({ baseUrl: 'http://localhost:3000' })
const registry = buildAtomoRegistry(meta, { baseUrl: 'http://localhost:3000' })

// Wrap your page:
<RelatedPreviewProvider collections={registry}>
  <CrudTable ... />
</RelatedPreviewProvider>
```

## CQRS Consistency Handling

Atomo separates writes (event stream) from reads (projected tables). To ensure users immediately see their changes after adding or updating a row without waiting for asynchronous projector lag, `editableCtrl` supports:

- **Optimistic merge**: Returns the mutation response merged with submitted data.
- **`consistencyDelayMs`**: Optional wait time (e.g. `150ms`) before triggering table reload to allow read projectors to catch up.

```tsx
editableCtrl({
  t,
  SchemaName: 'orders',
  consistencyDelayMs: 150
})
```

## API Reference

| Export | Type | Description |
| :--- | :--- | :--- |
| `dataCtrl` | Function | Dashin table query handler (page, filter, sort, search). |
| `editableCtrl` | Function | CRUD mutations handler (`onRowAdd`, `onRowUpdate`, `onRowDelete`). |
| `bulkDeleteCtrl` | Function | Action definition for batch row deletion. |
| `fetchAtomoMetadata` | Function | Retrieves `/meta/schema` model definitions from Atomo. |
| `atomoFieldsToDashinColumns` | Function | Converts Atomo field metadata into Dashin `Column` definitions. |
| `buildAtomoMenuData` | Function | Generates hierarchical Dashin sidebar menu items. |
| `buildAtomoRegistry` | Function | Builds `CollectionRegistry` for `RelatedPreviewProvider`. |
| `DynamicAtomoProvider` | Component | Context provider supplying schema metadata & relations. |
| `DynamicAtomoEntity` | Component | Zero-code dynamic entity CRUD table + drawer page. |

## License

Apache-2.0

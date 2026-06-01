# Appwrite Connector

`@xbuilder/bunadmin-source-appwrite` — use Appwrite as the data source for any
bunadmin schema (list/CRUD/bulk via Appwrite's Databases API).

```bash
yarn add @xbuilder/bunadmin-source-appwrite
```

```tsx
import { dataCtrl, editableCtrl } from "@xbuilder/bunadmin-source-appwrite"

<Table
  columns={columns}
  data={query => dataCtrl({ t, tableQuery: query, path: "<collectionId>" })}
  editable={editableCtrl({ t, SchemaName: "<collectionId>" })}
/>
```

Configure via `.env` (`VITE_*`): the Appwrite endpoint (`VITE_AUTH_URL`), project,
and database id.

::: warning
Full environment-variable wiring + an end-to-end walkthrough are being finalized
(verifying how `VITE_*` keys surface to the connector). See the
[source-appwrite package](https://github.com/Chris533/bunadmin/tree/master/packages/bunadmin-source-appwrite)
meanwhile.
:::

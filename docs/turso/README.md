# Turso / libSQL Connector

`@dashin-dev/source-turso` — use [Turso](https://turso.tech) / libSQL
(SQLite over HTTP) as the data source, with **full CRUD via SQL**.

> SQLite has no native HTTP API; this connector targets the **libSQL HTTP
> protocol** (`POST /v2/pipeline`), which Turso and self-hosted `sqld` expose.

## Install

```bash
yarn add @dashin-dev/source-turso
```

## Configure (`.env`)

```
VITE_MAIN_URL=https://<your-db>.turso.io
```

Auth uses the bunadmin stored token (a Turso DB auth token) as
`Authorization: Bearer …`.

## Use in a schema

```tsx
import { dataCtrl, editableCtrl, bulkDeleteCtrl } from "@dashin-dev/source-turso"

<Table
  columns={columns}
  data={query => dataCtrl({ t, tableQuery: query, path: "posts" })}  // table name
  editable={editableCtrl({ t, SchemaName: "posts" })}
  actions={[bulkDeleteCtrl({ t, SchemaName, tableRef })]}
/>
```

## How it works

The connector builds **parameterized SQL** and executes it over the libSQL HTTP
pipeline:

| Table action | SQL |
| --- | --- |
| list | `SELECT * FROM t WHERE … ORDER BY … LIMIT ? OFFSET ?` |
| count | `SELECT COUNT(*) … ` (for total) |
| filter `=` `!=` `> >= < <=` | bound `?` params |
| contains / not contains | `LIKE ?` / `NOT LIKE ?` with `%value%` |
| create / update / delete | `INSERT` / `UPDATE … WHERE id=?` / `DELETE … WHERE id=?` |

::: tip Security
Values are **always bound parameters** (never string-interpolated). Table/column
identifiers are validated against `^[A-Za-z_][A-Za-z0-9_]*$` and quoted, so a
malicious field name is rejected rather than injected.
:::

Primary key defaults to `id` (override via `primaryKey`).

---
title: "Payload CMS admin panel"
description: "Build a Payload CMS admin panel with Dashin, a React admin dashboard with CRUD, filter and sort over Payload’s REST API. A custom front-end for your collections."
---

# Payload admin panel with Dashin

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

`VITE_MAIN_URL` is the API **origin** (no `/api`) — the connector appends the
Payload `/api` segment itself. A trailing `/api` is tolerated (so
`https://app.example.com/api` also works) and won't produce a `/api/api/…`
double-prefix.

## Auth (sign-in)

Use **`@dashin-dev/auth-payload`** to sign in against a Payload auth collection
and store the JWT — which `source-payload` then sends as `Authorization: Bearer …`
on every request.

```bash
yarn add @dashin-dev/auth-payload
```

`.env`:

```
VITE_AUTH_PLUGIN=@dashin-dev/auth-payload
VITE_AUTH_URL=https://your-payload-app.example.com
```

It posts `email` / `password` to `POST /api/{collection}/login` (default
collection `users`) and persists the returned token. The sign-in screen is shown
automatically for unauthenticated users.

> CORS: a browser SPA on a different origin needs the Payload server to allow it.
> Set `cors` in your Payload config (e.g. the dashboard origin, or `'*'`).

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

dashin operators → Payload `where[field][operator]`:

| Table operator | Payload |
| --- | --- |
| `=` `!=` | `equals` `not_equals` |
| contains | `contains` |
| `>` `>=` `<` `<=` | `greater_than` `greater_than_equal` `less_than` `less_than_equal` |
| sort | `sort=-field` |
| pagination | `limit` + `page` (1-based) |

Responses are `{ docs, totalDocs }`. Endpoints: `/api/{collection}` and
`/api/{collection}/{id}`.

# Strict mutation contract

Dashin treats a mutation as successful only when its handler's Promise resolves.
Create, update, delete, and bulk actions that reject keep the active drawer, row,
or failed selection available and surface the error instead of reporting success.

## Request-level business errors

HTTP failures, timeouts, and network failures reject with `RequestError`. The
error preserves useful context such as `status`, `url`, response `data`, and the
native `response` when available.

Some APIs return HTTP 200 while reporting a failed business operation in the
response body. Detection is opt-in because normal read models may legitimately
contain fields such as `errors`, `success`, or `ok`:

```ts
import { request } from "@dashin-dev/dashin"

await request("/api/orders", {
  method: "POST",
  data: order,
  checkBusinessErrors: true
})
```

`checkBusinessErrors` defaults to `false`. With `true`, Dashin rejects non-empty
`errors`, `success: false`, and `ok: false` responses. A custom discriminator can
apply an endpoint-specific rule:

```ts
await request("/api/licenses", {
  checkBusinessErrors: data =>
    data.status === "REJECTED" ? data.reason : false
})
```

The custom discriminator contract is:

| Return value | Meaning |
| --- | --- |
| non-empty `string` | failure; the string is the displayed reason |
| `true` | failure; Dashin derives the reason from the response |
| `false`, `undefined`, or `null` | no business error |

`legacyResolveError: true` preserves the old resolve-on-failure behavior only for
legacy callers that cannot migrate immediately. New code should not enable it.

## Table actions

`Action.onClick` accepts `void | Promise<void>`. A synchronous action may return
`void`; an asynchronous mutation must return its Promise so Dashin can wait for
the result:

```tsx
const archiveSelected = {
  icon: "archive",
  tooltip: "Archive selected",
  onClick: async (_event, rows) => {
    await api.archive(rows)
  }
}
```

Do not start asynchronous work without returning or awaiting it. Dashin clears a
successful selection only after the handler resolves. If it rejects, the Table
shows an accessible error banner and retains the selection for retry.

## Partial bulk failures

Connector bulk services process every item before reporting the aggregate result.
If any item fails, they reject with an `Error` carrying:

```ts
type BulkMutationError = Error & {
  resList: unknown[]
  okCount: number
  failCount: number
}
```

`resList` preserves input order and marks failed results with an `error` field.
When the mapping is reliable, `Table` keeps only those failed rows selected. If
the results cannot be mapped safely, it keeps the complete selection rather than
silently discarding retry context.

The same resolve-only success rule applies to single-row handlers and nested
editors such as `DetailDrawer` and `RelatedPreview`.

## Migration

See [Migrating to 2.0.0-alpha.8](/guide/migration-alpha-8) for compatibility
guidance and the custom-action change required by this contract.

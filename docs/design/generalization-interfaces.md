# Generalization interfaces — Phase 3 proposal

**Design only, not implemented public API.** Extend existing Table, DatePicker,
RelatedPreview, ImageEdit and UserMenu before adding parallel components.
Reliability changes are documented [separately](../features/reliability).
No downstream medical rules, records, media or authorization names belong here.

## Filters and date ranges — priority 1

Proposed optional `filterSchema`/adapter capabilities:

```ts
type FilterOperator = "eq" | "ne" | "contains" | "notContains" | "gte" | "lte" | "in"
type FilterField = {
  field: string
  type: "text" | "number" | "boolean" | "enum" | "relation" | "dateOnly" | "instant"
  label: string
  operators: FilterOperator[]
  locale?: string
  timezone?: string
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
}
type FilterNode = { field: string; operator: FilterOperator; value: unknown }
```

No schema means the existing Table filtering API. An opt-in model emits AND
conditions before server pagination, resets page to zero on change and makes
empty/reset semantics explicit. Nested AND/OR should be separate capability,
not silently flattened. Unsupported operators produce a visible validation
error before sending; `ne` and `notContains` must never be substituted.

The adapter maps operators, value/ID types and pagination to its backend. Payload
restrictions are not global rules for D1. Date-only values remain `YYYY-MM-DD`
strings without UTC conversion; instants use ISO timestamps with an explicit
timezone for display/range boundaries. No fixed UTC+8 or fixed week start.
Example: orders filtered by total, status and order-date range; products by SKU
or inventory quantity. Tests must include unsupported operators and DST ranges.

## Relation picker and registry extension — priority 1

Extend the current `CollectionEntry` instead of replacing RelatedPreview:

```ts
type RelationId = string | number
type RelationLoader = (query: {
  search: string; cursor?: string; pageSize: number; signal?: AbortSignal
}) => Promise<{ items: unknown[]; nextCursor?: string }>
type RelationCapability = {
  getId: (record: any) => RelationId
  load: RelationLoader
  resolve: (ids: RelationId[], signal?: AbortSignal) => Promise<unknown[]>
  isDisabled?: (record: any) => boolean
}
```

Default registry/renderDetail/lookup behavior is unchanged; no automatic load
of a whole catalog. The adapter owns ID coercion, ordering, pagination and
historical/inactive option resolution. The picker retains selected labels when
not on the visible page, displays loading/empty/error with explicit retry and
supports disabled and historical records. Parent dependency change clears only
dependent selections via an opt-in callback; it must not silently rewrite data.
Example: an order's product picker narrows by warehouse, retaining its previously
selected discontinued SKU until explicitly changed. Registry `getId` also
removes the current populated-record assumption of a field named `id`.

## Authenticated media and export — priority 2

Extend ImageEdit preview/upload callbacks with an optional media loader:

```ts
type MediaLoader = (request: {
  url: string; variant: "thumbnail" | "original" | "pdf";
  identityKey: string; signal?: AbortSignal
}) => Promise<{ blob: Blob; filename?: string }>
```

Plain URL previews stay the default. The adapter enforces same-origin or an
explicit URL allowlist **before** attaching credentials, including redirect
targets; never leak a token to arbitrary remote images. Cache keys include
identity and variant; switching/removing identity aborts loads, clears cache
and revokes object URLs. Distinguish 401/403, CORS, missing originals and PDF
errors; retry must be safe and cancel must release URLs.

Optional export transform receives original Blob and configurable text,
position, opacity, format, dimensions, locale/timezone and explicit upscale
policy. Preview/download use the same raster and never overwrite the original.
Bound huge-image memory and test revoke/cancellation. Example: product catalog
photos exported with a brand caption or order receipt PDFs. A browser watermark
does **not** prove capture time, tamper resistance or legal evidence integrity.

## Composite fields — priority 2

Use existing `Column.editComponent` first; propose an optional controlled array
editor accepting `value`, `onChange`, stable item keys, field schema, ordering,
minimum/maximum count and per-item error paths. Empty values, numeric zero,
required arrays and cancellation need explicit contracts. Reordering preserves
input/focus by item key; validation returns localized field errors, not a toast.
Example: order line items (product/quantity/price) or store opening times.
Medical frequency, clinical signatures and institutional medication categories
remain consumer rules. Only the backend can guarantee transactional single/bulk
updates; the editor must not imply atomicity from sequential calls.

## Identity lifecycle and capabilities — priority 1 (separate security review)

Current UserMenu already supports stored accounts and custom logout hooks, but
external token/cache invalidation and account deletion vs switching are not one
consistent strategy. Propose injected lifecycle methods:

```ts
interface IdentityStrategy {
  list(): Promise<{ key: string; label: string }[]> // no credentials in UI/logs
  activate(key: string): Promise<void>
  signOut(key: string): Promise<void>
  remove(key: string): Promise<void>
  invalidate(identityKey: string): Promise<void>
}
type CanAccess = (context: { resource: string; action: string; signal?: AbortSignal }) => Promise<boolean>
```

Without injection, retain the current username-indexed storage and logout
semantics. A new strategy defines active-pointer updates, token cleanup,
cross-tab notification, cache invalidation and routing as one lifecycle.
Removal is not activation, and signing out one identity must not delete others.
Storage failure must remain observable and recoverable.

Capability decisions can control presentation and optional route guards, with
pending/denied/error states and safe destinations. Hiding a menu is not denying
a direct route, and neither substitutes for server permissions. Missing role
cannot grant admin; no client-selected elevated permissions. Example: a shop
operator can browse products while only backend-confirmed inventory managers
can adjust stock. Scope/security review is required before implementing these
new authorization boundaries; this Phase 2 branch does not silently add them.

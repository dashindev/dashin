# Authentication, queries and bulk reliability

These changes are local, unreleased work after **2.0.0-alpha.8**. They are not
available merely by installing alpha.8. Existing strict mutation behavior stays
unchanged; see [Strict mutation contract](./strict-mutation-contract).

## Authentication

Auth adapters map their success response to `SignInResult`. `completeSignIn`
requires a nonempty string `user.username` and, by default, a nonempty string
`token`. Local authentication explicitly sets `requireToken: false`. Backend
business rejection remains the adapter's responsibility; the core does not guess
that arbitrary `errors`, `ok` or `success` fields are errors in every API.

The helper catches transport, malformed response and storage failures, resets
submitting in `finally`, and emits a readable failure notice without navigating.
Successful identity writes use one Dexie transaction for users and settings.
The default navigation reloads `/` to re-evaluate authentication.

```ts
await completeSignIn({
  t, signIn: () => exchangeCredentials(values), setSubmitting,
  // Only needed for an external token store:
  afterPersist: result => tokenStore.write(result.token!),
  rollbackPersist: () => tokenStore.restore(previousSnapshot)
})
```

`afterPersist` runs **after identity writes, before transaction commit**, not
after durable commit. Keep it short; do not use it for navigation or irreversible
side effects. Capture the external store's previous values before writing, and
restore them in `rollbackPersist`. Dexie rolls back its own transaction when the
hook fails. This is compensation, not a distributed transaction: if external
storage also refuses rollback, recovery requires the application's storage
policy. A failed success-notice sink does not change a committed login to failure.
Custom `navigate` and submitting callbacks should not throw.

Payload, local, Strapi (including signup), PocketBase and Atomo use the shared
helper. Missing backend roles do not grant administrator privileges. This does
not replace server authorization or the separately designed account lifecycle.

## List queries

`Table` discards both successes and failures from superseded requests. Its latest
request owns rows, loading and error state. Refresh performs an actual reload;
failure leaves an accessible error banner and allows another query. Route changes,
unmounts and remote-to-local switches invalidate pending list responses.

`Query.signal` is optional. Pass it to the transport when supported:

```tsx
const loadOrders = async (query: Query<Order>) => {
  return fetchOrderPage({ ...query, signal: query.signal })
}
<Table columns={orderColumns} data={loadOrders} />
```

Use stable data callbacks and column definitions to avoid accidental reloads.
Statistics have their own lifecycle; do not identify a statistics request by
`pageSize === 1`. Closing an unchanged CrudTable preview does not reload the list;
a successful save invokes the existing refresh path.

## Explicit IDs and partial bulk failure

Page-relative selection remains the default and clears when a result set changes.
Opt into cross-page/sort selection with a **stable** `getRowId` callback, also
accepted by `CrudTable`. IDs must be unique within that table and retain their
string/number type. Switching the table's route identity clears selections.

```tsx
const productId = (product: Product) => product.sku
<CrudTable getRowId={productId} columns={columns} data={loadProducts}
  options={{ selection: true, minTableWidth: 1200 }} editable={editable} />
```

Off-page selected rows retain their last loaded snapshot. Revalidate current
permissions/versions on the backend before a mutation. Unselecting visible rows
does not remove selections on other pages. Without `getRowId`, reports use batch
positions; the framework does not guess `id`, `uuid` or `_id` fields.

D1 and Payload use their explicitly configured `primaryKey` for bulk updates and
deletes. A partial failure throws `BulkMutationError`, preserving the ordered
legacy `resList`, `okCount` and `failCount`, and adding:

```ts
error.outcomes // [{ id, outcome: "succeeded" | "failed" | "unknown", error? }]
```

Failed `resList` entries include `id`, `outcome` and the original `cause`.
Success entries and all-success return values retain their previous shape.
Custom adapters can throw the same error or retain the legacy ordered failure
contract. The Table banner shows counts, item identities and failure context;
only failed entries remain selected when the result list matches the submitted
batch. A malformed/missing result list conservatively retains the submitted
selection rather than guessing which rows succeeded.

Transport loss and timeouts can mean the server committed without returning an
acknowledgement. These are `unknown`, not proof of rollback. The persistent banner
instructs users to verify server state before retrying a non-idempotent operation.
An adapter can explicitly confirm `outcome: "failed"`; there is no automatic
replay or claim of an atomic transaction across separate HTTP requests.

## Layout and keyboard behavior

Use `options.minTableWidth` with column widths to scroll wide tables instead of
compressing them. Layouts give page content one vertical scroll owner and tables
their own horizontal scroll. Long submenus scroll; collapsed flyouts support
arrow navigation, Enter/Space and Escape with focus restoration.

DetailDrawer and nested previews expose dialogs, keep focus inside the active
panel, restore the invoking control on close, and preserve parent drafts when a
nested save fails. Built-in inputs and selection/filter controls have native
names. Custom field/filter components still own their labels and keyboard support.
Related record load failure is visible and retryable rather than an endless
loading placeholder. Built-in messages are supplied in English and Chinese.

Browser coverage uses synthetic orders/products and real IndexedDB; it does not
log in with production accounts or validate business-specific backend semantics.

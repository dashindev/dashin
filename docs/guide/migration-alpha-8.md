# Migrating to 2.0.0-alpha.8

`2.0.0-alpha.8` introduces a strict mutation contract across the core request
helper, tables, drawers, and the Payload and D1 connectors. This page describes
the migration for the upcoming prerelease; it does not indicate that the package
has already been published.

## Standard CRUD users

Most applications using `CrudTable`, `editableCtrl`, and `bulkDeleteCtrl` do not
need code changes. Failed create, update, delete, and bulk requests now reject,
remain visible for correction or retry, and no longer emit a success state.

Keep all related `@dashin-dev/*` packages on the same prerelease version when you
eventually upgrade.

## Custom asynchronous actions

Custom `Action.onClick` implementations must return the Promise representing the
operation. An `async` function already does this:

```tsx
// Correct: Table can await success or catch failure.
const action = {
  icon: "archive",
  onClick: async (_event, rows) => {
    await archiveRows(rows)
  }
}
```

Avoid fire-and-forget callbacks:

```tsx
// Incorrect: this returns void before archiveRows finishes.
const action = {
  icon: "archive",
  onClick: (_event, rows) => {
    archiveRows(rows)
  }
}
```

The public type now permits `void | Promise<void>`, preserving synchronous
actions while documenting the asynchronous contract.

## Custom request handling

- `checkBusinessErrors` remains disabled by default.
- Use `checkBusinessErrors: true` only for endpoints that encode mutations errors
  in HTTP 2xx bodies.
- Custom discriminators return a non-empty string or `true` for failure, and
  `false`, `undefined`, or `null` for success/no detected error.
- `legacyResolveError` is a temporary compatibility escape hatch. Do not use it
  in new integrations.

See the full [strict mutation contract](/features/strict-mutation-contract) for
error shapes and partial bulk retry behavior.

## Downstream safety layers

Do not remove application-level mutation guards merely because this migration is
documented. Remove them only after the released packages have been installed and
the application's top-level CRUD, nested editing, custom actions, and bulk paths
have passed their own negative-path acceptance tests.

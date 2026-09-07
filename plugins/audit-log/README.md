# @dashin-dev/audit-log

Enterprise SOC 2 / ISO 27001 Compliance Audit Trail and Change-Diff Tracker for Dashin.

## Features

- **Immutable Audit Ledger**: Record who changed what, when, why, and from what IP address.
- **Granular Field Diffs**: Computes deep differences between before-state and after-state of CRUD operations.
- **Automatic Sensitive Field Masking**: Automatically replaces passwords, API tokens, credit cards, and private keys with masking placeholders.
- **Noise Filtering**: Automatically ignores transient timestamps (e.g. `updated_at`) to prevent noise in compliance reports.
- **Visual Diff UI**: Pre-built `<AuditDiffViewer />` and `<AuditLogDrawer />` with Dashin design tokens.
- **SOC2 Export**: Export audit logs in standard JSON / CSV format for security auditor review.

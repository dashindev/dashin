# Layout & Regions

The admin shell (`DefaultLayout`) is configured through a **layout registry** — a
constrained set of pre-designed options, so any combination looks professional by
construction (and the AI can compose it).

## LayoutConfig

`src/utils/themes/layouts.ts` defines `LayoutConfig` + the `LAYOUT_A` baseline:

| Option | Values | Effect |
| --- | --- | --- |
| `statBand` | `boolean` | KPI card band above content |
| `sidebarFooter` | `none` / `upgrade` / `stats` | left-menu footer slot |
| `buttons` | `icon` / `labeled` | action button style |
| `density` | `comfortable` / `compact` | table row density |

Pass a config (and optional region data) to `DefaultLayout`:

```tsx
<DefaultLayout
  layout={{ ...LAYOUT_A, statBand: true, sidebarFooter: "upgrade" }}
  stats={[{ label: "Total Posts", value: "128", delta: "+12%", trend: "up", spark: [4,6,5,8,9] }]}
  sidebarUpgrade={{ title: "Pro", description: "Unlock more", cta: "Upgrade" }}
>
  {children}
</DefaultLayout>
```

## Regions

- **StatBand** — KPI cards with optional sparklines; renders only when
  `layout.statBand` and `stats` are provided (scoped to list views by default).
- **SidebarFooter** — renders an `upgrade` card or a `stats` overview per
  `layout.sidebarFooter`.

`resolveLayout()` validates a (partial) config against the registry — the same
constrained-contract pattern the AI uses, so future `ai`-driven layout selection
is always valid. New layouts can be added to the registry without touching the
renderer.

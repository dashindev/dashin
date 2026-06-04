# UI Primitives

Token-driven building blocks exported from `@dashin-dev/dashin`. Every primitive
is styled with design tokens (`--bn-*`), so they adapt to themes and dark mode
automatically.

```tsx
import { Button, Input, Badge, Card } from "@dashin-dev/dashin"
```

## Button

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Save
</Button>
```

- `variant`: `primary` | `outline` | `ghost` | `danger` | `link`
- `size`: `sm` | `md`
- Extends native `<button>` props.

## Input

```tsx
<Input placeholder="Type here…" value={value} onChange={onChange} />
```

Extends native `<input>` props (`forwardRef` enabled).

## Select

```tsx
<Select value={value} onChange={onChange}>
  <option>One</option>
  <option>Two</option>
</Select>
```

Extends native `<select>` props (`forwardRef` enabled).

## Textarea

```tsx
<Textarea rows={4} placeholder="Notes…" />
```

Extends native `<textarea>` props (`forwardRef` enabled).

## Card

```tsx
<Card className="p-4">Card body</Card>
```

Surface container (border + elevation). Extends native `<div>` props.

## Badge

```tsx
<Badge variant="success">Active</Badge>
```

`variant`: `default` | `success` | `warning` | `danger` | `outline`.

## Avatar

```tsx
<Avatar src="/me.png" alt="Jane" fallback="JD" size="md" />
```

- `size`: `sm` | `md` | `lg`
- Renders `src` image, falling back to `fallback` initials.

## Toggle

```tsx
<Toggle checked={on} onChange={setOn} />
```

Switch control. `checked: boolean`, `onChange: (checked: boolean) => void`.

## Tooltip

```tsx
<Tooltip content="Hello">
  <Button variant="ghost">Hover me</Button>
</Tooltip>
```

Wraps a single child; shows `content` on hover/focus.

## Label

```tsx
<Label htmlFor="email">Email</Label>
```

Extends native `<label>` props (`forwardRef` enabled).

## Dropdown

```tsx
<Dropdown
  trigger={<Button>Menu</Button>}
  items={[
    { label: "Edit", onClick: onEdit },
    { label: "Delete", onClick: onDelete }
  ]}
/>
```

- `trigger: ReactNode`
- `items: { label, onClick?, disabled? }[]`
- Closes on outside click.

## Modal

```tsx
<Modal open={open} onClose={() => setOpen(false)}>
  <h3>Title</h3>
  <p>Body…</p>
</Modal>
```

Native `<dialog>`-based. `open: boolean`, `onClose: () => void`.

## Tabs

```tsx
<Tabs
  defaultIndex={0}
  tabs={[
    { label: "Profile", content: <Profile /> },
    { label: "Settings", content: <Settings /> }
  ]}
/>
```

`tabs: { label, content }[]`, optional `defaultIndex: number`.

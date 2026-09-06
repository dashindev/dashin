# @dashin-dev/field-blocks

Visual drag-and-drop block canvas editor and form field component for [Dashin](https://dashin.dev). Enables visual page building, block-based CMS content editing, and structured JSON layout design.

## Features

- **Interactive Canvas**: Drag-and-drop node canvas with grid snapping, zooming, panning, and alignment tools.
- **Node Component Library**: Pre-configured UI blocks (Text, Heading, Button, Image, Video), Form blocks (Input, Textarea, Select, Checkbox, Switch, DatePicker), Layout blocks (Container, Grid, Flex, Card, Tabs), and Data blocks (Table, Chart, List).
- **History & Shortcuts**: Full Undo/Redo stack with keyboard shortcuts (`Ctrl+Z` / `Ctrl+Y`).
- **Templates & JSON I/O**: Pre-built starter templates (Contact Form, Dashboard Overview) with instant JSON import/export.
- **Dashin Design System**: Built natively on Dashin's Tailwind design tokens (`bg-content-box`, `border-bn-border`, `rounded-bn`, `text-foreground`) and token-driven UI primitives. Seamless dark/light theme switching.
- **Formik & CrudTable Integration**: Compact cell badge previewer (`BlocksPreviewer`) for data tables, and full-screen modal editor (`BlocksField`) for record drawers.

## Installation

```bash
yarn add @dashin-dev/field-blocks @dashin-dev/dashin
# or
pnpm add @dashin-dev/field-blocks @dashin-dev/dashin
```

## Usage

### In a Form or DetailDrawer

Use `BlocksField` to render a field that opens the visual canvas editor:

```tsx
import React, { useState } from 'react'
import { BlocksField, FlowCanvasValue } from '@dashin-dev/field-blocks'

export function PageEditor() {
  const [blocks, setBlocks] = useState<FlowCanvasValue>({ nodes: [] })

  return (
    <BlocksField
      label="Landing Page Blocks"
      value={blocks}
      onChange={setBlocks}
    />
  )
}
```

### In a Table Column Definition

Use `BlocksPreviewer` to render compact block badges in table rows:

```tsx
import { BlocksPreviewer } from '@dashin-dev/field-blocks'

const columns = [
  { title: 'Page Title', field: 'title' },
  {
    title: 'Content Blocks',
    field: 'content',
    render: row => <BlocksPreviewer value={row.content} />
  }
]
```

### Standalone Visual Canvas

Use `EnhancedBlocksEditor` directly for custom full-page builder workflows:

```tsx
import { EnhancedBlocksEditor } from '@dashin-dev/field-blocks'

export function CustomBuilder() {
  return (
    <div className="h-screen p-4">
      <EnhancedBlocksEditor
        value={canvasData}
        onChange={handleCanvasChange}
      />
    </div>
  )
}
```

## License

Apache-2.0

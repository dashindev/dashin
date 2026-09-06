import { FlowCanvasValue } from './types'

export interface BlocksPreviewerProps {
  value?: FlowCanvasValue | string
  className?: string
}

export function BlocksPreviewer({ value, className = '' }: BlocksPreviewerProps) {
  let parsed: FlowCanvasValue = { nodes: [] }

  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value)
    } catch {
      parsed = { nodes: [] }
    }
  } else if (value && Array.isArray(value.nodes)) {
    parsed = value
  }

  const nodes = parsed.nodes || []

  if (nodes.length === 0) {
    return (
      <div className={'p-3 text-center text-xs text-icon-muted border border-dashed border-bn-border rounded-bn ' + className}>
        Empty blocks canvas
      </div>
    )
  }

  return (
    <div className={'p-3 bg-content-box border border-bn-border rounded-bn space-y-2 ' + className}>
      <div className="flex items-center justify-between text-xs text-icon-muted border-b border-bn-border pb-1">
        <span className="font-semibold uppercase tracking-wider">Blocks ({nodes.length})</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {nodes.map(node => (
          <span
            key={node.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-content-bg border border-bn-border text-foreground"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-medium">{node.data?.label || node.type}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Layout, Maximize2, Edit3 } from 'lucide-react'
import { Label, Button } from '@dashin-dev/dashin'
import { FlowCanvasValue } from './types'
import { EnhancedBlocksEditor } from './EnhancedBlocksEditor'
import { BlocksPreviewer } from './BlocksPreviewer'

export interface BlocksFieldProps {
  value?: FlowCanvasValue | string
  onChange?: (value: FlowCanvasValue) => void
  label?: string
  readOnly?: boolean
  error?: string
}

export function BlocksField({
  value,
  onChange,
  label = 'Visual Blocks Canvas',
  readOnly = false,
  error
}: BlocksFieldProps) {
  const [isOpen, setIsOpen] = useState(false)

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

  const nodeCount = parsed.nodes?.length || 0

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Layout className="h-3.5 w-3.5 text-primary" />
            <span>{label}</span>
          </Label>
          {!readOnly && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="text-xs font-normal p-0 h-auto flex items-center gap-1"
            >
              <Edit3 className="h-3 w-3" />
              <span>{nodeCount > 0 ? 'Edit Canvas (' + nodeCount + ')' : 'Open Canvas Editor'}</span>
            </Button>
          )}
        </div>
      )}

      {/* Read-only preview */}
      <BlocksPreviewer value={parsed} />

      {error && <div className="text-xs text-red-500">{error}</div>}

      {/* Fullscreen / Modal Editor */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-content-box border border-bn-border rounded-bn shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="h-12 border-b border-bn-border px-4 flex items-center justify-between bg-content-box">
              <div className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-sm text-foreground">{label} — Visual Canvas</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Close & Save
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-3">
              <EnhancedBlocksEditor
                value={parsed}
                onChange={onChange}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useCallback, useEffect } from 'react'
import {
  Undo2,
  Redo2,
  Download,
  LayoutTemplate,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react'
import { Card, Button, Textarea } from '@dashin-dev/dashin'
import { FlowCanvas } from './BlocksEditor'
import {
  FlowNode,
  FlowCanvasValue,
  CanvasTemplate,
  HistoryState
} from './types'

export const defaultCanvasTemplates: CanvasTemplate[] = [
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Lead generation and contact form',
    preview: '??',
    data: {
      nodes: [
        {
          id: 'form-container',
          type: 'container',
          position: { x: 40, y: 30 },
          size: { width: 340, height: 380 },
          data: { label: 'Contact Container' }
        },
        {
          id: 'heading-1',
          type: 'heading',
          position: { x: 60, y: 50 },
          size: { width: 280, height: 50 },
          data: { label: 'Form Heading', content: { text: 'Get in Touch' } }
        },
        {
          id: 'input-name',
          type: 'input',
          position: { x: 60, y: 110 },
          size: { width: 280, height: 45 },
          data: { label: 'Name Input', content: { text: 'Your Name' } }
        },
        {
          id: 'input-email',
          type: 'input',
          position: { x: 60, y: 170 },
          size: { width: 280, height: 45 },
          data: { label: 'Email Input', content: { text: 'user@example.com' } }
        },
        {
          id: 'textarea-msg',
          type: 'textarea',
          position: { x: 60, y: 230 },
          size: { width: 280, height: 80 },
          data: { label: 'Message Textarea', content: { text: 'Your message here...' } }
        },
        {
          id: 'btn-submit',
          type: 'button',
          position: { x: 60, y: 330 },
          size: { width: 140, height: 45 },
          data: { label: 'Submit Button', content: { text: 'Send Message' } }
        }
      ],
      connections: []
    }
  },
  {
    id: 'dashboard-layout',
    name: 'Dashboard Overview',
    description: 'Analytics metrics and data tables',
    preview: '??',
    data: {
      nodes: [
        {
          id: 'dash-header',
          type: 'heading',
          position: { x: 40, y: 20 },
          size: { width: 400, height: 50 },
          data: { label: 'Page Title', content: { text: 'Executive Dashboard' } }
        },
        {
          id: 'card-1',
          type: 'card',
          position: { x: 40, y: 80 },
          size: { width: 150, height: 90 },
          data: { label: 'Total Revenue', content: { text: '$128,450' } }
        },
        {
          id: 'card-2',
          type: 'card',
          position: { x: 210, y: 80 },
          size: { width: 150, height: 90 },
          data: { label: 'Active Users', content: { text: '3,842' } }
        },
        {
          id: 'card-3',
          type: 'card',
          position: { x: 380, y: 80 },
          size: { width: 150, height: 90 },
          data: { label: 'Conversion Rate', content: { text: '14.2%' } }
        },
        {
          id: 'main-chart',
          type: 'chart',
          position: { x: 40, y: 190 },
          size: { width: 320, height: 220 },
          data: { label: 'Sales Growth Chart' }
        },
        {
          id: 'main-table',
          type: 'table',
          position: { x: 380, y: 190 },
          size: { width: 300, height: 220 },
          data: { label: 'Recent Transactions' }
        }
      ],
      connections: []
    }
  }
]

export interface EnhancedFlowCanvasProps {
  value?: FlowCanvasValue
  onChange?: (value: FlowCanvasValue) => void
  disabled?: boolean
  error?: string
  mode?: 'edit' | 'preview'
  templates?: CanvasTemplate[]
  maxHistory?: number
}

export function EnhancedFlowCanvas({
  value = { nodes: [], connections: [] },
  onChange,
  disabled = false,
  error,
  mode = 'edit',
  templates = defaultCanvasTemplates,
  maxHistory = 50
}: EnhancedFlowCanvasProps) {
  const [history, setHistory] = useState<HistoryState[]>([
    { nodes: value.nodes || [], connections: value.connections || [], timestamp: Date.now() }
  ])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showJsonModal, setShowJsonModal] = useState(false)
  const [jsonString, setJsonString] = useState('')

  const handleCanvasChange = useCallback((nextVal: FlowCanvasValue) => {
    if (onChange) {
      onChange(nextVal)
    }

    const state: HistoryState = {
      nodes: nextVal.nodes || [],
      connections: nextVal.connections || [],
      timestamp: Date.now()
    }

    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1)
      sliced.push(state)
      if (sliced.length > maxHistory) {
        return sliced.slice(-maxHistory)
      }
      return sliced
    })
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex, maxHistory, onChange])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const target = history[historyIndex - 1]
      setHistoryIndex(historyIndex - 1)
      if (onChange) {
        onChange({ nodes: target.nodes, connections: target.connections })
      }
    }
  }, [history, historyIndex, onChange])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const target = history[historyIndex + 1]
      setHistoryIndex(historyIndex + 1)
      if (onChange) {
        onChange({ nodes: target.nodes, connections: target.connections })
      }
    }
  }, [history, historyIndex, onChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const applyTemplate = (t: CanvasTemplate) => {
    handleCanvasChange(t.data)
  }

  const exportJson = () => {
    setJsonString(JSON.stringify(value, null, 2))
    setShowJsonModal(true)
  }

  const importJson = () => {
    try {
      const parsed = JSON.parse(jsonString)
      if (parsed && Array.isArray(parsed.nodes)) {
        handleCanvasChange(parsed)
        setShowJsonModal(false)
      }
    } catch {
      alert('Invalid Canvas JSON')
    }
  }

  const alignNodes = (direction: 'left' | 'center' | 'right' | 'top') => {
    const nodes = value.nodes || []
    if (nodes.length < 2) return
    let updated: FlowNode[] = []

    if (direction === 'left') {
      const minX = Math.min(...nodes.map(n => n.position.x))
      updated = nodes.map(n => ({ ...n, position: { ...n.position, x: minX } }))
    } else if (direction === 'center') {
      const avgX = Math.round(nodes.reduce((acc, n) => acc + n.position.x, 0) / nodes.length)
      updated = nodes.map(n => ({ ...n, position: { ...n.position, x: avgX } }))
    } else if (direction === 'right') {
      const maxX = Math.max(...nodes.map(n => n.position.x))
      updated = nodes.map(n => ({ ...n, position: { ...n.position, x: maxX } }))
    } else if (direction === 'top') {
      const minY = Math.min(...nodes.map(n => n.position.y))
      updated = nodes.map(n => ({ ...n, position: { ...n.position, y: minY } }))
    }

    handleCanvasChange({ ...value, nodes: updated })
  }

  return (
    <div className="space-y-2">
      {/* Enhanced Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-content-box border border-bn-border rounded-bn text-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={historyIndex <= 0 || disabled}
            onClick={undo}
            className="p-1.5 rounded-bn border border-bn-border hover:bg-content-bg disabled:opacity-40 text-foreground"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={historyIndex >= history.length - 1 || disabled}
            onClick={redo}
            className="p-1.5 rounded-bn border border-bn-border hover:bg-content-bg disabled:opacity-40 text-foreground"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-bn-border mx-1" />

          <button
            type="button"
            onClick={() => alignNodes('left')}
            className="p-1.5 rounded-bn hover:bg-content-bg text-icon-muted hover:text-foreground"
            title="Align Left"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => alignNodes('center')}
            className="p-1.5 rounded-bn hover:bg-content-bg text-icon-muted hover:text-foreground"
            title="Align Center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => alignNodes('right')}
            className="p-1.5 rounded-bn hover:bg-content-bg text-icon-muted hover:text-foreground"
            title="Align Right"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => alignNodes('top')}
            className="p-1.5 rounded-bn hover:bg-content-bg text-icon-muted hover:text-foreground"
            title="Align Top"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {templates.map(tpl => (
            <button
              key={tpl.id}
              type="button"
              disabled={disabled}
              onClick={() => applyTemplate(tpl)}
              className="px-2 py-1 rounded-bn border border-bn-border hover:bg-content-bg flex items-center gap-1 text-foreground"
              title={tpl.description}
            >
              <LayoutTemplate className="h-3 w-3 text-icon-muted" />
              <span>{tpl.name}</span>
            </button>
          ))}

          <div className="h-4 w-px bg-bn-border mx-1" />

          <button
            type="button"
            onClick={exportJson}
            className="p-1.5 rounded-bn border border-bn-border hover:bg-content-bg text-icon-muted hover:text-foreground"
            title="Export / Import JSON"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Embedded Flow Canvas */}
      <FlowCanvas
        value={value}
        onChange={handleCanvasChange}
        disabled={disabled}
        error={error}
        mode={mode}
      />

      {/* JSON Import/Export Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Canvas JSON Data</h3>
            <Textarea
              rows={12}
              value={jsonString}
              onChange={(e) => setJsonString(e.target.value)}
              className="w-full text-xs font-mono"
            />
            <div className="flex justify-end gap-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowJsonModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={importJson}
              >
                Apply JSON
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export { EnhancedFlowCanvas as EnhancedBlocksEditor }

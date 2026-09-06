import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Layers,
  Type,
  Image as ImageIcon,
  Video,
  Square,
  Circle,
  FileText,
  CheckSquare,
  ToggleLeft,
  Calendar,
  List,
  Layout,
  Columns,
  Trash2,
  Copy,
  Settings,
  MousePointer,
  Hand
} from 'lucide-react'
import {
  FlowNode,
  NodeType,
  NodeConnection,
  FlowCanvasValue,
  NodeData
} from './types'

export interface FlowCanvasProps {
  value?: FlowCanvasValue
  onChange?: (value: FlowCanvasValue) => void
  disabled?: boolean
  error?: string
  mode?: 'edit' | 'preview'
}

export const nodeLibrary = [
  {
    category: 'UI Components',
    items: [
      { type: 'text', label: 'Text', icon: Type, description: 'Static text content' },
      { type: 'heading', label: 'Heading', icon: Type, description: 'Page heading' },
      { type: 'button', label: 'Button', icon: Square, description: 'Interactive button' },
      { type: 'image', label: 'Image', icon: ImageIcon, description: 'Image display' },
      { type: 'video', label: 'Video', icon: Video, description: 'Video player' },
    ]
  },
  {
    category: 'Form Components',
    items: [
      { type: 'input', label: 'Input', icon: FileText, description: 'Text input' },
      { type: 'textarea', label: 'Multiline', icon: FileText, description: 'Multiline text' },
      { type: 'select', label: 'Dropdown', icon: List, description: 'Option selection' },
      { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Multiple selection' },
      { type: 'switch', label: 'Switch', icon: ToggleLeft, description: 'Boolean value' },
      { type: 'datepicker', label: 'Date Picker', icon: Calendar, description: 'Date and time' },
    ]
  },
  {
    category: 'Layout Components',
    items: [
      { type: 'container', label: 'Container', icon: Square, description: 'Layout container' },
      { type: 'grid', label: 'Grid', icon: Grid3X3, description: 'Grid layout' },
      { type: 'flex', label: 'Flexbox', icon: Columns, description: 'Flexbox layout' },
      { type: 'card', label: 'Card', icon: Layout, description: 'Content card' },
      { type: 'tabs', label: 'Tabs', icon: Layers, description: 'Tabbed panels' },
    ]
  },
  {
    category: 'Data Components',
    items: [
      { type: 'table', label: 'Table', icon: Grid3X3, description: 'Data table' },
      { type: 'chart', label: 'Chart', icon: Circle, description: 'Data visualization' },
      { type: 'list', label: 'List', icon: List, description: 'Data list' },
      { type: 'form', label: 'Form', icon: FileText, description: 'Form container' },
    ]
  }
]

export function FlowCanvas({
  value = { nodes: [], connections: [] },
  onChange,
  disabled = false,
  error,
  mode = 'edit'
}: FlowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasState, setCanvasState] = useState({
    zoom: 1,
    pan: { x: 0, y: 0 },
    tool: 'select' as 'select' | 'hand',
    showGrid: true,
    snapToGrid: true,
    gridSize: 20
  })

  const [activeTab, setActiveTab] = useState<'components' | 'layers' | 'properties'>('components')
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    startPos: { x: number; y: number }
  }>({
    isDragging: false,
    startPos: { x: 0, y: 0 }
  })

  const nodes = value?.nodes || []
  const connections = value?.connections || []

  const updateAll = useCallback((newNodes: FlowNode[], newConnections: NodeConnection[] = connections) => {
    if (onChange) {
      onChange({ nodes: newNodes, connections: newConnections })
    }
  }, [connections, onChange])

  const addNode = useCallback((type: NodeType, position?: { x: number; y: number }) => {
    const id = 'node_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
    const newNode: FlowNode = {
      id,
      type,
      position: position || { x: 60, y: 60 },
      size: getDefaultNodeSize(type),
      data: getDefaultNodeData(type)
    }
    updateAll([...nodes, newNode])
    setSelectedNodes([newNode.id])
    setActiveTab('properties')
  }, [nodes, updateAll])

  const updateNode = useCallback((nodeId: string, updates: Partial<FlowNode>) => {
    const updated = nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    )
    updateAll(updated)
  }, [nodes, updateAll])

  const deleteNode = useCallback((nodeId: string) => {
    const updatedNodes = nodes.filter(node => node.id !== nodeId)
    const updatedConns = connections.filter(conn => conn.source !== nodeId && conn.target !== nodeId)
    updateAll(updatedNodes, updatedConns)
    setSelectedNodes(prev => prev.filter(id => id !== nodeId))
  }, [nodes, connections, updateAll])

  const duplicateNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (node) {
      const id = 'node_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
      const newNode: FlowNode = {
        ...node,
        id,
        position: {
          x: node.position.x + 20,
          y: node.position.y + 20
        }
      }
      updateAll([...nodes, newNode])
      setSelectedNodes([newNode.id])
    }
  }, [nodes, updateAll])

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (disabled || mode === 'preview') return
    e.stopPropagation()
    setDragState({
      isDragging: true,
      startPos: { x: e.clientX, y: e.clientY }
    })
    setSelectedNodes([nodeId])
  }, [disabled, mode])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || selectedNodes.length === 0) return
    const deltaX = e.clientX - dragState.startPos.x
    const deltaY = e.clientY - dragState.startPos.y

    const updated = nodes.map(node => {
      if (selectedNodes.includes(node.id) && !node.locked) {
        let newX = node.position.x + deltaX
        let newY = node.position.y + deltaY
        if (canvasState.snapToGrid) {
          newX = Math.round(newX / canvasState.gridSize) * canvasState.gridSize
          newY = Math.round(newY / canvasState.gridSize) * canvasState.gridSize
        }
        return {
          ...node,
          position: { x: newX, y: newY }
        }
      }
      return node
    })

    updateAll(updated)
    setDragState(prev => ({ ...prev, startPos: { x: e.clientX, y: e.clientY } }))
  }, [dragState.isDragging, dragState.startPos, selectedNodes, nodes, canvasState.snapToGrid, canvasState.gridSize, updateAll])

  const handleMouseUp = useCallback(() => {
    setDragState({ isDragging: false, startPos: { x: 0, y: 0 } })
  }, [])

  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp])

  if (mode === 'preview') {
    return <CanvasPreview nodes={nodes} />
  }

  const selectedNode = nodes.find(n => selectedNodes.includes(n.id))

  return (
    <div className={'flex h-[560px] border border-bn-border rounded-bn overflow-hidden bg-content-box ' + (error ? 'border-red-500' : '')}>
      {/* Sidebar Panel */}
      <div className="w-64 border-r border-bn-border flex flex-col bg-content-box">
        <div className="flex border-b border-bn-border text-xs font-medium">
          <button
            type="button"
            className={'flex-1 py-2 text-center transition-colors ' + (activeTab === 'components' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-icon-muted hover:text-foreground')}
            onClick={() => setActiveTab('components')}
          >
            Components
          </button>
          <button
            type="button"
            className={'flex-1 py-2 text-center transition-colors ' + (activeTab === 'layers' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-icon-muted hover:text-foreground')}
            onClick={() => setActiveTab('layers')}
          >
            Layers ({nodes.length})
          </button>
          <button
            type="button"
            className={'flex-1 py-2 text-center transition-colors ' + (activeTab === 'properties' ? 'border-b-2 border-primary text-primary font-semibold' : 'text-icon-muted hover:text-foreground')}
            onClick={() => setActiveTab('properties')}
          >
            Inspector
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 text-sm">
          {activeTab === 'components' && (
            <div className="space-y-4">
              {nodeLibrary.map(cat => (
                <div key={cat.category}>
                  <div className="text-xs font-semibold text-icon-muted uppercase tracking-wider mb-2">{cat.category}</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {cat.items.map(item => {
                      const IconComp = item.icon
                      return (
                        <button
                          key={item.type}
                          type="button"
                          disabled={disabled}
                          onClick={() => addNode(item.type as NodeType)}
                          className="flex flex-col items-center justify-center p-2 rounded-bn border border-bn-border hover:bg-content-bg text-center transition-colors text-foreground"
                          title={item.description}
                        >
                          <IconComp className="h-4 w-4 mb-1 text-icon-muted" />
                          <span className="text-xs">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'layers' && (
            <div className="space-y-1">
              {nodes.length === 0 ? (
                <div className="text-center py-6 text-icon-muted text-xs">No blocks added</div>
              ) : (
                nodes.map(node => (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNodes([node.id])
                      setActiveTab('properties')
                    }}
                    className={'flex items-center justify-between p-2 rounded-bn cursor-pointer text-xs ' + (selectedNodes.includes(node.id) ? 'bg-primary-50 text-primary font-medium' : 'hover:bg-content-bg text-foreground')}
                  >
                    <span className="truncate flex-1">{node.data.label || node.type}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateNode(node.id)
                        }}
                        className="p-1 hover:text-foreground text-icon-muted"
                        title="Duplicate"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNode(node.id)
                        }}
                        className="p-1 hover:text-red-500 text-icon-muted"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'properties' && (
            <div>
              {!selectedNode ? (
                <div className="text-center py-8 text-icon-muted text-xs">
                  <Settings className="h-6 w-6 mx-auto mb-2 opacity-40" />
                  Select a block on canvas to inspect
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-icon-muted mb-1">Block Label</label>
                    <input
                      type="text"
                      value={selectedNode.data.label || ''}
                      onChange={(e) => updateNode(selectedNode.id, {
                        data: { ...selectedNode.data, label: e.target.value }
                      })}
                      className="w-full px-2 py-1.5 border border-bn-border rounded-bn bg-content-box text-foreground text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-icon-muted mb-1">X Position</label>
                      <input
                        type="number"
                        value={selectedNode.position.x}
                        onChange={(e) => updateNode(selectedNode.id, {
                          position: { ...selectedNode.position, x: Number(e.target.value) }
                        })}
                        className="w-full px-2 py-1.5 border border-bn-border rounded-bn bg-content-box text-foreground text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-icon-muted mb-1">Y Position</label>
                      <input
                        type="number"
                        value={selectedNode.position.y}
                        onChange={(e) => updateNode(selectedNode.id, {
                          position: { ...selectedNode.position, y: Number(e.target.value) }
                        })}
                        className="w-full px-2 py-1.5 border border-bn-border rounded-bn bg-content-box text-foreground text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-icon-muted mb-1">Width</label>
                      <input
                        type="number"
                        value={selectedNode.size.width}
                        onChange={(e) => updateNode(selectedNode.id, {
                          size: { ...selectedNode.size, width: Number(e.target.value) }
                        })}
                        className="w-full px-2 py-1.5 border border-bn-border rounded-bn bg-content-box text-foreground text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-icon-muted mb-1">Height</label>
                      <input
                        type="number"
                        value={selectedNode.size.height}
                        onChange={(e) => updateNode(selectedNode.id, {
                          size: { ...selectedNode.size, height: Number(e.target.value) }
                        })}
                        className="w-full px-2 py-1.5 border border-bn-border rounded-bn bg-content-box text-foreground text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-icon-muted mb-1">Content / Text</label>
                    <input
                      type="text"
                      value={selectedNode.data.content?.text || ''}
                      onChange={(e) => updateNode(selectedNode.id, {
                        data: {
                          ...selectedNode.data,
                          content: { ...(selectedNode.data.content || {}), text: e.target.value }
                        }
                      })}
                      className="w-full px-2 py-1.5 border border-bn-border rounded-bn bg-content-box text-foreground text-xs"
                      placeholder="Display text"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col bg-content-bg">
        {/* Canvas Toolbar */}
        <div className="h-10 border-b border-bn-border bg-content-box flex items-center justify-between px-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={'p-1.5 rounded-bn ' + (canvasState.tool === 'select' ? 'bg-primary-50 text-primary' : 'text-icon-muted hover:text-foreground')}
              onClick={() => setCanvasState(prev => ({ ...prev, tool: 'select' }))}
              title="Select Tool"
            >
              <MousePointer className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={'p-1.5 rounded-bn ' + (canvasState.tool === 'hand' ? 'bg-primary-50 text-primary' : 'text-icon-muted hover:text-foreground')}
              onClick={() => setCanvasState(prev => ({ ...prev, tool: 'hand' }))}
              title="Hand Tool"
            >
              <Hand className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-bn-border mx-1" />
            <button
              type="button"
              className="p-1.5 rounded-bn text-icon-muted hover:text-foreground"
              onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 0.1, 2) }))}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <span className="text-xs text-icon-muted px-1">{Math.round(canvasState.zoom * 100)}%</span>
            <button
              type="button"
              className="p-1.5 rounded-bn text-icon-muted hover:text-foreground"
              onClick={() => setCanvasState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 0.1, 0.4) }))}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className={'p-1.5 rounded-bn flex items-center gap-1 text-xs ' + (canvasState.showGrid ? 'bg-primary-50 text-primary font-medium' : 'text-icon-muted hover:text-foreground')}
              onClick={() => setCanvasState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden"
          style={{
            backgroundImage: canvasState.showGrid
              ? 'radial-gradient(circle, rgba(150,150,150,0.25) 1px, transparent 1px)'
              : 'none',
            backgroundSize: canvasState.showGrid
              ? (canvasState.gridSize + 'px ' + canvasState.gridSize + 'px')
              : 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedNodes([])
            }
          }}
        >
          {nodes.map(node => (
            <NodeRenderer
              key={node.id}
              node={node}
              selected={selectedNodes.includes(node.id)}
              zoom={canvasState.zoom}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function NodeRenderer({
  node,
  selected,
  zoom,
  onMouseDown,
  disabled
}: {
  node: FlowNode
  selected: boolean
  zoom: number
  onMouseDown: (e: React.MouseEvent) => void
  disabled: boolean
}) {
  return (
    <div
      className={'absolute bg-content-box border-2 rounded-bn shadow-bn select-none transition-shadow ' + (selected ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-bn-border') + ' ' + (disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-move')}
      style={{
        left: node.position.x * zoom,
        top: node.position.y * zoom,
        width: node.size.width * zoom,
        height: node.size.height * zoom,
        transform: 'scale(' + zoom + ')',
        transformOrigin: 'top left'
      }}
      onMouseDown={onMouseDown}
    >
      <div className="p-2 h-full flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground truncate mb-0.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="truncate">{node.data.label || node.type}</span>
          </div>
          <div className="text-[11px] text-icon-muted truncate">
            {node.data.content?.text || (node.type + ' block')}
          </div>
        </div>
        <div className="text-[10px] text-icon-muted uppercase tracking-wider font-mono">
          {node.type}
        </div>
      </div>
    </div>
  )
}

function CanvasPreview({ nodes }: { nodes: FlowNode[] }) {
  return (
    <div className="p-4 bg-content-box border border-bn-border rounded-bn space-y-3">
      <div className="text-xs font-semibold text-icon-muted uppercase tracking-wider">Canvas Preview ({nodes.length} blocks)</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {nodes.map(node => (
          <div key={node.id} className="p-3 border border-bn-border rounded-bn bg-content-bg">
            <div className="font-medium text-sm text-foreground">{node.data.label || node.type}</div>
            <div className="text-xs text-icon-muted mt-1">{node.data.content?.text || ('[' + node.type + ']')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getDefaultNodeSize(type: NodeType) {
  switch (type) {
    case 'text': return { width: 180, height: 60 }
    case 'heading': return { width: 240, height: 70 }
    case 'button': return { width: 120, height: 45 }
    case 'image': return { width: 200, height: 140 }
    case 'container': return { width: 280, height: 180 }
    case 'input': return { width: 200, height: 50 }
    case 'table': return { width: 320, height: 200 }
    default: return { width: 160, height: 80 }
  }
}

function getDefaultNodeData(type: NodeType): NodeData {
  switch (type) {
    case 'text':
      return { label: 'Text Block', content: { text: 'Paragraph text' } }
    case 'heading':
      return { label: 'Section Heading', content: { text: 'Title Heading' } }
    case 'button':
      return { label: 'Action Button', content: { text: 'Submit' } }
    case 'input':
      return { label: 'Input Field', content: { text: 'Placeholder value' } }
    default:
      return { label: type.toUpperCase() + ' Block' }
  }
}

export { FlowCanvas as BlocksEditor }

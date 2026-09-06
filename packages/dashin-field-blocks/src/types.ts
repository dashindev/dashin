import React from 'react'

export type NodeType =
  | 'text' | 'heading' | 'button' | 'image' | 'video'
  | 'input' | 'textarea' | 'select' | 'checkbox' | 'switch' | 'datepicker'
  | 'container' | 'grid' | 'flex' | 'card' | 'tabs'
  | 'table' | 'chart' | 'list' | 'form'
  | 'custom'

export interface FlowNodePosition {
  x: number
  y: number
}

export interface FlowNodeSize {
  width: number
  height: number
}

export interface NodeData {
  label?: string
  content?: Record<string, any>
  properties?: Record<string, any>
  events?: Record<string, any>
  styles?: Record<string, any>
}

export interface FlowNode {
  id: string
  type: NodeType | string
  position: FlowNodePosition
  size: FlowNodeSize
  data: NodeData
  style?: React.CSSProperties
  selected?: boolean
  locked?: boolean
}

export interface NodeConnection {
  id: string
  source: string
  target: string
  type?: 'data' | 'event' | 'style'
  animated?: boolean
}

export interface FlowCanvasValue {
  nodes: FlowNode[]
  connections?: NodeConnection[]
}

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  preview: string
  data: FlowCanvasValue
}

export interface HistoryState {
  nodes: FlowNode[]
  connections: NodeConnection[]
  timestamp: number
}

export interface DragState {
  isDragging: boolean
  draggedNodes: string[]
  startPosition: FlowNodePosition
  currentPosition: FlowNodePosition
  offset: FlowNodePosition
  dragType: 'move' | 'resize' | 'select'
}

export interface SnapPoint {
  x: number
  y: number
  type: 'grid' | 'node' | 'guide'
  nodeId?: string
}

export interface CollisionInfo {
  hasCollision: boolean
  collidingNodes: string[]
}

export interface DragDropConfig {
  snapToGrid: boolean
  gridSize: number
  snapDistance: number
  enableCollisionDetection: boolean
  allowOverlap: boolean
  magneticSnap: boolean
}

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  FlowNode,
  FlowNodePosition,
  DragState,
  SnapPoint,
  CollisionInfo,
  DragDropConfig
} from './types'

export class DragDropManager {
  private nodes: FlowNode[] = []
  private config: DragDropConfig
  private snapPoints: SnapPoint[] = []

  constructor(config: DragDropConfig) {
    this.config = config
  }

  updateNodes(nodes: FlowNode[]) {
    this.nodes = nodes
    this.calculateSnapPoints()
  }

  updateConfig(config: Partial<DragDropConfig>) {
    this.config = { ...this.config, ...config }
  }

  private calculateSnapPoints() {
    this.snapPoints = []
    this.nodes.forEach(node => {
      const points = [
        { x: node.position.x, y: node.position.y },
        { x: node.position.x + node.size.width, y: node.position.y },
        { x: node.position.x, y: node.position.y + node.size.height },
        { x: node.position.x + node.size.width, y: node.position.y + node.size.height },
        { x: node.position.x + node.size.width / 2, y: node.position.y },
        { x: node.position.x + node.size.width / 2, y: node.position.y + node.size.height },
        { x: node.position.x, y: node.position.y + node.size.height / 2 },
        { x: node.position.x + node.size.width, y: node.position.y + node.size.height / 2 },
        { x: node.position.x + node.size.width / 2, y: node.position.y + node.size.height / 2 }
      ]

      points.forEach(point => {
        this.snapPoints.push({
          ...point,
          type: 'node',
          nodeId: node.id
        })
      })
    })
  }

  calculateSnap(position: FlowNodePosition, excludeNodes: string[] = []): FlowNodePosition {
    let snappedX = position.x
    let snappedY = position.y

    if (this.config.snapToGrid) {
      snappedX = Math.round(position.x / this.config.gridSize) * this.config.gridSize
      snappedY = Math.round(position.y / this.config.gridSize) * this.config.gridSize
    }

    if (this.config.magneticSnap) {
      const availableSnapPoints = this.snapPoints.filter(point => 
        !excludeNodes.includes(point.nodeId || '')
      )

      let closestXSnap = snappedX
      let closestYSnap = snappedY
      let minXDistance = this.config.snapDistance
      let minYDistance = this.config.snapDistance

      availableSnapPoints.forEach(point => {
        const xDistance = Math.abs(position.x - point.x)
        const yDistance = Math.abs(position.y - point.y)

        if (xDistance < minXDistance) {
          closestXSnap = point.x
          minXDistance = xDistance
        }

        if (yDistance < minYDistance) {
          closestYSnap = point.y
          minYDistance = yDistance
        }
      })

      snappedX = closestXSnap
      snappedY = closestYSnap
    }

    return { x: snappedX, y: snappedY }
  }

  checkCollision(node: FlowNode, excludeNodes: string[] = []): CollisionInfo {
    if (!this.config.enableCollisionDetection) {
      return { hasCollision: false, collidingNodes: [] }
    }

    const collidingNodes: string[] = []

    this.nodes.forEach(otherNode => {
      if (otherNode.id === node.id || excludeNodes.includes(otherNode.id)) {
        return
      }

      const isColliding = !(
        node.position.x >= otherNode.position.x + otherNode.size.width ||
        node.position.x + node.size.width <= otherNode.position.x ||
        node.position.y >= otherNode.position.y + otherNode.size.height ||
        node.position.y + node.size.height <= otherNode.position.y
      )

      if (isColliding) {
        collidingNodes.push(otherNode.id)
      }
    })

    return {
      hasCollision: collidingNodes.length > 0,
      collidingNodes
    }
  }

  getSafePosition(node: FlowNode, preferredPosition: FlowNodePosition): FlowNodePosition {
    if (this.config.allowOverlap) {
      return preferredPosition
    }

    const testNode = { ...node, position: preferredPosition }
    const collision = this.checkCollision(testNode)

    if (!collision.hasCollision) {
      return preferredPosition
    }

    const searchRadius = 50
    const step = 10

    for (let radius = step; radius <= searchRadius; radius += step) {
      for (let angle = 0; angle < 360; angle += 45) {
        const radian = (angle * Math.PI) / 180
        const testX = preferredPosition.x + Math.cos(radian) * radius
        const testY = preferredPosition.y + Math.sin(radian) * radius

        const testNodeAtNewPos = { ...node, position: { x: testX, y: testY } }
        const testCollision = this.checkCollision(testNodeAtNewPos)

        if (!testCollision.hasCollision) {
          return { x: testX, y: testY }
        }
      }
    }

    return preferredPosition
  }
}

export function useDragDrop(
  nodes: FlowNode[],
  config: DragDropConfig,
  onNodesChange: (nodes: FlowNode[]) => void
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedNodes: [],
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    dragType: 'move'
  })

  const dragManagerRef = useRef(new DragDropManager(config))

  useEffect(() => {
    dragManagerRef.current.updateNodes(nodes)
    dragManagerRef.current.updateConfig(config)
  }, [nodes, config])

  const startNodeDrag = useCallback((nodeIds: string[], startPos: FlowNodePosition) => {
    setDragState({
      isDragging: true,
      draggedNodes: nodeIds,
      startPosition: startPos,
      currentPosition: startPos,
      offset: { x: 0, y: 0 },
      dragType: 'move'
    })
  }, [])

  const updateDrag = useCallback((currentPos: FlowNodePosition) => {
    if (dragState.isDragging) {
      const offset = {
        x: currentPos.x - dragState.startPosition.x,
        y: currentPos.y - dragState.startPosition.y
      }

      setDragState(prev => ({
        ...prev,
        currentPosition: currentPos,
        offset
      }))

      const updatedNodes = nodes.map(node => {
        if (dragState.draggedNodes.includes(node.id)) {
          const newPosition = {
            x: node.position.x + offset.x,
            y: node.position.y + offset.y
          }

          const snappedPosition = dragManagerRef.current.calculateSnap(
            newPosition,
            dragState.draggedNodes
          )

          return {
            ...node,
            position: snappedPosition
          }
        }
        return node
      })

      onNodesChange(updatedNodes)
    }
  }, [dragState, nodes, onNodesChange])

  const endDrag = useCallback(() => {
    if (dragState.isDragging) {
      const finalNodes = nodes.map(node => {
        if (dragState.draggedNodes.includes(node.id)) {
          const safePosition = dragManagerRef.current.getSafePosition(
            node,
            node.position
          )
          return {
            ...node,
            position: safePosition
          }
        }
        return node
      })

      onNodesChange(finalNodes)
    }

    setDragState({
      isDragging: false,
      draggedNodes: [],
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      dragType: 'move'
    })
  }, [dragState, nodes, onNodesChange])

  return {
    dragState,
    startNodeDrag,
    updateDrag,
    endDrag
  }
}

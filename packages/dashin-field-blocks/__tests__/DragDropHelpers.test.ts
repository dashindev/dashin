import { describe, it, expect } from 'vitest'
import { DragDropManager } from '../src/DragDropHelpers'
import { FlowNode } from '../src/types'

describe('DragDropManager', () => {
  const sampleNodes: FlowNode[] = [
    {
      id: 'n1',
      type: 'text',
      position: { x: 0, y: 0 },
      size: { width: 100, height: 50 },
      data: { label: 'Node 1' }
    },
    {
      id: 'n2',
      type: 'button',
      position: { x: 200, y: 200 },
      size: { width: 100, height: 50 },
      data: { label: 'Node 2' }
    }
  ]

  it('calculates grid snapping correctly', () => {
    const mgr = new DragDropManager({
      snapToGrid: true,
      gridSize: 20,
      snapDistance: 10,
      enableCollisionDetection: false,
      allowOverlap: true,
      magneticSnap: false
    })
    mgr.updateNodes(sampleNodes)

    const snapped = mgr.calculateSnap({ x: 23, y: 39 })
    expect(snapped).toEqual({ x: 20, y: 40 })
  })

  it('detects collision when two nodes overlap', () => {
    const mgr = new DragDropManager({
      snapToGrid: false,
      gridSize: 20,
      snapDistance: 10,
      enableCollisionDetection: true,
      allowOverlap: false,
      magneticSnap: false
    })
    mgr.updateNodes(sampleNodes)

    // Test node overlapping with n1 (0,0 to 100,50)
    const overlappingNode: FlowNode = {
      id: 'n3',
      type: 'card',
      position: { x: 50, y: 20 },
      size: { width: 80, height: 40 },
      data: {}
    }

    const collision = mgr.checkCollision(overlappingNode)
    expect(collision.hasCollision).toBe(true)
    expect(collision.collidingNodes).toContain('n1')
  })

  it('detects no collision when nodes are disjoint', () => {
    const mgr = new DragDropManager({
      snapToGrid: false,
      gridSize: 20,
      snapDistance: 10,
      enableCollisionDetection: true,
      allowOverlap: false,
      magneticSnap: false
    })
    mgr.updateNodes(sampleNodes)

    const distantNode: FlowNode = {
      id: 'n3',
      type: 'card',
      position: { x: 500, y: 500 },
      size: { width: 80, height: 40 },
      data: {}
    }

    const collision = mgr.checkCollision(distantNode)
    expect(collision.hasCollision).toBe(false)
  })
})

/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { FlowCanvas } from '../src/BlocksEditor'
import { EnhancedFlowCanvas } from '../src/EnhancedBlocksEditor'

describe('BlocksEditor and EnhancedBlocksEditor', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders canvas with component library', () => {
    render(<FlowCanvas value={{ nodes: [] }} />)
    expect(screen.getByText('Components')).toBeTruthy()
    expect(screen.getByText('Layers (0)')).toBeTruthy()
    expect(screen.getByText('Inspector')).toBeTruthy()
  })

  it('allows adding a block from the library', () => {
    const handleChange = vi.fn()
    render(<FlowCanvas value={{ nodes: [] }} onChange={handleChange} />)

    const textBtn = screen.getByTitle('Static text content')
    fireEvent.click(textBtn)

    expect(handleChange).toHaveBeenCalled()
    const calledWith = handleChange.mock.calls[0][0]
    expect(calledWith.nodes.length).toBe(1)
    expect(calledWith.nodes[0].type).toBe('text')
  })

  it('renders enhanced editor with undo/redo and template tools', () => {
    render(<EnhancedFlowCanvas value={{ nodes: [] }} />)
    expect(screen.getByTitle('Undo (Ctrl+Z)')).toBeTruthy()
    expect(screen.getByTitle('Redo (Ctrl+Y)')).toBeTruthy()
    expect(screen.getByText('Contact Form')).toBeTruthy()
    expect(screen.getByText('Dashboard Overview')).toBeTruthy()
  })
})

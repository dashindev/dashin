/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { BlocksPreviewer } from '../src/BlocksPreviewer'
import { BlocksField } from '../src/BlocksField'

describe('BlocksPreviewer and BlocksField', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders previewer with empty state', () => {
    render(<BlocksPreviewer value={{ nodes: [] }} />)
    expect(screen.getByText('Empty blocks canvas')).toBeTruthy()
  })

  it('renders previewer with nodes', () => {
    render(
      <BlocksPreviewer
        value={{
          nodes: [
            { id: '1', type: 'text', position: { x: 0, y: 0 }, size: { width: 100, height: 50 }, data: { label: 'Hero Title' } }
          ]
        }}
      />
    )
    expect(screen.getByText('Blocks (1)')).toBeTruthy()
    expect(screen.getByText('Hero Title')).toBeTruthy()
  })

  it('renders BlocksField and opens modal on click', () => {
    render(
      <BlocksField
        label="Page Layout"
        value={{
          nodes: [
            { id: '1', type: 'button', position: { x: 0, y: 0 }, size: { width: 100, height: 50 }, data: { label: 'Submit' } }
          ]
        }}
      />
    )
    expect(screen.getByText('Page Layout')).toBeTruthy()
    const openBtn = screen.getByText('Edit Canvas (1)')
    fireEvent.click(openBtn)
    expect(screen.getByText(/Page Layout.*Visual Canvas/)).toBeTruthy()
  })
})

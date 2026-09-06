/**
 * @vitest-environment jsdom
 */
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { ObservabilityView } from '../src/components/ObservabilityView'
import { MetricCard } from '../src/components/MetricCard'
import { ProjectorsPanel } from '../src/components/ProjectorsPanel'

describe('Observability Components', () => {
  const mockFetcher = vi.fn()
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    mockFetcher.mockReset()
    globalThis.fetch = mockFetcher as any
  })

  afterEach(() => {
    cleanup()
    globalThis.fetch = originalFetch
  })

  it('renders MetricCard with correct value and variant', () => {
    render(<MetricCard label="failed" value={3} variant="error" />)
    expect(screen.getByText('failed')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('renders ProjectorsPanel and lists read-model projectors', () => {
    const projectors = [
      { id: 'p1', name: 'CRM Projector', currentOffset: 100, targetOffset: 100, lag: 0, status: 'running' as const }
    ]
    render(<ProjectorsPanel projectors={projectors} />)
    expect(screen.getByText('CRM Projector')).toBeTruthy()
    expect(screen.getByText('Synced')).toBeTruthy()
    expect(screen.getByText(/Offset: 100 \/ 100/)).toBeTruthy()
  })

  it('renders ObservabilityView and loads statistics from API', async () => {
    mockFetcher
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ byStatus: { queued: 5, running: 2, succeeded: 120, failed: 0, dead: 0 }, oldestQueuedSeconds: 15 })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jobs: [{ id: 'j1', name: 'sync_contacts', status: 'succeeded', duration_ms: 120 }] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projectors: [{ id: 'p1', name: 'CRM Projector', currentOffset: 50, targetOffset: 50, lag: 0, status: 'running' }] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ logs: [] })
      })

    render(<ObservabilityView baseUrl="http://test.atomo" />)

    await waitFor(() => {
      expect(screen.getByText('System Observability')).toBeTruthy()
      expect(screen.getByText('sync_contacts')).toBeTruthy()
      expect(screen.getByText('120')).toBeTruthy()
    })
  })

  it('renders admin-gated message when 403 Forbidden is returned', async () => {
    mockFetcher.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden'
    })

    render(<ObservabilityView baseUrl="http://test.atomo" />)

    await waitFor(() => {
      expect(screen.getByText('Admin-Gated Area')).toBeTruthy()
    })
  })
})

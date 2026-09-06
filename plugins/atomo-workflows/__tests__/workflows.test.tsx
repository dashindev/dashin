/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { workflowToGraph, graphToWorkflow, defaultStep } from '../src/serde'
import { Workflow } from '../src/types'
import { WorkflowGraphView } from '../src/components/WorkflowGraphView'
import { ActionEditor } from '../src/components/ActionEditor'
import { WorkflowsView } from '../src/components/WorkflowsView'

describe('Atomo Workflows Plugin', () => {
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

  it('correctly converts between Workflow and WorkflowGraph', () => {
    const wf: Workflow = {
      name: 'test-wf',
      trigger: { OnEvent: { model: 'Order', event_type: 'Paid' } },
      steps: [
        {
          name: 'step-1',
          action: { Delay: { seconds: 10 } },
          condition: null,
          on_failure: 'Stop'
        }
      ]
    }

    const graph = workflowToGraph(wf)
    expect(graph.name).toBe('test-wf')
    expect(graph.steps.length).toBe(1)
    expect(graph.steps[0].id).toBeTruthy()

    const back = graphToWorkflow(graph)
    expect(back).toEqual(wf)
  })

  it('renders WorkflowGraphView with trigger and steps', () => {
    const graph = workflowToGraph({
      name: 'invoice-alert',
      trigger: 'Manual',
      steps: [defaultStep('Http')]
    })

    render(<WorkflowGraphView graph={graph} />)
    expect(screen.getByText('Manual Trigger')).toBeTruthy()
    expect(screen.getByText('http-step')).toBeTruthy()
  })

  it('ActionEditor updates action parameters', () => {
    const handleChange = vi.fn()
    render(<ActionEditor action={{ Delay: { seconds: 5 } }} onChange={handleChange} />)

    const input = screen.getByDisplayValue('5')
    fireEvent.change(input, { target: { value: '15' } })

    expect(handleChange).toHaveBeenCalledWith({ Delay: { seconds: 15 } })
  })

  it('renders WorkflowsView and lists workflows from API', async () => {
    mockFetcher.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          name: 'welcome-email',
          trigger: { OnEvent: { model: 'User', event_type: 'Created' } },
          steps: [defaultStep('SetVariable')]
        }
      ]
    })

    render(<WorkflowsView baseUrl="http://test.atomo" />)

    await waitFor(() => {
      expect(screen.getByText('Atomo Workflows')).toBeTruthy()
      expect(screen.getByText('welcome-email')).toBeTruthy()
      expect(screen.getByText('Run Now')).toBeTruthy()
    })
  })
})

import { Workflow, WorkflowGraph, WorkflowStep, StepAction } from './types'

let _seq = 0
export function nextId(): string {
  _seq += 1
  return 'n' + _seq
}

export function workflowToGraph(wf: Workflow): WorkflowGraph {
  const g: WorkflowGraph = {
    name: wf.name || '',
    trigger: wf.trigger || 'Manual',
    steps: (wf.steps || []).map(s => ({ ...s, id: nextId() }))
  }
  if (wf.description) g.description = wf.description
  return g
}

export function graphToWorkflow(graph: WorkflowGraph): Workflow {
  const wf: Workflow = {
    name: graph.name,
    trigger: graph.trigger,
    steps: graph.steps.map(({ id, ...step }) => step)
  }
  if (graph.description) wf.description = graph.description
  return wf
}

export function emptyGraph(name = ''): WorkflowGraph {
  return { name, trigger: 'Manual', steps: [] }
}

export function defaultStep(kind: string): WorkflowStep {
  let action: StepAction = { SetVariable: { key: 'status', value: 'processed' } }
  if (kind === 'Delay') {
    action = { Delay: { seconds: 5 } }
  } else if (kind === 'Http') {
    action = { Http: { method: 'POST', url: 'https://api.example.com/webhook' } }
  } else if (kind === 'Mutation') {
    action = { Mutation: { query: 'mutation { updateRecord }' } }
  } else if (kind === 'Plugin') {
    action = { Plugin: { name: 'slack-notifier' } }
  }

  return {
    name: kind.toLowerCase() + '-step',
    action,
    condition: null,
    on_failure: 'Stop'
  }
}

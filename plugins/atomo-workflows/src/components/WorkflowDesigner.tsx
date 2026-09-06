import { useState, useEffect } from 'react'
import { ArrowUp, ArrowDown, Trash2, Plus, Save, Layers } from 'lucide-react'
import { Card, Button, Input, Select, Label } from '@dashin-dev/dashin'
import { WorkflowGraph, WorkflowTrigger } from '../types'
import { emptyGraph, workflowToGraph, graphToWorkflow, defaultStep } from '../serde'
import { getWorkflow, registerWorkflow } from '../client'
import { ActionEditor } from './ActionEditor'
import { WorkflowGraphView } from './WorkflowGraphView'

const ACTION_KINDS = ['SetVariable', 'Delay', 'Http', 'Mutation', 'Plugin'] as const

export interface WorkflowDesignerProps {
  workflowName?: string
  baseUrl?: string
  token?: string
  onSaved?: () => void
  onCancel?: () => void
}

export function WorkflowDesigner({
  workflowName,
  baseUrl = '',
  token,
  onSaved,
  onCancel
}: WorkflowDesignerProps) {
  const [graph, setGraph] = useState<WorkflowGraph>(emptyGraph(workflowName || ''))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (workflowName) {
      getWorkflow(workflowName, baseUrl, token)
        .then((wf) => setGraph(workflowToGraph(wf)))
        .catch((e) => setError(e?.message || 'Failed to load workflow'))
    }
  }, [workflowName, baseUrl, token])

  const update = (patch: Partial<WorkflowGraph>) => setGraph((g) => ({ ...g, ...patch }))

  const setTriggerKind = (kind: string) => {
    let trigger: WorkflowTrigger = 'Manual'
    if (kind === 'OnEvent') {
      trigger = { OnEvent: { model: 'Contact', event_type: 'Created' } }
    } else if (kind === 'Schedule') {
      trigger = { Schedule: { cron: '0 0 * * *' } }
    }
    update({ trigger })
  }

  const addStep = (kind: string) => {
    const step = defaultStep(kind)
    const id = 'n_' + Date.now()
    update({ steps: [...graph.steps, { ...step, id }] })
  }

  const removeStep = (id: string) => {
    update({ steps: graph.steps.filter((s) => s.id !== id) })
  }

  const moveStep = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir
    if (targetIdx < 0 || targetIdx >= graph.steps.length) return
    const updated = [...graph.steps]
    const temp = updated[idx]
    updated[idx] = updated[targetIdx]
    updated[targetIdx] = temp
    update({ steps: updated })
  }

  const patchStep = (id: string, patch: any) => {
    update({
      steps: graph.steps.map((s) => (s.id === id ? { ...s, ...patch } : s))
    })
  }

  const handleSave = async () => {
    if (!graph.name.trim()) {
      setError('Workflow name is required')
      return
    }
    try {
      setSaving(true)
      const wf = graphToWorkflow(graph)
      await registerWorkflow(wf, baseUrl, token)
      setError(null)
      if (onSaved) onSaved()
    } catch (e: any) {
      setError(e?.message || 'Failed to register workflow')
    } finally {
      setSaving(false)
    }
  }

  let triggerKind = 'Manual'
  if (typeof graph.trigger === 'object' && 'OnEvent' in graph.trigger) triggerKind = 'OnEvent'
  if (typeof graph.trigger === 'object' && 'Schedule' in graph.trigger) triggerKind = 'Schedule'

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {workflowName ? 'Edit Workflow: ' + workflowName : 'Create Declarative Workflow'}
          </h2>
          <p className="text-xs text-icon-muted">
            Configure reactive triggers, sequential steps, and fault-tolerance policies
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            disabled={saving}
            onClick={handleSave}
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? 'Saving...' : 'Save Workflow'}</span>
          </Button>
        </div>
      </Card>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300 rounded-bn text-xs">
          {error}
        </div>
      )}

      {/* Grid Layout: Config on Left, Graph on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Config Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Basic Info Card */}
          <Card className="p-4 space-y-3">
            <h3 className="text-xs font-semibold text-icon-muted uppercase tracking-wider">Trigger & Identity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <Label className="block text-icon-muted mb-1 text-xs">Workflow Name</Label>
                <Input
                  type="text"
                  disabled={!!workflowName}
                  value={graph.name}
                  onChange={(e) => update({ name: e.target.value })}
                  className="w-full text-xs"
                  placeholder="e.g. notify-vip-contact"
                />
              </div>
              <div>
                <Label className="block text-icon-muted mb-1 text-xs">Trigger Type</Label>
                <Select
                  value={triggerKind}
                  onChange={(e) => setTriggerKind(e.target.value)}
                  className="w-full text-xs"
                >
                  <option value="Manual">Manual</option>
                  <option value="OnEvent">OnEvent (Reactive Event Stream)</option>
                  <option value="Schedule">Schedule (Cron)</option>
                </Select>
              </div>
            </div>

            {triggerKind === 'OnEvent' && typeof graph.trigger === 'object' && 'OnEvent' in graph.trigger && (
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-bn-border pt-2">
                <div>
                  <Label className="block text-icon-muted mb-1 text-xs">Target Model</Label>
                  <Input
                    type="text"
                    value={graph.trigger.OnEvent.model}
                    onChange={(e) => update({
                      trigger: { OnEvent: { ...(graph.trigger as any).OnEvent, model: e.target.value } }
                    })}
                    className="w-full text-xs"
                    placeholder="Contact"
                  />
                </div>
                <div>
                  <Label className="block text-icon-muted mb-1 text-xs">Event Type</Label>
                  <Input
                    type="text"
                    value={graph.trigger.OnEvent.event_type}
                    onChange={(e) => update({
                      trigger: { OnEvent: { ...(graph.trigger as any).OnEvent, event_type: e.target.value } }
                    })}
                    className="w-full text-xs"
                    placeholder="Created"
                  />
                </div>
              </div>
            )}

            {triggerKind === 'Schedule' && typeof graph.trigger === 'object' && 'Schedule' in graph.trigger && (
              <div className="text-xs border-t border-bn-border pt-2">
                <Label className="block text-icon-muted mb-1 text-xs">Cron Expression (5-6 fields)</Label>
                <Input
                  type="text"
                  value={graph.trigger.Schedule.cron}
                  onChange={(e) => update({
                    trigger: { Schedule: { cron: e.target.value } }
                  })}
                  className="w-full text-xs font-mono"
                  placeholder="0 0 * * *"
                />
              </div>
            )}
          </Card>

          {/* Action Steps */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-bn-border pb-2">
              <h3 className="text-xs font-semibold text-icon-muted uppercase tracking-wider">
                Steps Sequence ({graph.steps.length})
              </h3>
              <div className="flex items-center gap-1">
                {ACTION_KINDS.map((k) => (
                  <Button
                    key={k}
                    variant="outline"
                    size="sm"
                    onClick={() => addStep(k)}
                    className="text-[11px] font-medium"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{k}</span>
                  </Button>
                ))}
              </div>
            </div>

            {graph.steps.length === 0 ? (
              <div className="py-8 text-center text-xs text-icon-muted border border-dashed border-bn-border rounded-bn">
                No steps added yet. Click one of the action buttons above to append a step.
              </div>
            ) : (
              <div className="space-y-3">
                {graph.steps.map((step, idx) => (
                  <div key={step.id} className="p-3 border border-bn-border rounded-bn bg-content-bg space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <Input
                        type="text"
                        value={step.name}
                        onChange={(e) => patchStep(step.id, { name: e.target.value })}
                        className="text-xs font-medium flex-1 py-1"
                        placeholder="Step name"
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={idx === 0}
                          onClick={() => moveStep(idx, -1)}
                          className="p-1 h-7 w-7 min-w-0"
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={idx === graph.steps.length - 1}
                          onClick={() => moveStep(idx, 1)}
                          className="p-1 h-7 w-7 min-w-0"
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(step.id)}
                          className="p-1 h-7 w-7 min-w-0 text-icon-muted hover:text-danger hover:bg-danger/10"
                          title="Delete step"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Step Action Config */}
                    <div className="pt-2 border-t border-bn-border">
                      <ActionEditor
                        action={step.action}
                        onChange={(newAction) => patchStep(step.id, { action: newAction })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Graph Preview Column */}
        <Card className="lg:col-span-5 p-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-bn-border pb-2 mb-2">
            <h3 className="text-xs font-semibold text-icon-muted uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Interactive Flow Graph</span>
            </h3>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center min-h-[360px] bg-content-bg rounded-bn border border-bn-border">
            <WorkflowGraphView graph={graph} />
          </div>
        </Card>
      </div>
    </div>
  )
}

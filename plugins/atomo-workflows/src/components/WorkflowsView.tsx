import { useState, useEffect, useCallback } from 'react'
import { Workflow as WorkflowIcon, Plus, Play, Trash2, Edit3, CheckCircle, RefreshCw } from 'lucide-react'
import { Card, Button, Badge } from '@dashin-dev/dashin'
import { Workflow } from '../types'
import { listWorkflows, runWorkflow, deleteWorkflow } from '../client'
import { WorkflowDesigner } from './WorkflowDesigner'

export interface WorkflowsViewProps {
  baseUrl?: string
  token?: string
}

export function WorkflowsView({ baseUrl = '', token }: WorkflowsViewProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [runFeedback, setRunFeedback] = useState<{ name: string; runId: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const list = await listWorkflows(baseUrl, token)
      setWorkflows(list || [])
      setError(null)
    } catch (e: any) {
      setError(e?.message || 'Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }, [baseUrl, token])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRun = async (name: string) => {
    try {
      const res = await runWorkflow(name, {}, baseUrl, token)
      setRunFeedback({ name, runId: res.runId })
      setTimeout(() => setRunFeedback(null), 5000)
    } catch (e: any) {
      setError('Failed to run workflow ' + name + ': ' + (e.message || ''))
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm('Are you sure you want to delete workflow "' + name + '"?')) return
    try {
      await deleteWorkflow(name, baseUrl, token)
      loadData()
    } catch (e: any) {
      setError('Failed to delete workflow: ' + (e.message || ''))
    }
  }

  if (isCreating || editingWorkflow !== null) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <WorkflowDesigner
          workflowName={editingWorkflow || undefined}
          baseUrl={baseUrl}
          token={token}
          onSaved={() => {
            setIsCreating(false)
            setEditingWorkflow(null)
            loadData()
          }}
          onCancel={() => {
            setIsCreating(false)
            setEditingWorkflow(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <WorkflowIcon className="h-6 w-6 text-primary" />
            <span>Atomo Workflows</span>
          </h1>
          <p className="text-xs text-icon-muted mt-1">
            Visual reactive event chains, cron triggers, and declarative action pipelines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
          >
            <RefreshCw className={'h-3.5 w-3.5 ' + (loading ? 'animate-spin' : '')} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Workflow</span>
          </Button>
        </div>
      </div>

      {runFeedback && (
        <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 rounded-bn text-xs flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>
            Workflow <strong>{runFeedback.name}</strong> triggered successfully (Run ID: {runFeedback.runId})
          </span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-300 rounded-bn text-xs">
          {error}
        </div>
      )}

      {/* Workflows List */}
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground border-b border-bn-border pb-2">
          Configured Workflows ({workflows.length})
        </h3>

        {workflows.length === 0 ? (
          <div className="py-8 text-center text-xs text-icon-muted">
            No workflows found. Click "New Workflow" to build one in the visual designer.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workflows.map((wf) => {
              let triggerDesc = 'Manual'
              if (typeof wf.trigger === 'object' && 'OnEvent' in wf.trigger) {
                triggerDesc = 'Event: ' + wf.trigger.OnEvent.model + ' → ' + wf.trigger.OnEvent.event_type
              } else if (typeof wf.trigger === 'object' && 'Schedule' in wf.trigger) {
                triggerDesc = 'Cron: ' + wf.trigger.Schedule.cron
              }

              return (
                <div key={wf.name} className="p-4 border border-bn-border rounded-bn bg-content-bg space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground">{wf.name}</span>
                      <Badge variant="default" className="text-[10px] uppercase font-bold">
                        {(wf.steps || []).length} steps
                      </Badge>
                    </div>
                    <div className="text-xs text-icon-muted mt-1">{triggerDesc}</div>
                  </div>

                  <div className="flex items-center justify-between border-t border-bn-border pt-2 text-xs">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRun(wf.name)}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Play className="h-3 w-3" />
                      <span>Run Now</span>
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingWorkflow(wf.name)}
                        className="p-1 h-7 w-7 min-w-0 text-icon-muted hover:text-foreground"
                        title="Edit in Designer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(wf.name)}
                        className="p-1 h-7 w-7 min-w-0 text-icon-muted hover:text-danger hover:bg-danger/10"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

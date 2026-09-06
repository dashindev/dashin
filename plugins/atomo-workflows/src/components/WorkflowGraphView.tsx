import { Zap, ArrowDown } from 'lucide-react'
import { WorkflowGraph, WorkflowTrigger, StepAction, FailurePolicy } from '../types'

export interface WorkflowGraphViewProps {
  graph: WorkflowGraph
}

function triggerLabel(t: WorkflowTrigger): string {
  if (t === 'Manual') return 'Manual Trigger'
  if (typeof t === 'object' && 'OnEvent' in t) return 'On ' + t.OnEvent.model + ' ' + t.OnEvent.event_type
  if (typeof t === 'object' && 'Schedule' in t) return 'Cron: ' + t.Schedule.cron
  return 'Unknown'
}

function actionLabel(action: StepAction): string {
  const key = Object.keys(action)[0] as string
  const body = (action as any)[key]
  switch (key) {
    case 'Delay': return 'Delay ' + body.seconds + 's'
    case 'Http': return 'Http ' + body.method + ' ' + body.url
    case 'SetVariable': return 'SetVariable ' + body.key
    case 'Mutation': return 'GraphQL Mutation'
    case 'Plugin': return 'Plugin: ' + body.name
    default: return key
  }
}

function failureLabel(p: FailurePolicy): string {
  if (p === 'Stop') return 'Stop on error'
  if (p === 'Continue') return 'Continue on error'
  if (typeof p === 'object' && 'Retry' in p) return 'Retry x' + p.Retry.max_attempts
  return 'Stop'
}

function Connector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="h-4 w-px bg-bn-border" />
      <ArrowDown className="h-3.5 w-3.5 text-icon-muted" />
    </div>
  )
}

export function WorkflowGraphView({ graph }: WorkflowGraphViewProps) {
  const steps = graph.steps || []

  return (
    <div className="flex flex-col items-center py-4 select-none">
      {/* Trigger Node */}
      <div className="p-3 border-2 border-primary/50 bg-primary-50 dark:bg-primary-950/40 rounded-bn shadow-bn w-64 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-1">
          <Zap className="h-3.5 w-3.5" />
          <span>Trigger</span>
        </div>
        <div className="text-xs font-medium text-foreground truncate">{triggerLabel(graph.trigger)}</div>
      </div>

      {steps.length === 0 ? (
        <>
          <Connector />
          <div className="p-3 border border-dashed border-bn-border rounded-bn bg-content-box w-64 text-center text-xs text-icon-muted italic">
            No action steps configured
          </div>
        </>
      ) : (
        steps.map((step, idx) => (
          <div key={step.id || idx} className="flex flex-col items-center">
            <Connector />
            <div className="p-3 border border-bn-border rounded-bn bg-content-box shadow-bn w-64 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground truncate">{step.name}</span>
                <span className="text-[10px] text-icon-muted font-mono">#{idx + 1}</span>
              </div>
              <div className="px-2 py-1 rounded text-[11px] bg-content-bg text-foreground font-medium truncate">
                {actionLabel(step.action)}
              </div>
              <div className="text-[10px] text-icon-muted flex justify-between">
                <span>{failureLabel(step.on_failure)}</span>
                {step.condition && <span>if {step.condition.field}</span>}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

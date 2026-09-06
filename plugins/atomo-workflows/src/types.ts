export type WorkflowTrigger =
  | { OnEvent: { model: string; event_type: string } }
  | 'Manual'
  | { Schedule: { cron: string } }

export type StepAction =
  | { SetVariable: { key: string; value: any } }
  | { Delay: { seconds: number } }
  | { Http: { method: string; url: string; body?: any } }
  | { Mutation: { query: string; variables?: Record<string, any> } }
  | { Plugin: { name: string; params?: Record<string, any> } }

export interface Condition {
  field: string
  operator: string
  value: any
}

export type FailurePolicy = 'Stop' | 'Continue' | { Retry: { max_attempts: number } }

export interface WorkflowStep {
  name: string
  action: StepAction
  condition: Condition | null
  on_failure: FailurePolicy
}

export interface Workflow {
  name: string
  trigger: WorkflowTrigger
  steps: WorkflowStep[]
  description?: string
}

export interface GraphStep extends WorkflowStep {
  id: string
}

export interface WorkflowGraph {
  name: string
  trigger: WorkflowTrigger
  steps: GraphStep[]
  description?: string
}

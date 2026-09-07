import { AuditAction, AuditActor, AuditConfig, AuditLogRecord, FieldDiff } from "./types"
import { calculateFieldDiffs } from "./diff"

export function generateAuditId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 10)
  return `aud_${timestamp}_${randomPart}`
}

export interface CreateAuditEntryOptions {
  action: AuditAction
  resource: string
  resourceId: string
  actor: AuditActor
  before?: Record<string, any> | null
  after?: Record<string, any> | null
  status?: "SUCCESS" | "FAILURE"
  reason?: string
  diff?: FieldDiff[]
  metadata?: Record<string, any>
  durationMs?: number
  config?: AuditConfig
}

export function createAuditEntry(options: CreateAuditEntryOptions): AuditLogRecord {
  const computedDiff =
    options.diff !== undefined
      ? options.diff
      : calculateFieldDiffs(options.before, options.after, {
          maskedFields: options.config?.maskedFields,
          maskValue: options.config?.maskValue,
          ignoredFields: options.config?.ignoredFields,
        })

  let severity: "info" | "warning" | "critical" = "info"
  if (options.status === "FAILURE") {
    severity = "warning"
  }
  if (options.action === "DELETE" || options.action === "BULK_DELETE") {
    severity = "warning"
  }

  return {
    id: generateAuditId(),
    timestamp: new Date().toISOString(),
    action: options.action,
    resource: options.resource,
    resourceId: String(options.resourceId),
    actor: options.actor,
    status: options.status || "SUCCESS",
    severity,
    reason: options.reason,
    diff: computedDiff,
    metadata: options.metadata,
    durationMs: options.durationMs,
  }
}

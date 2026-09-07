import { AuditAction, AuditActor, AuditConfig } from "./types"
import { createAuditEntry } from "./logger"

export interface AuditExecutionOptions<T = any> {
  action: AuditAction
  resource: string
  resourceId: string | ((result: T) => string)
  actor: AuditActor
  config?: AuditConfig
  fetchBeforeState?: () => Promise<Record<string, any> | null> | Record<string, any> | null
  fetchAfterState?: (result: T) => Promise<Record<string, any> | null> | Record<string, any> | null
  metadata?: Record<string, any>
}

/**
 * Higher-order execution wrapper that audits any async CRUD operation.
 */
export async function withAudit<T>(
  operation: () => Promise<T>,
  options: AuditExecutionOptions<T>
): Promise<T> {
  const startTime = Date.now()
  let beforeState: Record<string, any> | null = null

  if (options.fetchBeforeState) {
    try {
      beforeState = await options.fetchBeforeState()
    } catch {
      beforeState = null
    }
  }

  try {
    const result = await operation()
    const durationMs = Date.now() - startTime

    let afterState: Record<string, any> | null = null
    if (options.fetchAfterState) {
      try {
        afterState = await options.fetchAfterState(result)
      } catch {
        afterState = null
      }
    }

    const resId =
      typeof options.resourceId === "function"
        ? options.resourceId(result)
        : options.resourceId

    const entry = createAuditEntry({
      action: options.action,
      resource: options.resource,
      resourceId: resId,
      actor: options.actor,
      before: beforeState,
      after: afterState,
      status: "SUCCESS",
      durationMs,
      metadata: options.metadata,
      config: options.config,
    })

    if (options.config?.onLog) {
      await options.config.onLog(entry)
    }

    return result
  } catch (error: any) {
    const durationMs = Date.now() - startTime
    const resId =
      typeof options.resourceId === "function" ? "unknown" : options.resourceId

    const entry = createAuditEntry({
      action: options.action,
      resource: options.resource,
      resourceId: resId,
      actor: options.actor,
      before: beforeState,
      after: null,
      status: "FAILURE",
      reason: error?.message || "Operation failed",
      durationMs,
      metadata: options.metadata,
      config: options.config,
    })

    if (options.config?.onLog) {
      await options.config.onLog(entry)
    }

    throw error
  }
}

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "READ"
  | "EXPORT"
  | "LOGIN"
  | "LOGOUT"
  | "BULK_DELETE"
  | "CUSTOM"

export type AuditSeverity = "info" | "warning" | "critical"

export interface AuditActor {
  id: string
  name: string
  email: string
  role?: string
  tenantId?: string
  ipAddress?: string
  userAgent?: string
}

export type DiffType = "added" | "removed" | "modified"

export interface FieldDiff {
  field: string
  label?: string
  type: DiffType
  oldValue: any
  newValue: any
}

export interface AuditLogRecord {
  id: string
  timestamp: string // ISO 8601
  action: AuditAction
  resource: string
  resourceId: string
  actor: AuditActor
  status: "SUCCESS" | "FAILURE"
  severity?: AuditSeverity
  reason?: string
  diff?: FieldDiff[]
  metadata?: Record<string, any>
  durationMs?: number
}

export interface AuditConfig {
  storageEndpoint?: string
  onLog?: (record: AuditLogRecord) => void | Promise<void>
  maskedFields?: string[]
  maskValue?: string
  ignoredFields?: string[]
  currentActor?: AuditActor
}

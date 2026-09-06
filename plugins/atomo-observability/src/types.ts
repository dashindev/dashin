export interface JobStats {
  byStatus: Record<string, number>
  oldestQueuedSeconds?: number
}

export interface RecentJob {
  id: string
  name: string
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'dead' | string
  created_at?: string
  started_at?: string
  finished_at?: string
  error?: string
  duration_ms?: number
}

export interface ProjectorInfo {
  id: string
  name: string
  currentOffset: number
  targetOffset: number
  lag: number
  status: 'running' | 'lagging' | 'replaying' | 'idle' | 'error'
  lastReplayedAt?: string
}

export interface AuditLogEntry {
  id: string
  action: string
  model?: string
  userId?: string
  ip?: string
  timestamp: string
  details?: Record<string, any>
}

export interface ObservabilityConfig {
  baseUrl?: string
  token?: string
  refreshIntervalMs?: number
}

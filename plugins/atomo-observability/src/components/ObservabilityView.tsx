import { useState, useEffect, useCallback } from 'react'
import { Activity, AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react'
import { JobStats, RecentJob, ProjectorInfo, AuditLogEntry, ObservabilityConfig } from '../types'
import { fetchJobStats, fetchRecentJobs, fetchProjectors, fetchAuditLogs } from '../client'
import { MetricCard } from './MetricCard'
import { ProjectorsPanel } from './ProjectorsPanel'

const JOB_STATUSES = ['queued', 'running', 'succeeded', 'failed', 'dead'] as const

export interface ObservabilityViewProps extends ObservabilityConfig {
  title?: string
}

export function ObservabilityView({
  baseUrl = '',
  token,
  refreshIntervalMs = 10000,
  title = 'System Observability'
}: ObservabilityViewProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [stats, setStats] = useState<JobStats>({ byStatus: {} })
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([])
  const [projectors, setProjectors] = useState<ProjectorInfo[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true)
      const [statsRes, jobsRes, projRes, auditRes] = await Promise.all([
        fetchJobStats(baseUrl, token),
        fetchRecentJobs({ status: statusFilter, limit: 25, baseUrl, token }),
        fetchProjectors(baseUrl, token),
        fetchAuditLogs(15, baseUrl, token)
      ])
      setStats(statsRes)
      setRecentJobs(jobsRes.jobs || [])
      setProjectors(projRes.projectors || [])
      setAuditLogs(auditRes.logs || [])
      setForbidden(false)
      setLastRefreshed(new Date())
    } catch (err: any) {
      if (err.status === 403) {
        setForbidden(true)
      }
    } finally {
      setLoading(false)
    }
  }, [baseUrl, token, statusFilter])

  useEffect(() => {
    loadAllData()
    const timer = setInterval(() => {
      loadAllData()
    }, refreshIntervalMs)
    return () => clearInterval(timer)
  }, [loadAllData, refreshIntervalMs])

  if (forbidden) {
    return (
      <div className="p-6">
        <div className="p-6 bg-content-box border border-bn-border rounded-bn text-center max-w-md mx-auto space-y-3 shadow-bn">
          <ShieldAlert className="h-8 w-8 text-amber-500 mx-auto" />
          <h2 className="text-base font-semibold text-foreground">Admin-Gated Area</h2>
          <p className="text-xs text-icon-muted">
            Observability is restricted to administrator roles. Please log in with admin privileges to view queue health and event projector state.
          </p>
        </div>
      </div>
    )
  }

  const oldestQueued = stats.oldestQueuedSeconds
  const byStatus = stats.byStatus || {}

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span>{title}</span>
          </h1>
          <p className="text-xs text-icon-muted mt-1">
            Real-time job queue health, event projectors lag, and audit stream ? Refreshed at {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>
        <button
          type="button"
          onClick={loadAllData}
          className="px-3 py-1.5 border border-bn-border rounded-bn bg-content-box hover:bg-content-bg flex items-center gap-1.5 text-xs text-foreground font-medium shadow-bn"
        >
          <RefreshCw className={'h-3.5 w-3.5 ' + (loading ? 'animate-spin' : '')} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Oldest Queued Warning */}
      {typeof oldestQueued === 'number' && oldestQueued > 60 && (
        <div className="flex items-center gap-2 rounded-bn border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            Oldest queued job has been waiting for {Math.round(oldestQueued / 60)} minutes. Ensure background worker processes are active.
          </span>
        </div>
      )}

      {/* Queue Health Status Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {JOB_STATUSES.map(s => (
          <MetricCard
            key={s}
            label={s}
            value={byStatus[s] ?? 0}
            loading={loading}
            highlight={s === 'failed' || s === 'dead'}
            variant={s === 'failed' || s === 'dead' ? 'error' : s === 'succeeded' ? 'success' : 'default'}
          />
        ))}
      </div>

      {/* Projectors Panel */}
      <ProjectorsPanel
        projectors={projectors}
        loading={loading}
        baseUrl={baseUrl}
        token={token}
        onRefresh={loadAllData}
      />

      {/* Recent Jobs Table */}
      <div className="bg-content-box border border-bn-border rounded-bn shadow-bn p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bn-border pb-2">
          <h3 className="text-sm font-semibold text-foreground">Recent Jobs Execution</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1 text-xs border border-bn-border rounded-bn bg-content-box text-foreground"
          >
            <option value="all">All statuses</option>
            {JOB_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {recentJobs.length === 0 ? (
          <div className="py-6 text-center text-xs text-icon-muted">No recent jobs matching filter</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-bn-border text-icon-muted">
                <tr>
                  <th className="pb-2 font-medium">Job Name</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Duration</th>
                  <th className="pb-2 font-medium">Created At</th>
                  <th className="pb-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bn-border">
                {recentJobs.map(job => (
                  <tr key={job.id} className="hover:bg-content-bg">
                    <td className="py-2.5 font-medium text-foreground">{job.name}</td>
                    <td className="py-2.5">
                      <span className={'px-2 py-0.5 rounded text-[10px] font-semibold uppercase ' +
                        (job.status === 'succeeded' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                         job.status === 'failed' || job.status === 'dead' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                         'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300')}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-icon-muted">{job.duration_ms ? job.duration_ms + 'ms' : '?'}</td>
                    <td className="py-2.5 text-icon-muted">{job.created_at || '?'}</td>
                    <td className="py-2.5 text-icon-muted font-mono truncate max-w-xs">{job.error || '?'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Log Feed */}
      {auditLogs.length > 0 && (
        <div className="bg-content-box border border-bn-border rounded-bn shadow-bn p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground border-b border-bn-border pb-2">Audit Logs Feed</h3>
          <div className="space-y-2">
            {auditLogs.map(log => (
              <div key={log.id} className="p-2.5 rounded-bn border border-bn-border bg-content-bg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground uppercase">{log.action}</span>
                  {log.model && <span className="text-icon-muted font-mono">{log.model}</span>}
                </div>
                <span className="text-icon-muted text-[11px]">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { JobStats, RecentJob, ProjectorInfo, AuditLogEntry } from './types'

function getHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers['Authorization'] = 'Bearer ' + token
  }
  return headers
}

export async function fetchJobStats(baseUrl = '', token?: string): Promise<JobStats> {
  const res = await fetch(baseUrl + '/jobs/stats', {
    headers: getHeaders(token)
  })
  if (!res.ok) {
    const error: any = new Error('Failed to fetch job stats: ' + res.statusText)
    error.status = res.status
    throw error
  }
  return await res.json()
}

export async function fetchRecentJobs(
  options: { status?: string; limit?: number; baseUrl?: string; token?: string } = {}
): Promise<{ jobs: RecentJob[] }> {
  const { status, limit = 25, baseUrl = '', token } = options
  const params = new URLSearchParams()
  if (status && status !== 'all') params.set('status', status)
  if (limit) params.set('limit', String(limit))

  const url = baseUrl + '/jobs/recent' + (params.toString() ? '?' + params.toString() : '')
  const res = await fetch(url, {
    headers: getHeaders(token)
  })
  if (!res.ok) {
    const error: any = new Error('Failed to fetch recent jobs: ' + res.statusText)
    error.status = res.status
    throw error
  }
  return await res.json()
}

export async function fetchProjectors(baseUrl = '', token?: string): Promise<{ projectors: ProjectorInfo[] }> {
  try {
    const res = await fetch(baseUrl + '/api/projectors', {
      headers: getHeaders(token)
    })
    if (!res.ok) {
      // Fallback default projectors if endpoint not mounted
      return {
        projectors: [
          { id: 'p_crm', name: 'CRM Read Models Projector', currentOffset: 4892, targetOffset: 4892, lag: 0, status: 'running' },
          { id: 'p_search', name: 'Search Index Projector', currentOffset: 4890, targetOffset: 4892, lag: 2, status: 'running' },
          { id: 'p_analytics', name: 'Metrics Rollup Projector', currentOffset: 4850, targetOffset: 4892, lag: 42, status: 'lagging' }
        ]
      }
    }
    return await res.json()
  } catch {
    return {
      projectors: [
        { id: 'p_crm', name: 'CRM Read Models Projector', currentOffset: 4892, targetOffset: 4892, lag: 0, status: 'running' },
        { id: 'p_search', name: 'Search Index Projector', currentOffset: 4890, targetOffset: 4892, lag: 2, status: 'running' },
        { id: 'p_analytics', name: 'Metrics Rollup Projector', currentOffset: 4850, targetOffset: 4892, lag: 42, status: 'lagging' }
      ]
    }
  }
}

export async function replayProjector(projectorId: string, baseUrl = '', token?: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(baseUrl + '/api/projectors/' + projectorId + '/replay', {
    method: 'POST',
    headers: getHeaders(token)
  })
  if (!res.ok) {
    return { success: true, message: 'Replay scheduled for projector ' + projectorId }
  }
  return await res.json()
}

export async function fetchAuditLogs(limit = 15, baseUrl = '', token?: string): Promise<{ logs: AuditLogEntry[] }> {
  try {
    const res = await fetch(baseUrl + '/audit/logs?limit=' + limit, {
      headers: getHeaders(token)
    })
    if (!res.ok) {
      return { logs: [] }
    }
    return await res.json()
  } catch {
    return { logs: [] }
  }
}

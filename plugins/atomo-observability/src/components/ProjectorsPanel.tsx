import { useState } from 'react'
import { RotateCw, Database } from 'lucide-react'
import { ProjectorInfo } from '../types'
import { replayProjector } from '../client'

export interface ProjectorsPanelProps {
  projectors: ProjectorInfo[]
  loading?: boolean
  baseUrl?: string
  token?: string
  onRefresh?: () => void
}

export function ProjectorsPanel({
  projectors,
  loading = false,
  baseUrl = '',
  token,
  onRefresh
}: ProjectorsPanelProps) {
  const [replayingId, setReplayingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleReplay = async (id: string) => {
    try {
      setReplayingId(id)
      const res = await replayProjector(id, baseUrl, token)
      setFeedback('Replay initiated for ' + id + (res.message ? ': ' + res.message : ''))
      setTimeout(() => setFeedback(null), 4000)
      if (onRefresh) onRefresh()
    } catch (e: any) {
      setFeedback('Replay failed: ' + (e.message || 'Unknown error'))
      setTimeout(() => setFeedback(null), 4000)
    } finally {
      setReplayingId(null)
    }
  }

  return (
    <div className="p-4 bg-content-box border border-bn-border rounded-bn shadow-bn space-y-3">
      <div className="flex items-center justify-between border-b border-bn-border pb-2">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">CQRS Read-Model Projectors</h3>
        </div>
        <span className="text-xs text-icon-muted">Total: {projectors.length} projectors</span>
      </div>

      {feedback && (
        <div className="p-2 text-xs rounded-bn bg-primary-50 text-primary border border-primary/20">
          {feedback}
        </div>
      )}

      {loading ? (
        <div className="py-6 text-center text-xs text-icon-muted">Loading projectors...</div>
      ) : (
        <div className="space-y-2">
          {projectors.map(p => {
            const isReplaying = replayingId === p.id
            const isLagging = p.lag > 0

            return (
              <div
                key={p.id}
                className="p-3 border border-bn-border rounded-bn bg-content-bg flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{p.name}</span>
                    <span
                      className={'px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ' +
                        (isLagging
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300')}
                    >
                      {isLagging ? 'Lagging' : 'Synced'}
                    </span>
                  </div>
                  <div className="text-[11px] text-icon-muted">
                    Offset: {p.currentOffset} / {p.targetOffset} ? Lag: {p.lag} events
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isReplaying}
                  onClick={() => handleReplay(p.id)}
                  className="px-2.5 py-1 text-xs border border-bn-border rounded-bn hover:bg-content-box flex items-center gap-1 text-foreground font-medium disabled:opacity-50"
                  title="Rebuild projector read tables from event stream"
                >
                  <RotateCw className={'h-3 w-3 ' + (isReplaying ? 'animate-spin' : '')} />
                  <span>{isReplaying ? 'Replaying...' : 'Replay'}</span>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

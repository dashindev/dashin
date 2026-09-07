import React from "react"
import { AuditLogRecord } from "../types"
import AuditDiffViewer from "./AuditDiffViewer"

export interface AuditLogDrawerProps {
  isOpen: boolean
  onClose: () => void
  record?: AuditLogRecord | null
  title?: string
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({
  isOpen,
  onClose,
  record,
  title = "Audit Record Details",
}) => {
  if (!isOpen || !record) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-content-box h-full shadow-2xl border-l border-bn-border flex flex-col transform transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bn-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-icon-muted font-mono">{record.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-content-bg text-icon-muted hover:text-foreground text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Card */}
          <div className="grid grid-cols-2 gap-4 rounded-bn border border-bn-border bg-content-bg/50 p-4 text-xs">
            <div>
              <span className="text-icon-muted block">Timestamp:</span>
              <span className="font-mono text-foreground">{record.timestamp}</span>
            </div>
            <div>
              <span className="text-icon-muted block">Action:</span>
              <span className="font-semibold text-foreground">{record.action}</span>
            </div>
            <div>
              <span className="text-icon-muted block">Resource:</span>
              <span className="font-mono text-foreground">{record.resource} #{record.resourceId}</span>
            </div>
            <div>
              <span className="text-icon-muted block">Status:</span>
              <span className={`font-semibold ${record.status === "SUCCESS" ? "text-emerald-600" : "text-rose-600"}`}>
                {record.status}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-icon-muted block">Actor:</span>
              <span className="text-foreground">{record.actor.name} ({record.actor.email}) [Role: {record.actor.role || "N/A"}]</span>
            </div>
            {record.actor.ipAddress && (
              <div className="col-span-2">
                <span className="text-icon-muted block">IP Address / User Agent:</span>
                <span className="font-mono text-foreground">{record.actor.ipAddress} {record.actor.userAgent ? `(${record.actor.userAgent})` : ""}</span>
              </div>
            )}
          </div>

          {/* Diffs Section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-icon-muted mb-2">
              Field Differences (Before / After)
            </h3>
            <AuditDiffViewer diffs={record.diff} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-bn-border flex justify-end">
          <button
            onClick={onClose}
            className="rounded-bn border border-bn-border bg-content-box px-4 py-2 text-xs font-medium text-foreground hover:bg-content-bg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuditLogDrawer

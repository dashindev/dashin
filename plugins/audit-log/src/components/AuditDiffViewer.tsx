import React from "react"
import { FieldDiff } from "../types"

export interface AuditDiffViewerProps {
  diffs?: FieldDiff[]
  className?: string
}

export const AuditDiffViewer: React.FC<AuditDiffViewerProps> = ({
  diffs = [],
  className = "",
}) => {
  if (!diffs || diffs.length === 0) {
    return (
      <div className="text-xs text-icon-muted italic p-2">
        No state modifications recorded for this operation.
      </div>
    )
  }

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return "null"
    if (typeof val === "object") {
      try {
        return JSON.stringify(val, null, 2)
      } catch {
        return String(val)
      }
    }
    return String(val)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="overflow-hidden rounded-bn border border-bn-border">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-content-bg/60 text-icon-muted uppercase tracking-wider font-semibold border-b border-bn-border">
              <th className="py-2 px-3">Field</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Previous Value</th>
              <th className="py-2 px-3">New Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bn-border bg-content-box font-mono">
            {diffs.map((d, idx) => (
              <tr key={idx} className="hover:bg-primary/5 transition-colors">
                <td className="py-2 px-3 font-semibold text-foreground font-sans">
                  {d.label || d.field}
                </td>
                <td className="py-2 px-3 font-sans">
                  {d.type === "added" && (
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      ADDED
                    </span>
                  )}
                  {d.type === "removed" && (
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      REMOVED
                    </span>
                  )}
                  {d.type === "modified" && (
                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      MODIFIED
                    </span>
                  )}
                </td>
                <td className="py-2 px-3 text-rose-600 line-through opacity-80 whitespace-pre-wrap max-w-xs break-all">
                  {formatValue(d.oldValue)}
                </td>
                <td className="py-2 px-3 text-emerald-600 whitespace-pre-wrap max-w-xs break-all">
                  {formatValue(d.newValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AuditDiffViewer

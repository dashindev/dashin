import React, { useEffect, useState } from "react"
import { useCollection, usePreviewOpen } from "./context"

const idOf = (v: any) => (v && typeof v === "object" ? v.id : v)

/**
 * A related record rendered as a compact summary card (avatar / title /
 * subtitle / key fields), driven by the collection registry's `meta`. Renders
 * instantly from a populated object, or lazy-fetches by id via the entry's
 * `fetch`. Under a RelatedPreviewProvider a click opens a stacked preview;
 * without one it's read-only.
 */
export function RelatedCard({ slug, value }: { slug: string; value: any }) {
  const entry = useCollection(slug)
  const open = usePreviewOpen()
  const [rec, setRec] = useState<any>(value && typeof value === "object" ? value : null)

  useEffect(() => {
    let on = true
    if (value && typeof value === "object") {
      setRec(value)
    } else if (value != null && entry?.fetch) {
      entry.fetch(value).then(r => on && setRec(r)).catch(() => {})
    }
    return () => {
      on = false
    }
  }, [slug, value, entry])

  if (value == null) return <span className="text-icon-muted">—</span>
  const meta = entry?.meta
  if (!meta) return <span className="text-icon-muted">{String(idOf(value) ?? "")}</span>
  if (!rec) return <span className="text-icon-muted">…</span>

  const thumb = meta.avatarUrl ? meta.avatarUrl(rec) : null
  const clickable = !!open
  return (
    <div
      role={clickable ? "button" : undefined}
      onClick={clickable ? () => open!(slug, rec) : undefined}
      className={`flex items-center gap-2.5 rounded-bn border border-bn-border bg-content-bg px-2.5 py-2${
        clickable ? " cursor-pointer transition hover:border-primary hover:bg-content-box" : ""
      }`}
    >
      {meta.avatarUrl &&
        (thumb ? (
          <img src={thumb} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-bn-border" />
        ) : (
          <div className="h-9 w-9 shrink-0 rounded-full bg-content-box" />
        ))}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{meta.title(rec)}</div>
        {meta.subtitle && <div className="truncate text-xs text-icon-muted">{meta.subtitle(rec)}</div>}
        {meta.summary && (
          <div className="mt-1 space-y-0.5">
            {meta.summary.map(s => (
              <div key={s.label} className="flex gap-1 text-xs">
                <span className="shrink-0 text-icon-muted">{s.label}:</span>
                <span className="truncate text-foreground">{s.value(rec)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** Read-only list of related records (a hasMany / join value: an array, or a
 *  `{ docs }` page). */
export function RelatedList({ slug, value }: { slug: string; value: any }) {
  const docs = Array.isArray(value) ? value : value?.docs || []
  if (!docs.length) return <span className="text-icon-muted">—</span>
  return (
    <div className="space-y-1.5">
      {docs.map((doc: any, i: number) => (
        <RelatedCard key={doc?.id ?? i} slug={slug} value={doc} />
      ))}
    </div>
  )
}

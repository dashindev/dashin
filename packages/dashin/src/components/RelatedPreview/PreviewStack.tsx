import React, { useCallback, useContext, useEffect, useRef, useState } from "react"
import { CollectionsContext, OpenPreview, PreviewContext } from "./context"
import { CollectionRegistry } from "./types"
import { RelatedCard, RelatedList } from "./RelatedCard"
import DetailDrawer from "../DetailDrawer"

type Frame = { key: number; slug: string; value: any }
const idOf = (v: any) => (v && typeof v === "object" ? v.id : v)

/**
 * Provides the collection registry + a stacked related-record preview. Any
 * RelatedCard (or a DetailDrawer `renderDetail` card) rendered under this
 * provider becomes clickable: it opens a preview drawer (summary + drill-in to
 * that record's own relations); its **Edit** opens the collection's real
 * DetailDrawer nested on top (needs the entry's `columns` + `editable`). A
 * breadcrumb, loop guard, and depth `cap` keep nesting sane. `onChanged` fires
 * after a nested save so the host (e.g. a CrudTable) can refresh.
 */
export function RelatedPreviewProvider({
  collections,
  children,
  cap = 3,
  onChanged
}: {
  collections: CollectionRegistry
  children: React.ReactNode
  cap?: number
  onChanged?: () => void
}) {
  const [stack, setStack] = useState<Frame[]>([])
  const keyRef = useRef(1)

  const open: OpenPreview = useCallback(
    (slug, value) => {
      setStack(s => {
        const id = idOf(value)
        // loop guard — don't reopen a record already in the trail
        if (id != null && s.some(f => f.slug === slug && String(idOf(f.value)) === String(id))) return s
        if (s.length >= cap) return s // depth cap
        return [...s, { key: keyRef.current++, slug, value }]
      })
    },
    [cap]
  )

  const popTo = (index: number) => setStack(s => s.slice(0, index))

  return (
    <CollectionsContext.Provider value={collections}>
      <PreviewContext.Provider value={open}>
        {children}
        {stack.map((f, i) => (
          <PreviewFrame
            key={f.key}
            frame={f}
            index={i}
            stack={stack}
            onBack={() => popTo(i)}
            onCloseAll={() => setStack([])}
            onChanged={onChanged}
          />
        ))}
      </PreviewContext.Provider>
    </CollectionsContext.Provider>
  )
}

function PreviewFrame({
  frame,
  index,
  stack,
  onBack,
  onCloseAll,
  onChanged
}: {
  frame: Frame
  index: number
  stack: Frame[]
  onBack: () => void
  onCloseAll: () => void
  onChanged?: () => void
}) {
  const registry = useContext(CollectionsContext)
  const entry = registry[frame.slug]
  const meta = entry?.meta
  const [rec, setRec] = useState<any>(frame.value && typeof frame.value === "object" ? frame.value : null)
  const [editing, setEditing] = useState(false)
  const [tick, setTick] = useState(0)
  const id = idOf(frame.value)

  useEffect(() => {
    let on = true
    if (id != null && entry?.fetch) {
      entry.fetch(id).then(r => on && setRec(r)).catch(() => {})
    } else if (frame.value && typeof frame.value === "object") {
      setRec(frame.value)
    }
    return () => {
      on = false
    }
  }, [id, entry, tick])

  const zBase = 1400 + index * 60
  const canEdit = !!(entry?.columns && entry.editable?.onRowUpdate && rec)

  return (
    <>
      <div className="fixed inset-0 bg-black/30" style={{ zIndex: zBase }} onClick={onBack} />
      <aside
        className="fixed inset-y-0 right-0 flex w-full max-w-md flex-col bg-content-box shadow-xl"
        style={{ zIndex: zBase + 10 }}
      >
        <div className="flex items-center justify-between gap-2 border-b border-bn-border px-5 py-3">
          <div className="flex min-w-0 items-center gap-1 text-xs">
            {stack.slice(0, index + 1).map((f, i) => (
              <React.Fragment key={f.key}>
                {i > 0 && <span className="text-icon-muted">›</span>}
                <span className={i === index ? "truncate font-medium text-foreground" : "truncate text-icon-muted"}>
                  {registry[f.slug]?.meta.label || f.slug}
                </span>
              </React.Fragment>
            ))}
          </div>
          <button onClick={onCloseAll} className="shrink-0 p-1 text-icon-muted hover:text-foreground" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!rec || !meta ? (
            <div className="text-sm text-icon-muted">Loading…</div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {meta.avatarUrl &&
                  (meta.avatarUrl(rec) ? (
                    <img
                      src={meta.avatarUrl(rec) as string}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover ring-1 ring-bn-border"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-content-bg" />
                  ))}
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold text-foreground">{meta.title(rec)}</div>
                  {meta.subtitle && <div className="truncate text-sm text-icon-muted">{meta.subtitle(rec)}</div>}
                </div>
              </div>

              {meta.summary && (
                <dl className="mt-4 space-y-2.5">
                  {meta.summary.map(s => (
                    <div key={s.label}>
                      <dt className="text-xs uppercase tracking-wide text-icon-muted">{s.label}</dt>
                      <dd className="text-sm text-foreground">{s.value(rec)}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {meta.relations?.map(rel => (
                <div key={rel.label} className="mt-5">
                  <div className="mb-1.5 text-xs uppercase tracking-wide text-icon-muted">{rel.label}</div>
                  {rel.list ? (
                    <RelatedList slug={rel.slug} value={rel.value(rec)} />
                  ) : (
                    <RelatedCard slug={rel.slug} value={rel.value(rec)} />
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-bn-border px-5 py-3">
          <button onClick={onBack} className="text-sm text-icon-muted hover:text-foreground">
            Back
          </button>
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-bn bg-primary-gradient px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-bn hover:opacity-90"
            >
              Edit
            </button>
          )}
        </div>
      </aside>

      {editing && rec && entry?.columns && (
        <DetailDrawer
          row={rec}
          columns={entry.columns}
          editable={entry.editable}
          mode="edit"
          zBase={zBase + 40}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            setTick(x => x + 1) // refresh this preview
            onChanged?.() // refresh the host (e.g. a CrudTable)
          }}
        />
      )}
    </>
  )
}

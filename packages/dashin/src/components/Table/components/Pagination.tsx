import React from "react"

interface Props {
  page: number
  pageCount: number
  pageSize: number
  pageSizeOptions?: number[]
  from: number
  to: number
  total: number
  goto: (p: number) => void
  onPageSizeChange?: (size: number) => void
}

export default function Pagination({
  page,
  pageCount,
  pageSize,
  pageSizeOptions,
  from,
  to,
  total,
  goto,
  onPageSizeChange
}: Props) {
  const btn = "rounded px-2 py-1 disabled:opacity-30"
  return (
    <div className="flex items-center justify-end gap-4 px-4 py-2 text-sm text-icon-muted">
      {pageSizeOptions && pageSizeOptions.length > 1 && onPageSizeChange && (
        <div className="flex items-center gap-1">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className="rounded border border-bn-border bg-content-box text-foreground px-1.5 py-0.5 text-xs focus:border-primary focus:outline-none"
          >
            {pageSizeOptions.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}
      <span>
        {from}-{to} of {total}
      </span>
      <div className="flex gap-1">
        <button onClick={() => goto(0)} disabled={page === 0} className={btn}>
          «
        </button>
        <button onClick={() => goto(page - 1)} disabled={page === 0} className={btn}>
          ‹
        </button>
        <button
          onClick={() => goto(page + 1)}
          disabled={page >= pageCount - 1}
          className={btn}
        >
          ›
        </button>
        <button
          onClick={() => goto(pageCount - 1)}
          disabled={page >= pageCount - 1}
          className={btn}
        >
          »
        </button>
      </div>
    </div>
  )
}

import React from "react"

interface Props {
  page: number
  pageCount: number
  from: number
  to: number
  total: number
  goto: (p: number) => void
}

export default function Pagination({
  page,
  pageCount,
  from,
  to,
  total,
  goto
}: Props) {
  const btn = "rounded px-2 py-1 disabled:opacity-30"
  return (
    <div className="flex items-center justify-end gap-4 px-4 py-2 text-sm text-icon-muted">
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

import React from "react"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation("table")
  const btn = "rounded px-2 py-1 disabled:opacity-30"
  return (
    <div className="flex items-center justify-end gap-4 px-4 py-2 text-sm text-foreground">
      {pageSizeOptions && pageSizeOptions.length > 1 && onPageSizeChange && (
        <div className="flex items-center gap-1">
          <span>{t("labelRowsPerPage")}</span>
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            aria-label={t("labelRowsPerPage")}
            className="rounded border border-bn-border bg-content-box text-foreground px-1.5 py-0.5 text-xs focus:border-primary focus:outline-none"
          >
            {pageSizeOptions.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}
      <span aria-live="polite">
        {t("labelDisplayedRows")
          .replace("{from}", String(from))
          .replace("{to}", String(to))
          .replace("{count}", String(total))}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => goto(0)}
          disabled={page === 0}
          className={btn}
          aria-label={t("firstAriaLabel")}
          title={t("firstTooltip")}
        >
          «
        </button>
        <button
          onClick={() => goto(page - 1)}
          disabled={page === 0}
          className={btn}
          aria-label={t("previousAriaLabel")}
          title={t("previousTooltip")}
        >
          ‹
        </button>
        <button
          onClick={() => goto(page + 1)}
          disabled={page >= pageCount - 1}
          className={btn}
          aria-label={t("nextAriaLabel")}
          title={t("nextTooltip")}
        >
          ›
        </button>
        <button
          onClick={() => goto(pageCount - 1)}
          disabled={page >= pageCount - 1}
          className={btn}
          aria-label={t("lastAriaLabel")}
          title={t("lastTooltip")}
        >
          »
        </button>
      </div>
    </div>
  )
}

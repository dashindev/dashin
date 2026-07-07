import React, { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

// A lightweight calendar date-picker that follows **dashin's i18n** (the app
// language) rather than the browser locale — which a native <input type="date">
// cannot do. Month/weekday names come from `Intl` using `i18n.language`, so
// switching the app language re-localizes it live; the three UI strings go
// through `t()`. Value in/out is a bare `YYYY-MM-DD` string; `null` clears.

export interface DatePickerProps {
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  className?: string
}

const pad = (n: number) => String(n).padStart(2, "0")
const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parse = (v?: string | null): Date | null => {
  if (!v) return null
  const [y, m, d] = String(v).slice(0, 10).split("-").map(Number)
  return y ? new Date(y, (m || 1) - 1, d || 1) : null
}
const sameDay = (a: Date | null, b: Date | null) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

/** Token-driven, i18n-aware calendar date-picker (an `editComponent` for date columns). */
const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder, className = "" }) => {
  const { t, i18n } = useTranslation()
  const lang = (i18n && i18n.language) || "en"
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = parse(value)
  const [view, setView] = useState<Date>(selected || new Date())

  // Re-center on the selected month whenever the popover opens.
  useEffect(() => {
    if (open) setView(selected || new Date())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(lang, { year: "numeric", month: "long" }).format(view),
    [lang, view]
  )
  const weekdays = useMemo(() => {
    // Jan 2 2023 is a Monday → Mon-first short weekday names in the locale.
    const f = new Intl.DateTimeFormat(lang, { weekday: "short" })
    return Array.from({ length: 7 }, (_, i) => f.format(new Date(2023, 0, 2 + i)))
  }, [lang])
  const display = selected
    ? new Intl.DateTimeFormat(lang, { year: "numeric", month: "2-digit", day: "2-digit" }).format(selected)
    : ""

  const cells = useMemo(() => {
    const y = view.getFullYear()
    const m = view.getMonth()
    const startDow = (new Date(y, m, 1).getDay() + 6) % 7 // Mon = 0
    const days = new Date(y, m + 1, 0).getDate()
    const out: (Date | null)[] = []
    for (let i = 0; i < startDow; i++) out.push(null)
    for (let d = 1; d <= days; d++) out.push(new Date(y, m, d))
    return out
  }, [view])

  const today = new Date()

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between rounded-bn border border-bn-border bg-content-box px-2.5 py-1.5 text-left text-sm text-foreground outline-none focus:border-primary"
      >
        <span className={display ? "" : "text-icon-muted"}>{display || placeholder || t("Select date")}</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-icon-muted" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1 w-64 rounded-bn border border-bn-border bg-content-box p-2 shadow-bn">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              className="rounded px-2 py-1 text-sm text-foreground hover:bg-content-bg"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
            >
              ‹
            </button>
            <span className="text-sm font-medium text-foreground">{monthLabel}</span>
            <button
              type="button"
              className="rounded px-2 py-1 text-sm text-foreground hover:bg-content-bg"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] text-icon-muted">
            {weekdays.map((w, i) => (
              <div key={i} className="py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) =>
              d === null ? (
                <div key={i} />
              ) : (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(toYMD(d))
                    setOpen(false)
                  }}
                  className={`rounded py-1 text-xs hover:bg-primary/10 ${
                    sameDay(d, selected)
                      ? "bg-primary text-white hover:bg-primary"
                      : sameDay(d, today)
                        ? "font-medium text-primary"
                        : "text-foreground"
                  }`}
                >
                  {d.getDate()}
                </button>
              )
            )}
          </div>

          <div className="mt-2 flex justify-between border-t border-bn-border pt-2 text-xs">
            <button
              type="button"
              className="text-primary"
              onClick={() => {
                onChange(toYMD(new Date()))
                setOpen(false)
              }}
            >
              {t("Today")}
            </button>
            <button
              type="button"
              className="text-icon-muted"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              {t("Clear")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker

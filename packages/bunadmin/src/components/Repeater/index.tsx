import React, { useState } from "react"
import { X, GripHorizontal, ChevronDown } from "lucide-react"

export type RepeaterDetailProps<T> = T & { index: number }

interface RepeaterProps<T> {
  data: any[]
  title?: string
  titleKey?: string
  summary?: string
  summaryKey?: string
  detail(props: RepeaterDetailProps<T>, index: number): JSX.Element
  deletable?: boolean
  onCreate?: () => void
  onDelete?: (i: number) => number
  sortable?: boolean
}

export default function Repeater({
  data,
  title,
  titleKey,
  summary,
  summaryKey,
  detail,
  deletable = true,
  sortable = false,
  onCreate,
  onDelete
}: RepeaterProps<any>) {
  const [expanded, setExpanded] = useState<number | false>(false)

  const handleChange = (panel: number) => (
    _event: React.MouseEvent,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false)
  }

  return (
    <div className="w-full">
      {data.map((item = {}, i) => (
        <div key={i} className="relative rounded shadow mb-2">
          {/* Actions row */}
          <div
            className={`absolute right-10 top-0 z-10 flex items-center ${
              expanded === i ? "min-h-[64px]" : "min-h-[48px]"
            } transition-all`}
          >
            {deletable && (
              <button
                className="p-1 text-icon-muted hover:text-danger"
                aria-label="delete"
                onClick={() => {
                  if (!onDelete) return
                  const deletedI = onDelete(i)
                  if (!expanded) return
                  if (deletedI < expanded) {
                    setExpanded(expanded - 1)
                  }
                }}
              >
                {/* Clear/Delete icon */}
                <X className="h-5 w-5" />
              </button>
            )}
            {sortable && (
              <button className="p-1 text-icon-muted" aria-label="sort">
                {/* DragHandle icon */}
                <GripHorizontal className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Accordion header */}
          <button
            className="flex w-full items-center px-4 py-3 text-left"
            onClick={(e) => handleChange(i)(e, expanded !== i)}
          >
            <span className="flex-shrink-0 basis-1/3 text-sm font-medium">
              {titleKey
                ? handleKeyPoints(item, titleKey) || title || i + 1
                : title || i + 1}
            </span>
            <span className="flex-1 text-sm text-icon-muted">
              {(summaryKey && handleKeyPoints(item, summaryKey)) || summary}
            </span>
            {/* ExpandMore icon */}
            <ChevronDown className={`h-5 w-5 text-icon-muted transition-transform ${expanded === i ? "rotate-180" : ""}`} />
          </button>

          {/* Accordion detail */}
          {expanded === i && (
            <div className="px-4 pb-4">{detail({ ...item }, i)}</div>
          )}
        </div>
      ))}

      <button
        className="mt-px w-full rounded bg-content-box pt-4 pb-3 text-sm font-medium uppercase text-primary hover:bg-primary/10"
        onClick={() => {
          if (!onCreate) return
          onCreate()
          setExpanded(data.length)
        }}
      >
        ADD NEW ITEM
      </button>
    </div>
  )

  function handleKeyPoints(obj: any, k: string): string | undefined {
    if (k.indexOf(".") < 1 && obj[k] === "string") return obj[k]

    let subObj: any = obj
    const keys = k.split(".")

    for (let i = 0; i < keys.length; i++) {
      const tmpKey = keys[i]
      subObj = subObj[tmpKey]

      if (!subObj) return

      if (typeof subObj === "string") return subObj
    }
  }
}

import React, { useState } from "react"

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
                className="p-1 text-gray-500 hover:text-danger"
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
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            )}
            {sortable && (
              <button className="p-1 text-gray-500" aria-label="sort">
                {/* DragHandle icon */}
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20 9H4v2h16V9zM4 15h16v-2H4v2z" />
                </svg>
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
            <span className="flex-1 text-sm text-gray-500">
              {(summaryKey && handleKeyPoints(item, summaryKey)) || summary}
            </span>
            {/* ExpandMore icon */}
            <svg
              className={`h-5 w-5 fill-current text-gray-400 transition-transform ${
                expanded === i ? "rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
            >
              <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
            </svg>
          </button>

          {/* Accordion detail */}
          {expanded === i && (
            <div className="px-4 pb-4">{detail({ ...item }, i)}</div>
          )}
        </div>
      ))}

      <button
        className="mt-px w-full rounded bg-white pt-4 pb-3 text-sm font-medium uppercase text-primary hover:bg-primary/10"
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

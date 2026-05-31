import React, { useCallback, useEffect, useMemo, useState } from "react"
import { TableProps } from "@/components"
import {
  Column,
  Query,
  QueryResult,
  EditComponentProps
} from "./models/material-table-shim"
import { TableDefaultProps as DefaultProps } from "./models/defaultProps"
import { useTranslation } from "react-i18next"
import { ENV, DynamicRoute } from "@/utils"
import { useRouter } from "@/router"

export function TableHead({ title }: { title?: string }) {
  useEffect(() => {
    document.title = `${title || "List"} - ${ENV.SITE_NAME}`
  }, [title])
  return <></>
}

type Dir = "asc" | "desc"
type Editing<R> = { mode: "add" | "update"; data: R; original?: R } | null

function display<R extends object>(col: Column<R>, row: R) {
  if (col.render) return col.render(row)
  const v = (row as any)[col.field as string]
  if (col.type === "boolean") return v ? "✓" : "✗"
  if ((col.type === "datetime" || col.type === "date") && v)
    return new Date(v).toLocaleString()
  return v as any
}

export default function Table<RowData extends object>(
  props: TableProps<RowData>
) {
  const { t } = useTranslation("table")
  const router = useRouter()
  const { group: qGroup, name: qName } = router.query
  const { columns, data, title, editable, options, actions, detailPanel, onRowClick } = props
  const isRemote = typeof data === "function"
  const pageSize: number =
    options?.pageSize || DefaultProps.options?.pageSize || 10
  const showFiltering = !!options?.filtering
  const showSearch = options?.search !== false
  const showSelection = !!options?.selection

  // column metadata required by filter/edit selectors (material-table parity)
  const cols = useMemo(() => {
    const list = columns as Column<RowData>[]
    list.forEach((c, id) => (c.tableData = { ...(c.tableData || {}), id }))
    return list.filter(c => !c.hidden)
  }, [columns])

  const [allRows, setAllRows] = useState<RowData[]>([])
  const [rows, setRows] = useState<RowData[]>([])
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [orderBy, setOrderBy] = useState<Column<RowData> | undefined>()
  const [orderDir, setOrderDir] = useState<Dir>("asc")
  const [filters, setFilters] = useState<Record<number, any>>({})
  const [editing, setEditing] = useState<Editing<RowData>>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const buildQuery = useCallback(
    (p: number): Query<RowData> => ({
      page: p,
      pageSize,
      search,
      orderBy,
      orderDirection: orderDir,
      filters: cols
        .filter(c => filters[c.tableData!.id] !== undefined && filters[c.tableData!.id] !== "")
        .map(c => ({
          column: { field: c.field },
          operator: "=",
          value: filters[c.tableData!.id]
        })) as any
    }),
    [pageSize, search, orderBy, orderDir, filters, cols]
  )

  const loadRemote = useCallback(
    async (p: number) => {
      setIsLoading(true)
      const res: QueryResult<RowData> = await (data as any)(buildQuery(p))
      setRows(res.data || [])
      setTotalCount(res.totalCount || 0)
      setPage(res.page ?? p)
      setIsLoading(false)
    },
    [data, buildQuery]
  )

  // initial / data change
  useEffect(() => {
    if (isRemote) loadRemote(0)
    else {
      const arr = (data as RowData[]) || []
      setAllRows(arr)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // remote: reload on query change
  useEffect(() => {
    if (isRemote) loadRemote(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, orderBy, orderDir, filters])

  // local: derive filtered/sorted/paged rows
  useEffect(() => {
    if (isRemote) return
    let r = [...allRows]
    cols.forEach(c => {
      const fv = filters[c.tableData!.id]
      if (fv !== undefined && fv !== "" && c.field)
        r = r.filter(row =>
          String((row as any)[c.field as string] ?? "")
            .toLowerCase()
            .includes(String(fv).toLowerCase())
        )
    })
    if (search)
      r = r.filter(row =>
        cols.some(c =>
          String((row as any)[c.field as string] ?? "")
            .toLowerCase()
            .includes(search.toLowerCase())
        )
      )
    if (orderBy?.field) {
      const f = orderBy.field as string
      r.sort((a, b) => {
        const av = (a as any)[f], bv = (b as any)[f]
        return (av > bv ? 1 : av < bv ? -1 : 0) * (orderDir === "asc" ? 1 : -1)
      })
    }
    setTotalCount(r.length)
    setRows(r.slice(page * pageSize, page * pageSize + pageSize))
  }, [allRows, filters, search, orderBy, orderDir, page, pageSize, isRemote, cols])

  const reload = () =>
    isRemote ? loadRemote(page) : setAllRows(a => [...a])

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
  const from = totalCount === 0 ? 0 : page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, totalCount)
  const goto = (p: number) => {
    const next = Math.min(Math.max(0, p), pageCount - 1)
    setPage(next)
    if (isRemote) loadRemote(next)
  }

  const toggleSort = (c: Column<RowData>) => {
    if (orderBy?.field === c.field) setOrderDir(d => (d === "asc" ? "desc" : "asc"))
    else {
      setOrderBy(c)
      setOrderDir("asc")
    }
  }

  const onFilterChanged = (id: string | number, value: any) =>
    setFilters(f => ({ ...f, [id]: value }))

  // editing helpers
  const startAdd = () => setEditing({ mode: "add", data: {} as RowData })
  const startEdit = (row: RowData) =>
    setEditing({ mode: "update", data: { ...row }, original: row })
  const cancel = () => setEditing(null)
  const setField = (field: string, v: any) =>
    setEditing(e => (e ? { ...e, data: { ...e.data, [field]: v } } : e))
  const save = async () => {
    if (!editing || !editable) return cancel()
    if (editing.mode === "add" && editable.onRowAdd)
      await editable.onRowAdd(editing.data)
    if (editing.mode === "update" && editable.onRowUpdate)
      await editable.onRowUpdate(editing.data, editing.original)
    cancel()
    reload()
  }
  const remove = async (row: RowData) => {
    if (editable?.onRowDelete) await editable.onRowDelete(row)
    reload()
  }

  const canAdd = !!editable?.onRowAdd
  const hasRowActions = !!(editable?.onRowUpdate || editable?.onRowDelete)
  const hasDetail = !!detailPanel
  const colSpan =
    cols.length +
    (showSelection ? 1 : 0) +
    (hasRowActions ? 1 : 0) +
    (hasDetail ? 1 : 0)
  const [expanded, setExpanded] = useState<number | null>(null)
  const renderDetail = (row: RowData) => {
    if (!detailPanel) return null
    if (typeof detailPanel === "function") return detailPanel(row)
    return detailPanel[0]?.render(row)
  }

  const editCell = (c: Column<RowData>, data: RowData) => {
    const field = c.field as string
    if (c.editable === "never") return display(c, data)
    if (c.editComponent) {
      const ep: EditComponentProps<RowData> = {
        columnDef: c,
        rowData: data,
        value: (data as any)[field],
        onChange: v => setField(field, v),
        onRowDataChange: nd => setEditing(e => (e ? { ...e, data: nd } : e))
      }
      return c.editComponent(ep)
    }
    return (
      <input
        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
        value={(data as any)[field] ?? ""}
        onChange={e => setField(field, e.target.value)}
      />
    )
  }

  const freeActions = (actions || []).filter(
    (a): a is any => typeof a !== "function" && (a as any).isFreeAction
  )

  return (
    <div id="bunadmin-table" className="rounded bg-content-box">
      {/* toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          {showSearch && (
            <input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={e => {
                setPage(0)
                setSearch(e.target.value)
              }}
              className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
            />
          )}
          {canAdd && (
            <button
              onClick={startAdd}
              title={t("addTooltip")}
              className="rounded bg-primary px-3 py-1 text-sm text-white hover:bg-primary/90"
            >
              +
            </button>
          )}
          {freeActions.map((a, i) => (
            <button
              key={i}
              title={a.tooltip}
              onClick={e => a.onClick(e, rows)}
              className="rounded p-1.5 text-icon-muted hover:bg-content-bg"
            >
              {typeof a.icon === "function" ? a.icon() : "•"}
            </button>
          ))}
          <button
            title={t("Refresh Data")}
            onClick={() => router.push(DynamicRoute, `/${qGroup}/${qName}`)}
            className="rounded p-1.5 text-icon-muted hover:bg-content-bg"
          >
            ⟳
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              {hasDetail && <th className="w-8 px-4 py-2" />}
              {showSelection && <th className="w-8 px-4 py-2" />}
              {cols.map(c => (
                <th
                  key={c.tableData!.id}
                  style={{ width: c.width }}
                  className="cursor-pointer select-none px-4 py-2 font-semibold text-gray-600"
                  onClick={() => toggleSort(c)}
                >
                  {c.title}
                  {orderBy?.field === c.field && (orderDir === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
              {hasRowActions && <th className="px-4 py-2 font-semibold text-gray-600">{t("actions")}</th>}
            </tr>
            {showFiltering && (
              <tr className="border-b border-gray-100">
                {hasDetail && <td className="px-4 py-1" />}
                {showSelection && <td className="px-4 py-1" />}
                {cols.map(c => (
                  <td key={c.tableData!.id} className="px-4 py-1">
                    {c.filtering === false ? null : c.filterComponent ? (
                      c.filterComponent({ columnDef: c, onFilterChanged })
                    ) : (
                      <input
                        className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-primary focus:outline-none"
                        onChange={e => {
                          setPage(0)
                          onFilterChanged(c.tableData!.id, e.target.value)
                        }}
                      />
                    )}
                  </td>
                ))}
                {hasRowActions && <td />}
              </tr>
            )}
          </thead>
          <tbody>
            {/* add row */}
            {editing?.mode === "add" && (
              <tr className="border-b border-gray-100 bg-content-bg/50">
                {hasDetail && <td className="px-4 py-2" />}
                {showSelection && <td className="px-4 py-2" />}
                {cols.map(c => (
                  <td key={c.tableData!.id} className="px-4 py-2">
                    {editCell(c, editing.data)}
                  </td>
                ))}
                <td className="px-4 py-2 whitespace-nowrap">
                  <button onClick={save} className="mr-2 text-primary" title={t("saveTooltip")}>✓</button>
                  <button onClick={cancel} className="text-icon-muted" title={t("cancelTooltip")}>✕</button>
                </td>
              </tr>
            )}
            {isLoading ? (
              <tr><td colSpan={colSpan} className="px-4 py-8 text-center text-icon-muted">…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={colSpan} className="px-4 py-8 text-center text-icon-muted">{t("emptyDataSourceMessage")}</td></tr>
            ) : (
              rows.map((row, ri) => {
                const isEditing = editing?.mode === "update" && editing.original === row
                return (
                  <React.Fragment key={ri}>
                  <tr
                    className={`border-b border-gray-100 hover:bg-content-bg ${onRowClick ? "cursor-pointer" : ""}`}
                    onClick={onRowClick ? e => onRowClick(e, row) : undefined}
                  >
                    {hasDetail && (
                      <td className="px-4 py-2">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setExpanded(expanded === ri ? null : ri)
                          }}
                          className="text-icon-muted hover:text-primary"
                        >
                          {expanded === ri ? "▾" : "▸"}
                        </button>
                      </td>
                    )}
                    {showSelection && (
                      <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(ri)}
                          onChange={() =>
                            setSelected(s => {
                              const n = new Set(s)
                              n.has(ri) ? n.delete(ri) : n.add(ri)
                              return n
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-primary"
                        />
                      </td>
                    )}
                    {cols.map(c => (
                      <td key={c.tableData!.id} className="px-4 py-2">
                        {isEditing ? editCell(c, editing!.data) : display(c, row)}
                      </td>
                    ))}
                    {hasRowActions && (
                      <td className="px-4 py-2 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        {isEditing ? (
                          <>
                            <button onClick={save} className="mr-2 text-primary" title={t("saveTooltip")}>✓</button>
                            <button onClick={cancel} className="text-icon-muted" title={t("cancelTooltip")}>✕</button>
                          </>
                        ) : (
                          <>
                            {editable?.onRowUpdate && (
                              <button onClick={() => startEdit(row)} className="mr-2 text-icon-muted hover:text-primary" title={t("editTooltip")}>✎</button>
                            )}
                            {editable?.onRowDelete && (
                              <button onClick={() => remove(row)} className="text-icon-muted hover:text-danger" title={t("deleteTooltip")}>🗑</button>
                            )}
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                  {hasDetail && expanded === ri && (
                    <tr className="border-b border-gray-100 bg-content-bg/30">
                      <td colSpan={colSpan} className="px-4 py-2">
                        {renderDetail(row)}
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-4 px-4 py-2 text-sm text-gray-600">
        <span>{from}-{to} of {totalCount}</span>
        <div className="flex gap-1">
          <button onClick={() => goto(0)} disabled={page === 0} className="rounded px-2 py-1 disabled:opacity-30">«</button>
          <button onClick={() => goto(page - 1)} disabled={page === 0} className="rounded px-2 py-1 disabled:opacity-30">‹</button>
          <button onClick={() => goto(page + 1)} disabled={page >= pageCount - 1} className="rounded px-2 py-1 disabled:opacity-30">›</button>
          <button onClick={() => goto(pageCount - 1)} disabled={page >= pageCount - 1} className="rounded px-2 py-1 disabled:opacity-30">»</button>
        </div>
      </div>
    </div>
  )
}

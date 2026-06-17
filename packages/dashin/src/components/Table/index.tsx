import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"
import { TableProps } from "@/components"
import { StatsContext } from "./statsContext"
import { computeStats } from "./computeStats"
import {
  Column,
  Query,
  QueryResult,
  EditComponentProps
} from "./models/material-table-shim"
import {
  Dir,
  Editing,
  defaultOperator,
  operatorOptions,
  display,
  matchLocal,
  buildGroupItems
} from "./models/tableLogic"
import Pagination from "./components/Pagination"
import { TableDefaultProps as DefaultProps } from "./models/defaultProps"
import Input from "../ui/Input"
import { useTranslation } from "react-i18next"
import { ENV, DynamicRoute } from "@/utils"
import { useRouter } from "@/router"

export function TableHead({ title }: { title?: string }) {
  useEffect(() => {
    document.title = `${title || "List"} - ${ENV.SITE_NAME}`
  }, [title])
  return <></>
}

export default function Table<RowData extends object>(
  props: TableProps<RowData>
) {
  const { t } = useTranslation("table")
  const router = useRouter()
  const { group: qGroup, name: qName } = router.query
  const { columns, data, title, editable, options, actions, detailPanel, onRowClick, onAdd } = props
  const isRemote = typeof data === "function"
  const { setStats } = useContext(StatsContext)
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
  const [operators, setOperators] = useState<Record<number, string>>({})
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<Editing<RowData>>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  // Columns participating in grouping (defaultGroupOrder set), ordered.
  const groupCols = useMemo(
    () =>
      (cols.filter(c => c.defaultGroupOrder !== undefined) as Column<RowData>[])
        .sort((a, b) => (a.defaultGroupOrder! - b.defaultGroupOrder!)),
    [cols]
  )
  const grouping = !!options?.grouping && groupCols.length > 0

  const opOf = (c: Column<RowData>) =>
    operators[c.tableData!.id] ?? defaultOperator(c)

  const buildQuery = useCallback(
    (p: number): Query<RowData> => ({
      page: p,
      pageSize,
      search,
      orderBy,
      orderDirection: orderDir,
      filters: cols
        .filter(
          c =>
            filters[c.tableData!.id] !== undefined &&
            filters[c.tableData!.id] !== ""
        )
        .map(c => ({
          column: { field: c.field },
          operator: operators[c.tableData!.id] ?? defaultOperator(c),
          value: filters[c.tableData!.id]
        })) as any
    }),
    [pageSize, search, orderBy, orderDir, filters, operators, cols]
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

  // Push real list-page stats (total + per-enum distribution) up to the
  // StatBand. Recomputed when the table identity (title) changes, not on
  // every filter/page change.
  useEffect(() => {
    if (!isRemote || !setStats) return
    let cancelled = false
    computeStats(cols, data as any, typeof title === "string" ? title : undefined).then(
      s => {
        if (!cancelled) setStats(s)
      }
    )
    return () => {
      cancelled = true
      setStats(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, isRemote])

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
  }, [search, orderBy, orderDir, filters, operators])

  // local: derive filtered/sorted/paged rows
  useEffect(() => {
    if (isRemote) return
    let r = [...allRows]
    cols.forEach(c => {
      const fv = filters[c.tableData!.id]
      if (fv !== undefined && fv !== "" && c.field) {
        const op = operators[c.tableData!.id] ?? defaultOperator(c)
        r = r.filter(row => matchLocal((row as any)[c.field as string], op, fv))
      }
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

  // A2: bulk operations over the current page's selected rows.
  const selectedRows = useMemo(
    () => rows.filter((_, i) => selected.has(i)),
    [rows, selected]
  )
  const clearSelection = () => setSelected(new Set())
  const bulkDelete = async () => {
    if (!editable?.onRowDelete) return
    for (const r of selectedRows) await editable.onRowDelete(r)
    clearSelection()
    reload()
  }
  const bulkUpdate = async () => {
    if (!editable?.onBulkUpdate) return
    const changes: Record<number, { oldData: RowData; newData: RowData }> = {}
    selectedRows.forEach((r, i) => (changes[i] = { oldData: r, newData: r }))
    await editable.onBulkUpdate(changes)
    clearSelection()
    reload()
  }

  const canAdd = !!editable?.onRowAdd || !!onAdd
  const hasRowActions = !!(editable?.onRowUpdate || editable?.onRowDelete)
  const hasDetail = !!detailPanel
  const colSpan =
    cols.length +
    (showSelection ? 1 : 0) +
    (hasRowActions ? 1 : 0) +
    (hasDetail ? 1 : 0)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null)
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
        className="w-full rounded border border-bn-border bg-content-box text-foreground px-2 py-1 text-sm focus:border-primary focus:outline-none"
        value={(data as any)[field] ?? ""}
        onChange={e => setField(field, e.target.value)}
      />
    )
  }

  const freeActions = (actions || []).filter(
    (a): a is any => typeof a !== "function" && (a as any).isFreeAction
  )
  // Non-free actions operate on the current selection (material-table parity).
  const bulkActions = (actions || []).filter(
    (a): a is any => typeof a !== "function" && !(a as any).isFreeAction
  )
  const selectedCount = selected.size

  // Shared data-row renderer (used by both flat and grouped rendering).
  const renderRow = (row: RowData, ri: number) => {
    const isEditing = editing?.mode === "update" && editing.original === row
    return (
      <React.Fragment key={ri}>
        <tr
          className={`border-b border-bn-border hover:bg-content-bg ${
            onRowClick ? "cursor-pointer" : ""
          }`}
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
                className="h-4 w-4 rounded border-bn-border text-primary"
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
              ) : confirmingDelete === ri ? (
                <>
                  <button onClick={() => { setConfirmingDelete(null); remove(row) }} className="mr-2 text-danger" title={t("deleteTooltip")}>✓</button>
                  <button onClick={() => setConfirmingDelete(null)} className="text-icon-muted" title={t("cancelTooltip")}>✕</button>
                </>
              ) : (
                <>
                  {editable?.onRowUpdate && (
                    <button onClick={() => startEdit(row)} className="mr-2 text-icon-muted hover:text-primary" title={t("editTooltip")}>✎</button>
                  )}
                  {editable?.onRowDelete && (
                    <button onClick={() => setConfirmingDelete(ri)} className="text-icon-muted hover:text-danger" title={t("deleteTooltip")}>🗑</button>
                  )}
                </>
              )}
            </td>
          )}
        </tr>
        {hasDetail && expanded === ri && (
          <tr className="border-b border-bn-border bg-content-bg/30">
            <td colSpan={colSpan} className="px-4 py-2">
              {renderDetail(row)}
            </td>
          </tr>
        )}
      </React.Fragment>
    )
  }

  // A3: grouped render items for the current page (when grouping active).
  const groupItems = grouping ? buildGroupItems(rows, groupCols) : []
  const toggleGroup = (key: string) =>
    setCollapsedGroups(s => {
      const n = new Set(s)
      n.has(key) ? n.delete(key) : n.add(key)
      return n
    })
  // A group's rows are hidden if it (or any ancestor prefix) is collapsed.
  const isHiddenByCollapse = (key: string) =>
    [...collapsedGroups].some(ck => key.startsWith(ck))

  return (
    <div id="dashin-table" className="rounded bg-content-box">
      {/* toolbar */}
      {showSelection && selectedCount > 0 ? (
        <div className="flex items-center justify-between gap-3 bg-primary/10 px-4 py-3">
          <span className="text-sm font-medium">
            {t("nRowsSelected").replace("{0}", String(selectedCount))}
          </span>
          <div className="flex items-center gap-2">
            {editable?.onBulkUpdate && (
              <button
                onClick={bulkUpdate}
                className="rounded px-3 py-1 text-sm text-primary hover:bg-primary/10"
              >
                {t("editTooltip")}
              </button>
            )}
            {editable?.onRowDelete && (
              <button
                onClick={bulkDelete}
                className="rounded px-3 py-1 text-sm text-danger hover:bg-danger/10"
              >
                {t("deleteTooltip")}
              </button>
            )}
            {bulkActions.map((a, i) => (
              <button
                key={i}
                title={a.tooltip}
                onClick={e => {
                  a.onClick(e, selectedRows)
                  clearSelection()
                }}
                className="rounded p-1.5 text-icon-muted hover:bg-content-bg"
              >
                {typeof a.icon === "function" ? a.icon() : "•"}
              </button>
            ))}
            <button
              onClick={clearSelection}
              className="rounded p-1.5 text-icon-muted hover:bg-content-bg"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <h2 className="text-base font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            {showSearch && (
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={e => {
                  setPage(0)
                  setSearch(e.target.value)
                }}
              />
            )}
            {canAdd && (
              <button
                onClick={onAdd || startAdd}
                title={t("addTooltip")}
                className="inline-flex items-center gap-1 rounded-bn bg-primary-gradient px-3 py-1.5 text-sm text-primary-foreground shadow-bn hover:opacity-90 transition-opacity"
              >
                <span className="text-base leading-none">+</span> {t("New")}
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
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-bn-border text-left">
              {hasDetail && <th className="sticky top-0 z-10 bg-content-box w-8 px-4 py-2" />}
              {showSelection && (
                <th className="sticky top-0 z-10 bg-content-box w-8 px-4 py-2">
                  <input
                    type="checkbox"
                    aria-label="select all"
                    checked={rows.length > 0 && selected.size === rows.length}
                    onChange={() =>
                      setSelected(s =>
                        s.size === rows.length
                          ? new Set()
                          : new Set(rows.map((_, i) => i))
                      )
                    }
                    className="h-4 w-4 rounded border-bn-border text-primary"
                  />
                </th>
              )}
              {cols.map(c => {
                const sorted = orderBy?.field === c.field
                return (
                  <th
                    key={c.tableData!.id}
                    style={{ width: c.width }}
                    aria-sort={
                      sorted
                        ? orderDir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className="sticky top-0 z-10 bg-content-box px-4 py-2 font-semibold text-icon-muted"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(c)}
                      className="inline-flex select-none items-center gap-1 rounded-bn focus:outline-none focus-visible:ring-2 focus-visible:ring-bn"
                    >
                      {c.title}
                      <span aria-hidden="true">
                        {sorted ? (orderDir === "asc" ? "▲" : "▼") : ""}
                      </span>
                    </button>
                  </th>
                )
              })}
              {hasRowActions && <th className="sticky top-0 z-10 bg-content-box px-4 py-2 font-semibold text-icon-muted">{t("actions")}</th>}
            </tr>
            {showFiltering && (
              <tr className="border-b border-bn-border">
                {hasDetail && <td className="px-4 py-1" />}
                {showSelection && <td className="px-4 py-1" />}
                {cols.map(c => (
                  <td key={c.tableData!.id} className="px-4 py-1">
                    {c.filtering === false ? null : c.filterComponent ? (
                      c.filterComponent({ columnDef: c, onFilterChanged })
                    ) : (
                      <div className="flex items-center gap-1">
                        {operatorOptions(c).length > 1 && (
                          <select
                            value={opOf(c)}
                            onChange={e =>
                              setOperators(o => ({
                                ...o,
                                [c.tableData!.id]: e.target.value
                              }))
                            }
                            className="rounded border border-bn-border bg-content-box text-foreground px-1 py-1 text-xs focus:border-primary focus:outline-none"
                          >
                            {operatorOptions(c).map(o => (
                              <option key={o.v} value={o.v}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        )}
                        <input
                          type={c.type === "numeric" ? "number" : "text"}
                          className="w-full rounded border border-bn-border bg-content-box text-foreground px-2 py-1 text-xs focus:border-primary focus:outline-none"
                          onChange={e => {
                            setPage(0)
                            onFilterChanged(c.tableData!.id, e.target.value)
                          }}
                        />
                      </div>
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
              <tr className="border-b border-bn-border bg-content-bg/50">
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
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-bn-border">
                    <td colSpan={colSpan} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded-bn bg-icon-muted/20" />
                    </td>
                  </tr>
                ))}
              </>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-icon-muted">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-10 w-10 fill-current opacity-40"
                      aria-hidden="true"
                    >
                      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V5h14v14zM12 7a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1zm0 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                    </svg>
                    <span className="text-sm">{t("emptyDataSourceMessage")}</span>
                  </div>
                </td>
              </tr>
            ) : grouping ? (
              groupItems.map(item =>
                item.kind === "group" ? (
                  isHiddenByCollapse(
                    item.key.slice(0, item.key.lastIndexOf("/"))
                  ) ? null : (
                    <tr key={item.key} className="bg-content-bg/60">
                      <td
                        colSpan={colSpan}
                        className="cursor-pointer select-none px-4 py-2 font-medium"
                        style={{ paddingLeft: 16 + item.depth * 20 }}
                        onClick={() => toggleGroup(item.key)}
                      >
                        {collapsedGroups.has(item.key) ? "▸" : "▾"}{" "}
                        {String(item.value)}{" "}
                        <span className="text-icon-muted">({item.count})</span>
                      </td>
                    </tr>
                  )
                ) : isHiddenByCollapse(item.key) ? null : (
                  renderRow(item.row, item.index)
                )
              )
            ) : (
              rows.map((row, ri) => renderRow(row, ri))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        from={from}
        to={to}
        total={totalCount}
        goto={goto}
      />
    </div>
  )
}

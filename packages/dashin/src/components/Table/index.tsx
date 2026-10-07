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
import { mutationFailureOutcome } from "@/utils/scripts/bulkMutation"

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
  const { columns, data, title, editable, options, actions, detailPanel, onRowClick, onAdd, getRowId } = props
  const isRemote = typeof data === "function"
  const { setStats } = useContext(StatsContext)
  const initialPageSize: number =
    options?.pageSize || DefaultProps.options?.pageSize || 10
  const pageSizeOptions: number[] | undefined = options?.pageSizeOptions || DefaultProps.options?.pageSizeOptions
  const showFiltering = !!options?.filtering
  const showSearch = options?.search !== false
  const showSelection = !!options?.selection

  const PAGESIZE_KEY = "dashin-table:pageSize"
  const storeKey = qGroup && qName ? `dashin-table:${qGroup}/${qName}` : ""
  const saved = useMemo(() => {
    if (!storeKey) return null
    try {
      const raw = sessionStorage.getItem(storeKey)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }, [storeKey])
  const savedPageSize = useMemo(() => {
    try {
      const v = sessionStorage.getItem(PAGESIZE_KEY)
      return v ? Number(v) : null
    } catch { return null }
  }, [])

  const [pageSize, setPageSize] = useState(savedPageSize || initialPageSize)
  const [search, setSearch] = useState<string>(saved?.search || "")
  const [filters, setFilters] = useState<Record<number, any>>(saved?.filters || {})
  const [operators, setOperators] = useState<Record<number, string>>(saved?.operators || {})
  const [orderField, setOrderField] = useState<string | undefined>(saved?.orderField)
  const [orderDir, setOrderDir] = useState<Dir>(saved?.orderDir || "asc")

  const prevStoreKey = React.useRef(storeKey)
  useEffect(() => {
    if (prevStoreKey.current === storeKey) return
    prevStoreKey.current = storeKey
    setSearch(saved?.search || "")
    setFilters(saved?.filters || {})
    setOperators(saved?.operators || {})
    setOrderField(saved?.orderField)
    setOrderDir(saved?.orderDir || "asc")
    setPage(0)
  }, [storeKey, saved])

  // column metadata required by filter/edit selectors (material-table parity)
  const cols = useMemo(() => {
    const list = columns as Column<RowData>[]
    list.forEach((c, id) => (c.tableData = { ...(c.tableData || {}), id }))
    return list.filter(c => !c.hidden)
  }, [columns])

  const orderBy = useMemo(
    () => (orderField ? cols.find(c => c.field === orderField) : undefined),
    [orderField, cols]
  )

  useEffect(() => {
    try { sessionStorage.setItem(PAGESIZE_KEY, String(pageSize)) } catch {}
  }, [pageSize])

  useEffect(() => {
    if (!storeKey) return
    try {
      sessionStorage.setItem(storeKey, JSON.stringify({
        search, filters, operators, orderField, orderDir
      }))
    } catch { /* quota exceeded */ }
  }, [storeKey, search, filters, operators, orderField, orderDir])

  const [allRows, setAllRows] = useState<RowData[]>([])
  const [rows, setRows] = useState<RowData[]>([])
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Query lifecycle: every remote load gets a monotonically increasing
  // sequence number and an AbortController. A response may only write rows /
  // totalCount / loading when it is still the newest request AND the table is
  // still mounted — so a slow stale query can never overwrite a newer result,
  // and an unmounted/route-changed table never writes back. Stats go through
  // `computeStats` (separate cancellation flag), not this path.
  const querySeq = React.useRef(0)
  const queryAbort = React.useRef<AbortController | null>(null)
  const mountedRef = React.useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      queryAbort.current?.abort()
    }
  }, [])
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<Editing<RowData>>(null)
  const [selected, setSelected] = useState<Set<string | number>>(new Set())
  const selectionRows = React.useRef(new Map<string | number, RowData>())
  useEffect(() => {
    if (getRowId) rows.forEach(row => {
      const key = getRowId(row)
      if (selected.has(key)) selectionRows.current.set(key, row)
    })
  }, [rows, selected, getRowId])
  const keyOf = (row: RowData, index: number) => getRowId ? getRowId(row) : index
  useEffect(() => {
    setSelected(new Set())
    selectionRows.current.clear()
  }, [storeKey, getRowId])
  const [bulkBusy, setBulkBusy] = useState(false)

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
    (p: number, signal?: AbortSignal): Query<RowData> => ({
      page: p,
      pageSize,
      search,
      orderBy,
      orderDirection: orderDir,
      signal,
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
      const seq = ++querySeq.current
      queryAbort.current?.abort()
      const abort = new AbortController()
      queryAbort.current = abort

      setIsLoading(true)
      setTableErr(null)
      try {
        const res: QueryResult<RowData> = await (data as any)(buildQuery(p, abort.signal))
        // Stale or unmounted: discard — never overwrite the newer list state.
        if (!mountedRef.current || seq !== querySeq.current) return
        setRows(res.data || [])
        setTotalCount(res.totalCount || 0)
        setPage(res.page ?? p)
        // Selection indexes are page-relative — a fresh result set makes any
        // previous selection point at different rows. Clear it (material-table
        // parity) rather than risk acting on the wrong records.
        if (!getRowId) setSelected(new Set())
      } catch (e: any) {
        // Aborted/stale requests fail silently; only the newest failure is shown.
        if (!mountedRef.current || seq !== querySeq.current) return
        if (e?.name === "AbortError") return
        setTableErr(errorMessage(e, t("Request Failed")))
      } finally {
        if (mountedRef.current && seq === querySeq.current) setIsLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, buildQuery, t, getRowId]
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
  }, [title, isRemote, storeKey])

  // local data: keep the working copy in sync with the `data` prop
  useEffect(() => {
    if (!isRemote) setAllRows((data as RowData[]) || [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // remote: single reload path — covers mount, `data` identity changes and any
  // query change. (Previously the mount also fired the [data] effect, issuing
  // the first page twice.)
  useEffect(() => {
    if (isRemote) loadRemote(0)
    else {
      ++querySeq.current
      queryAbort.current?.abort()
      setIsLoading(false)
    }
    return () => {
      ++querySeq.current
      queryAbort.current?.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, search, orderBy, orderDir, filters, operators, pageSize, storeKey])

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
    // Page-relative selection indexes would silently point at different rows
    // after a local re-slice (sort/search/filter/page change) — clear them.
    if (!getRowId) setSelected(new Set())
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
      setOrderField(c.field as string)
      setOrderDir("asc")
    }
  }

  const onFilterChanged = (id: string | number, value: any) =>
    setFilters(f => ({ ...f, [id]: value }))

  // editing helpers
  const [tableErr, setTableErr] = useState<string | null>(null)
  const startAdd = () => {
    setTableErr(null)
    setEditing({ mode: "add", data: {} as RowData })
  }
  const startEdit = (row: RowData) => {
    setTableErr(null)
    setEditing({ mode: "update", data: { ...row }, original: row })
  }
  const cancel = () => {
    setTableErr(null)
    setEditing(null)
  }
  const setField = (field: string, v: any) => {
    setTableErr(null)
    setEditing(e => (e ? { ...e, data: { ...e.data, [field]: v } } : e))
  }
  const save = async () => {
    if (!editing || !editable) return cancel()
    setTableErr(null)

    // Client-side validation: required and validate
    for (const c of cols) {
      const notEditable = editing.mode === "add"
        ? c.editable === "never" || c.editable === "onUpdate"
        : c.editable === "never" || c.editable === "onAdd"
      if (notEditable) continue

      const field = c.field as string
      if (!field) continue
      const val = (editing.data as any)[field]

      if (c.required) {
        const isEmpty =
          val === undefined ||
          val === null ||
          (typeof val === "string" && val.trim() === "") ||
          (Array.isArray(val) && val.length === 0)
        if (isEmpty) {
          const msg =
            typeof c.required === "string"
              ? c.required
              : `${c.title || field} ${t("is required")}`
          setTableErr(msg)
          return
        }
      }

      if (typeof c.validate === "function") {
        const res = c.validate(val, editing.data)
        if (typeof res === "string" && res) {
          setTableErr(res)
          return
        }
        if (res === false) {
          setTableErr(`${c.title || field} ${t("is invalid")}`)
          return
        }
      }
    }

    try {
      if (editing.mode === "add" && editable.onRowAdd)
        await editable.onRowAdd(editing.data)
      if (editing.mode === "update" && editable.onRowUpdate)
        await editable.onRowUpdate(editing.data, editing.original)
      cancel()
      reload()
    } catch (e: any) {
      setTableErr(e?.message || "Operation failed")
    }
  }
  const remove = async (row: RowData) => {
    if (!editable?.onRowDelete) return
    setTableErr(null)
    try {
      await editable.onRowDelete(row)
      reload()
    } catch (e: any) {
      setTableErr(e?.message || "Delete failed")
    }
  }

  // With an explicit row ID, bulk operations include selected rows on other pages.
  const selectedRows = useMemo(
    () => getRowId
      ? [...selected].map(key => rows.find(row => getRowId(row) === key) ?? selectionRows.current.get(key)!).filter(Boolean)
      : rows.filter((_, i) => selected.has(i)),
    [rows, selected, getRowId]
  )
  const clearSelection = () => { setSelected(new Set()); selectionRows.current.clear() }
  const selectedIndexes = () =>
    getRowId ? selectedRows.map(row => getRowId(row)) :
      [...selected].filter((i): i is number => typeof i === "number" && i >= 0 && i < rows.length).sort((a, b) => a - b)
  const errorMessage = (error: any, fallback: string) =>
    error?.message || error?.error?.message || error?.error || fallback
  const mutationMessage = (error: any, outcome?: string) =>
    `${errorMessage(error, t("Request Failed"))}${(outcome ?? mutationFailureOutcome(error)) === "unknown" ? ` ${t("mutationOutcomeUnknown")}` : ""}`
  const bulkErrorMessage = (error: any, fallback: string, batch: RowData[]) => {
    if (!Array.isArray(error?.resList)) return mutationMessage(error)
    const failed = error.resList.filter((result: any) => result?.error)
    const summary = t("bulkFailureSummary")
      .replace("{0}", String(error.okCount ?? error.resList.length - failed.length))
      .replace("{1}", String(error.failCount ?? failed.length))
    const details = error.resList.map((result: any, index: number) => result?.error
      ? `#${result.id ?? (getRowId && batch[index] ? getRowId(batch[index]) : rowRef(batch[index], index))} ${mutationMessage(result.cause ?? result.error, result.outcome)}` : "").filter(Boolean).join("; ")
    return `${summary} ${details}`.trim()
  }
  const retainFailedFromResults = (error: any, indexes: (string | number)[]) => {
    const results = error?.resList
    if (!Array.isArray(results) || results.length !== indexes.length) return false

    const failedOffsets = results
      .map((result: any, index: number) =>
        result && typeof result === "object" && result.error ? index : -1
      )
      .filter((index: number) => index >= 0)
    if (
      failedOffsets.length === 0 ||
      (typeof error?.failCount === "number" && failedOffsets.length !== error.failCount)
    ) return false

    setSelected(new Set(failedOffsets.map((offset: number) => indexes[offset])))
    return true
  }
  // No ID-field guessing: without getRowId, report the 1-based batch position.
  const rowRef = (_row: RowData, index: number) => index + 1
  const bulkDelete = async () => {
    if (!editable?.onRowDelete || bulkBusy) return
    setTableErr(null)
    setBulkBusy(true)
    const indexes = selectedIndexes()
    const failures: { index: string | number; row: RowData; offset: number; error: any }[] = []
    try {
      for (let i = 0; i < selectedRows.length; i++) {
        try {
          await editable.onRowDelete(selectedRows[i])
        } catch (error) {
          failures.push({ index: indexes[i], row: selectedRows[i], offset: i, error })
        }
      }
      if (failures.length > 0) {
        setSelected(new Set(failures.map(failure => failure.index)))
        const succeeded = indexes.length - failures.length
        const details = failures
          .map(
            ({ row, offset, error }) =>
              `#${getRowId ? getRowId(row) : rowRef(row, offset)} ${mutationMessage(error)}`
          )
          .join("; ")
          .trim()
        setTableErr(
          `${t("bulkFailureSummary")
            .replace("{0}", String(succeeded))
            .replace("{1}", String(failures.length))} ${details}`.trim()
        )
        return
      }
      clearSelection()
      reload()
    } finally {
      setBulkBusy(false)
    }
  }
  const bulkUpdate = async () => {
    if (!editable?.onBulkUpdate || bulkBusy) return
    setTableErr(null)
    setBulkBusy(true)
    const indexes = selectedIndexes()
    const changes: Record<number, { oldData: RowData; newData: RowData }> = {}
    selectedRows.forEach((r, i) => (changes[i] = { oldData: r, newData: r }))
    try {
      await editable.onBulkUpdate(changes)
      clearSelection()
      reload()
    } catch (error: any) {
      if (!retainFailedFromResults(error, indexes)) setSelected(new Set(indexes))
      setTableErr(bulkErrorMessage(error, t("Request Failed"), selectedRows))
    } finally {
      setBulkBusy(false)
    }
  }
  const runBulkAction = async (action: any, event: any) => {
    if (bulkBusy) return
    setTableErr(null)
    setBulkBusy(true)
    const indexes = selectedIndexes()
    try {
      await action.onClick(event, selectedRows)
      clearSelection()
    } catch (error: any) {
      if (!retainFailedFromResults(error, indexes)) setSelected(new Set(indexes))
      setTableErr(bulkErrorMessage(error, t("Request Failed"), selectedRows))
    } finally {
      setBulkBusy(false)
    }
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
        aria-label={String(c.title || field)}
        type={c.type === "numeric" ? "number" : "text"}
        value={(data as any)[field] ?? ""}
        onChange={e => {
          const raw = e.target.value
          setField(field, c.type === "numeric" ? (raw === "" ? "" : Number(raw)) : raw)
        }}
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
      <React.Fragment key={keyOf(row, ri)}>
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
                aria-label={t("detailToggleAriaLabel")}
                aria-expanded={expanded === ri}
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
                disabled={bulkBusy || isLoading}
                aria-label={t("selectRowAriaLabel").replace("{0}", String(ri + 1))}
                checked={selected.has(keyOf(row, ri))}
                onChange={() =>
                  setSelected(s => {
                    const n = new Set(s)
                    const key = keyOf(row, ri)
                    if (n.has(key)) { n.delete(key); selectionRows.current.delete(key) }
                    else { n.add(key); selectionRows.current.set(key, row) }
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
      {/* Error banner */}
      {tableErr && (
        <div
          role="alert"
          aria-live="assertive"
          className="mx-4 my-2 rounded-bn border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger flex items-center justify-between"
        >
          <span>{tableErr}</span>
          <button
            onClick={() => setTableErr(null)}
            className="text-danger hover:opacity-80 text-sm ml-2 font-bold"
            aria-label={t("Dismiss error")}
          >
            ✕
          </button>
        </div>
      )}
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
                disabled={bulkBusy}
                className="rounded px-3 py-1 text-sm text-primary hover:bg-primary/10"
              >
                {t("editTooltip")}
              </button>
            )}
            {editable?.onRowDelete && (
              <button
                onClick={bulkDelete}
                disabled={bulkBusy}
                className="rounded px-3 py-1 text-sm text-danger hover:bg-danger/10"
              >
                {t("deleteTooltip")}
              </button>
            )}
            {bulkActions.map((a, i) => (
              <button
                key={i}
                title={a.tooltip}
                onClick={e => runBulkAction(a, e)}
                disabled={bulkBusy || a.disabled}
                className="rounded p-1.5 text-icon-muted hover:bg-content-bg"
              >
                {typeof a.icon === "function" ? a.icon() : "•"}
              </button>
            ))}
            <button
              onClick={clearSelection}
              aria-label={t("Clear selection")}
              disabled={bulkBusy}
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
                aria-label={t("searchPlaceholder")}
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
              aria-label={t("Refresh Data")}
              onClick={reload}
              className="rounded p-1.5 text-icon-muted hover:bg-content-bg"
            >
              ⟳
            </button>
          </div>
        </div>
      )}

      {/* `options.minTableWidth` (material-table-compatible `Options`) keeps
          wide tables readable: below it the container scrolls instead of
          crushing columns into unreadable slivers. */}
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-sm"
          style={options?.minTableWidth ? { minWidth: options.minTableWidth } : undefined}
        >
          <thead>
            <tr className="border-b border-bn-border text-left">
              {hasDetail && <th className="sticky top-0 z-10 bg-content-box w-8 px-4 py-2" />}
              {showSelection && (
                <th className="sticky top-0 z-10 bg-content-box w-8 px-4 py-2">
                  <input
                    type="checkbox"
                    disabled={bulkBusy || isLoading}
                    aria-label={t("selectAllAriaLabel")}
                    checked={rows.length > 0 && rows.every((row, i) => selected.has(keyOf(row, i)))}
                    onChange={() =>
                      setSelected(s => {
                        const next = new Set(s)
                        const all = rows.every((row, i) => s.has(keyOf(row, i)))
                        rows.forEach((row, i) => {
                          const key = keyOf(row, i)
                          if (all) { next.delete(key); selectionRows.current.delete(key) }
                          else { next.add(key); selectionRows.current.set(key, row) }
                        })
                        return next
                      })
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
                    // `width` doubles as the floor (`minWidth`) so explicit
                    // column widths can't be crushed to zero on narrow view-
                    // ports; `minWidth` overrides it when given separately.
                    style={{ width: c.width, minWidth: c.minWidth ?? c.width }}
                    aria-sort={
                      sorted
                        ? orderDir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className="sticky top-0 z-10 bg-content-box px-4 py-2 font-semibold text-foreground"
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
              {hasRowActions && <th className="sticky top-0 z-10 bg-content-box px-4 py-2 font-semibold text-foreground">{t("actions")}</th>}
            </tr>
            {showFiltering && (
              <tr className="border-b border-bn-border">
                {hasDetail && <td className="px-4 py-1" />}
                {showSelection && <td className="px-4 py-1" />}
                {cols.map(c => (
                  <td key={c.tableData!.id} className="px-4 py-1">
                    {c.filtering === false ? null : c.filterComponent ? (
                      c.filterComponent({ columnDef: c, onFilterChanged })
                    ) : c.lookup ? (
                      <select
                        value={filters[c.tableData!.id] ?? ""}
                        aria-label={t("filterValueAriaLabel").replace("{0}", String(c.title ?? c.field ?? ""))}
                        onChange={e => {
                          setPage(0)
                          onFilterChanged(c.tableData!.id, e.target.value)
                        }}
                        className="w-full rounded border border-bn-border bg-content-box text-foreground px-2 py-1 text-xs focus:border-primary focus:outline-none"
                      >
                        <option value="">{t("All")}</option>
                        {Object.entries(c.lookup).map(([k, v]) => (
                          <option key={k} value={k}>{String(v)}</option>
                        ))}
                      </select>
                    ) : c.type === "boolean" ? (
                      <select
                        value={filters[c.tableData!.id] ?? ""}
                        aria-label={t("filterValueAriaLabel").replace("{0}", String(c.title ?? c.field ?? ""))}
                        onChange={e => {
                          setPage(0)
                          onFilterChanged(c.tableData!.id, e.target.value)
                        }}
                        className="w-full rounded border border-bn-border bg-content-box text-foreground px-2 py-1 text-xs focus:border-primary focus:outline-none"
                      >
                        <option value="">{t("All")}</option>
                        <option value="true">✓</option>
                        <option value="false">✗</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-1">
                        {operatorOptions(c).length > 1 && (
                          <select
                            value={opOf(c)}
                            aria-label={t("filterOperatorAriaLabel").replace("{0}", String(c.title ?? c.field ?? ""))}
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
                          type={c.type === "numeric" ? "number" : c.type === "date" || c.type === "datetime" ? "date" : "text"}
                          aria-label={t("filterValueAriaLabel").replace("{0}", String(c.title ?? c.field ?? ""))}
                          value={filters[c.tableData!.id] ?? ""}
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
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        from={from}
        to={to}
        total={totalCount}
        goto={goto}
        onPageSizeChange={size => { setPageSize(size); setPage(0) }}
      />
    </div>
  )
}

import React, { createRef, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import Table, { TableHead } from "../Table"
import tableIcons from "../Table/models/tableIcons"
import { TableDefaultProps } from "../Table/models/defaultProps"
import { Action, Column, EditableData, Query, QueryResult } from "../Table/models/material-table-shim"
import DetailDrawer from "../DetailDrawer"

const theme = { dashin: { iconColor: "#8f9bb3" } }

export interface CrudTableProps<T extends object> {
  title: string
  columns: Column<T>[]
  /** Row source — the same shape <Table/> accepts (array, or an async query fn
   *  such as an adapter's data controller). */
  data: T[] | ((query: Query<T>) => Promise<QueryResult<T>>)
  /** CRUD handlers (e.g. from an adapter's editable controller). Omit for a
   *  read-only table (no per-row action column, no Add). */
  editable?: EditableData<T>
  /** Extra toolbar actions (e.g. a bulk-delete action). */
  actions?: (Action<T> | ((rowData: T) => Action<T>))[]
  /** Hide the built-in Add button even when `editable.onRowAdd` exists. */
  disableAdd?: boolean
  /** Map a failed-save error to the drawer's inline banner message. */
  formatError?: (e: unknown) => string
}

/**
 * A batteries-included CRUD table: a `<Table/>` plus a `<DetailDrawer/>` and the
 * view / create / edit / delete state machine every plugin otherwise hand-rolls.
 * Row click → view; a per-row **Edit** opens the drawer straight into edit;
 * **Delete** removes inline (with confirm); **Add** opens create. Editing is done
 * in the roomy drawer (where custom field editors live), not in-cell.
 *
 * Adapter-agnostic: pass a `data` source and `editable` handlers from whichever
 * source package you use (e.g. `dataCtrl`/`editableCtrl` for Payload).
 */
export default function CrudTable<T extends object>({
  title,
  columns,
  data,
  editable,
  actions,
  disableAdd,
  formatError
}: CrudTableProps<T>) {
  const { t } = useTranslation("table")
  const tableRef = createRef<any>()
  const [drawerRow, setDrawerRow] = useState<T | null>(null)
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">("view")
  const [refreshKey, setRefreshKey] = useState(0)

  const reload = () => setRefreshKey(k => k + 1)
  const openCreate = () => {
    setDrawerRow(null)
    setDrawerMode("create")
  }
  const openRow = (row: T) => {
    setDrawerMode("view")
    setDrawerRow(row)
  }
  const openEdit = (row: T) => {
    setDrawerMode("edit")
    setDrawerRow(row)
  }
  const closeDrawer = () => {
    setDrawerRow(null)
    setDrawerMode("view")
  }

  const deleteRow = async (row: T) => {
    if (!editable?.onRowDelete) return
    if (typeof window !== "undefined" && !window.confirm(t("Delete this record? This cannot be undone."))) return
    try {
      await editable.onRowDelete(row)
      reload()
    } catch {
      // the delete controller surfaces its own error notice
    }
  }

  // Per-row action column: keep inline buttons, but Edit opens the drawer (no
  // cramped in-cell editing). Shown on the table only — not in the drawer's own
  // column list. stopPropagation so the buttons don't also fire the row click.
  const actionColumn = useMemo<Column<T>>(
    () => ({
      title: t("Actions"),
      field: "__actions" as any,
      editable: "never",
      sorting: false,
      filtering: false,
      width: 120,
      render: (row: T) => (
        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
          {editable?.onRowUpdate && (
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
              onClick={() => openEdit(row)}
            >
              {t("Edit")}
            </button>
          )}
          {editable?.onRowDelete && (
            <button
              type="button"
              className="text-sm font-medium text-danger hover:underline"
              onClick={() => deleteRow(row)}
            >
              {t("Delete")}
            </button>
          )}
        </div>
      )
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editable, t]
  )

  const hasRowActions = !!(editable?.onRowUpdate || editable?.onRowDelete)
  const tableColumns = useMemo(
    () => (hasRowActions ? [...columns, actionColumn] : columns),
    [columns, actionColumn, hasRowActions]
  )

  return (
    <>
      <TableHead title={title} />
      <Table<T>
        key={refreshKey}
        tableRef={tableRef}
        title={title}
        columns={tableColumns}
        style={TableDefaultProps.style}
        icons={tableIcons({ theme })}
        options={{ ...TableDefaultProps.options, filtering: true }}
        data={data}
        actions={actions}
        // `editable` is intentionally NOT passed to the table → no in-cell editing;
        // editing happens in the drawer. The per-row Edit button opens it.
        onRowClick={(_e, row) => {
          if (row) openRow(row)
        }}
        onAdd={disableAdd || !editable?.onRowAdd ? undefined : openCreate}
      />
      <DetailDrawer<T>
        row={drawerRow}
        columns={columns}
        editable={editable}
        mode={drawerMode}
        onClose={closeDrawer}
        onSaved={reload}
        formatError={formatError}
      />
    </>
  )
}

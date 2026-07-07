import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Column, EditComponentProps, EditableData } from "../Table/models/material-table-shim"
import { display } from "../Table/models/tableLogic"
import Input from "../ui/Input"
import Select from "../ui/Select"
import Label from "../ui/Label"

/** Best-effort human-readable message from a failed save — walks the Payload
 *  nested error shape (`errors[0].data.errors[0].message`) plus common shapes.
 *  Override via the `formatError` prop. */
function defaultErrorMessage(e: any): string {
  const body = (e && (e.response?.data ?? e.data)) ?? e
  const outer = body?.errors?.[0]
  const msg =
    outer?.data?.errors?.[0]?.message ||
    outer?.message ||
    body?.message ||
    (typeof e?.message === "string" ? e.message : "")
  return String(msg || "").trim() || "Something went wrong"
}

export interface DetailDrawerProps<RowData extends object> {
  row: RowData | null
  columns: Column<RowData>[]
  editable?: EditableData<RowData>
  /** `"edit"` opens straight into the edit form (e.g. an inline row Edit button). */
  mode?: "view" | "create" | "edit"
  onClose: () => void
  onSaved?: () => void
  /** Base z-index; overlay = zBase, panel = zBase + 100. Raise it to stack drawers. */
  zBase?: number
  /** Map a failed-save error to the inline banner message (default: generic extractor). */
  formatError?: (e: unknown) => string
}

export default function DetailDrawer<RowData extends object>({
  row,
  columns,
  editable,
  mode = "view",
  onClose,
  onSaved,
  zBase = 1200,
  formatError
}: DetailDrawerProps<RowData>) {
  const isCreate = mode === "create"
  const startEditing = isCreate || mode === "edit"
  const [editing, setEditing] = useState(startEditing)
  const [draft, setDraft] = useState<RowData | null>(isCreate ? {} as RowData : row ? { ...row } : null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setConfirmDelete(false)
    setSaving(false)
    setErr(null)
    if (isCreate) {
      setEditing(true)
      setDraft({} as RowData)
    } else {
      setEditing(mode === "edit")
      setDraft(row ? { ...row } : null)
    }
  }, [row, mode])

  const open = isCreate || !!row

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  const visibleCols = useMemo(
    () => columns.filter(c => !c.hidden && c.field),
    [columns]
  )

  const setField = useCallback(
    (field: string, value: any) =>
      setDraft(d => (d ? { ...d, [field]: value } : d)),
    []
  )

  const handleSave = async () => {
    if (!draft) return
    setSaving(true)
    setErr(null)
    try {
      if (isCreate) {
        if (!editable?.onRowAdd) return
        await editable.onRowAdd(draft)
      } else {
        if (!editable?.onRowUpdate) return
        await editable.onRowUpdate(draft, row!)
      }
      setEditing(false)
      onClose()
      onSaved?.()
    } catch (e) {
      // Keep the drawer open and show why the save failed (e.g. a duplicate).
      setErr((formatError ?? defaultErrorMessage)(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!row || !editable?.onRowDelete) return
    setSaving(true)
    try {
      await editable.onRowDelete(row)
      onClose()
      onSaved?.()
    } finally {
      setSaving(false)
    }
  }

  const canEdit = !!editable?.onRowUpdate
  const canDelete = !isCreate && !!editable?.onRowDelete

  if (!open) return null

  const title = isCreate ? "New" : editing ? "Edit" : "Details"

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity"
        style={{ zIndex: zBase }}
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        className="fixed inset-y-0 right-0 w-full max-w-md bg-content-box shadow-xl flex flex-col transition-transform duration-300 ease-in-out"
        style={{ zIndex: zBase + 100 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bn-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground truncate">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {canEdit && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="rounded-bn px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-bn p-1.5 text-icon-muted hover:bg-content-bg transition-colors"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {editing && draft ? (
            <EditForm
              columns={visibleCols}
              data={draft}
              setField={setField}
              isCreate={isCreate}
            />
          ) : row ? (
            <PreviewFields columns={visibleCols} row={row} />
          ) : null}
        </div>

        {/* Footer */}
        {editing && (
          <>
            {err && (
              <div className="mx-6 mb-1 mt-2 rounded-bn border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {err}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-bn-border px-6 py-4">
            <div className="flex items-center gap-2">
              {canDelete && !confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={saving}
                  className="rounded-bn px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              )}
              {canDelete && confirmDelete && (
                <>
                  <span className="text-xs text-danger">Delete?</span>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="rounded-bn px-2 py-1 text-sm font-medium text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                    title="Confirm delete"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={saving}
                    className="rounded-bn px-2 py-1 text-sm font-medium text-icon-muted hover:bg-content-bg transition-colors disabled:opacity-50"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isCreate || mode === "edit") { onClose(); return }
                  setEditing(false)
                  setDraft(row ? { ...row } : null)
                  setErr(null)
                }}
                disabled={saving}
                className="rounded-bn px-3 py-1.5 text-sm font-medium text-icon-muted hover:bg-content-bg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-bn bg-primary-gradient px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-bn hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Saving…" : isCreate ? "Create" : "Save"}
              </button>
            </div>
          </div>
          </>
        )}
      </aside>
    </>
  )
}

function PreviewFields<RowData extends object>({
  columns,
  row
}: {
  columns: Column<RowData>[]
  row: RowData
}) {
  return (
    <dl className="space-y-4">
      {columns.map(col => (
        <div key={String(col.field)}>
          <dt className="text-xs font-medium text-icon-muted uppercase tracking-wide mb-1">
            {col.title}
          </dt>
          <dd className="text-sm text-foreground">
            {col.renderDetail ? col.renderDetail(row) : display(col, row) ?? "—"}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function EditForm<RowData extends object>({
  columns,
  data,
  setField,
  isCreate
}: {
  columns: Column<RowData>[]
  data: RowData
  setField: (field: string, value: any) => void
  isCreate?: boolean
}) {
  return (
    <div className="space-y-4">
      {columns.map(col => {
        const field = col.field as string
        const value = (data as any)[field]
        const readOnly = !isCreate && col.editable === "never"
        const hidden = isCreate && col.editable === "never"

        if (hidden) return null

        return (
          <div key={field}>
            <Label className="mb-1 block">{col.title}</Label>
            {readOnly ? (
              <div className="rounded-bn border border-bn-border bg-content-bg px-2.5 py-1.5 text-sm text-icon-muted">
                {col.renderDetail ? col.renderDetail(data) : display(col, data) ?? "—"}
              </div>
            ) : col.editComponent ? (
              <EditComponentWrapper col={col} data={data} value={value} setField={setField} />
            ) : col.lookup ? (
              <Select
                className="w-full"
                value={value ?? ""}
                onChange={e => setField(field, e.target.value)}
              >
                <option value="">—</option>
                {Object.entries(col.lookup).map(([k, v]) => (
                  <option key={k} value={k}>{String(v)}</option>
                ))}
              </Select>
            ) : (
              <Input
                className="w-full"
                type={col.type === "numeric" ? "number" : "text"}
                value={value ?? ""}
                onChange={e =>
                  setField(
                    field,
                    col.type === "numeric" ? Number(e.target.value) : e.target.value
                  )
                }
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function EditComponentWrapper<RowData extends object>({
  col,
  data,
  value,
  setField
}: {
  col: Column<RowData>
  data: RowData
  value: any
  setField: (field: string, value: any) => void
}) {
  const field = col.field as string
  const props: EditComponentProps<RowData> = {
    columnDef: col,
    rowData: data,
    value,
    onChange: v => setField(field, v),
    onRowDataChange: () => {}
  }
  return <>{col.editComponent!(props)}</>
}

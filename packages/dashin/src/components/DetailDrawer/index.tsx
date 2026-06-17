import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Column, EditComponentProps, EditableData } from "../Table/models/material-table-shim"
import { display } from "../Table/models/tableLogic"
import Input from "../ui/Input"
import Select from "../ui/Select"
import Label from "../ui/Label"

export interface DetailDrawerProps<RowData extends object> {
  row: RowData | null
  columns: Column<RowData>[]
  editable?: EditableData<RowData>
  onClose: () => void
  onSaved?: () => void
}

export default function DetailDrawer<RowData extends object>({
  row,
  columns,
  editable,
  onClose,
  onSaved
}: DetailDrawerProps<RowData>) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<RowData | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    setEditing(false)
    setConfirmDelete(false)
    setDraft(row ? { ...row } : null)
  }, [row])

  useEffect(() => {
    if (!row) return
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", onKey)
    }
  }, [row, onClose])

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
    if (!draft || !editable?.onRowUpdate) return
    setSaving(true)
    try {
      await editable.onRowUpdate(draft, row!)
      setEditing(false)
      onSaved?.()
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
  const canDelete = !!editable?.onRowDelete

  if (!row) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[1200] transition-opacity"
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        className="fixed inset-y-0 right-0 z-[1300] w-full max-w-md bg-content-box shadow-xl flex flex-col transition-transform duration-300 ease-in-out"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-bn-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground truncate">
            {editing ? "Edit" : "Details"}
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
            />
          ) : (
            <PreviewFields columns={visibleCols} row={row} />
          )}
        </div>

        {/* Footer */}
        {editing && (
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
                  setEditing(false)
                  setDraft(row ? { ...row } : null)
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
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
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
          <dd className="text-sm text-foreground">{display(col, row) ?? "—"}</dd>
        </div>
      ))}
    </dl>
  )
}

function EditForm<RowData extends object>({
  columns,
  data,
  setField
}: {
  columns: Column<RowData>[]
  data: RowData
  setField: (field: string, value: any) => void
}) {
  return (
    <div className="space-y-4">
      {columns.map(col => {
        const field = col.field as string
        const value = (data as any)[field]
        const readOnly = col.editable === "never"

        return (
          <div key={field}>
            <Label className="mb-1 block">{col.title}</Label>
            {readOnly ? (
              <div className="rounded-bn border border-bn-border bg-content-bg px-2.5 py-1.5 text-sm text-icon-muted">
                {display(col, data) ?? "—"}
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

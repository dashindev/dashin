import { Column } from "@dashin-dev/dashin"
import { AtomoModelMeta } from "./types"

export function humanizeTitle(name: string): string {
  if (!name) return ""
  if (name.toLowerCase() === "id") return "ID"
  // Handle snake_case and camelCase
  const withSpaces = name
    .replace(/_([a-z])/g, (_, c) => ` ${c.toUpperCase()}`)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

export function mapAtomoTypeToColumnType(
  type: string
): "string" | "numeric" | "boolean" | "datetime" {
  switch (type) {
    case "number":
      return "numeric"
    case "boolean":
      return "boolean"
    case "datetime":
      return "datetime"
    case "string":
    case "text":
    case "email":
    case "url":
    case "select":
    case "relation":
    case "blocks":
    case "json":
    case "id":
    default:
      return "string"
  }
}

export interface SchemaMapperOptions {
  /** Optional custom title formatter */
  formatTitle?: (fieldName: string) => string
  /** Fields that should always be hidden in the list view */
  alwaysHiddenFields?: string[]
  /** Override column definitions by field name */
  overrides?: Record<string, Partial<Column<any>>>
}

export function atomoFieldsToDashinColumns<RowData extends object = any>(
  modelMeta: AtomoModelMeta,
  options: SchemaMapperOptions = {}
): Column<RowData>[] {
  const { formatTitle = humanizeTitle, alwaysHiddenFields = ["id"], overrides = {} } = options
  const columns: Column<RowData>[] = []

  const listView = modelMeta.ui?.listView

  for (const [fieldName, field] of Object.entries(modelMeta.fields || {})) {
    const isId = fieldName === "id" || field.attributes?.includes("primary")
    const isReadonly = isId || field.attributes?.includes("readonly") || fieldName === "createdAt" || fieldName === "updatedAt"

    // Determine hidden status:
    // 1. If explicit listView is provided on the model, honor it.
    // 2. Otherwise default to hiding id and complex objects from list table.
    let isHidden = false
    if (listView && Array.isArray(listView) && listView.length > 0) {
      isHidden = !listView.includes(fieldName)
    } else if (alwaysHiddenFields.includes(fieldName)) {
      isHidden = true
    }

    const colType = mapAtomoTypeToColumnType(field.type)

    const col: Column<RowData> = {
      title: formatTitle(fieldName),
      field: fieldName,
      type: colType,
      hidden: isHidden,
      editable: isReadonly ? "never" : undefined,
      filtering: colType !== "datetime" && field.type !== "blocks" && field.type !== "json",
    }

    // Apply any field-level overrides
    if (overrides[fieldName]) {
      Object.assign(col, overrides[fieldName])
    }

    columns.push(col)
  }

  return columns
}

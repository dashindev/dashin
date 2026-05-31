import { Column } from "@/components/Table/models/material-table-shim"

/**
 * Loop handling columns
 * @param t i18n
 * @param columns {Column<object>[]}
 */
export default function columnsController<RowData extends object>({
  t,
  columns
}: {
  t: any
  columns: Column<RowData>[]
}): Column<RowData>[] {
  columns.map(column => {
    // bigint (*id field) to string
    if (typeof column.field === "string" && column.field.indexOf("id") > -1) {
      // @ts-ignore
      column.render = r => r.id && r.id.toString()
    }
    // translate i18n
    column.title = t(column.title)

    return column
  })

  return columns
}

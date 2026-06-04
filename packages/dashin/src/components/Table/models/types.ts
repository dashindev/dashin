import { MaterialTableProps, EditableData } from "./material-table-shim"
import { EditableCtrl } from "@/utils"
import { TFunction } from "i18next"
import { RefObject } from "react"

export interface TableProps<RowData extends object>
  extends MaterialTableProps<RowData> {}

export type EditableDataType<RowData extends object> = EditableData<RowData>

export type BulkUpdateProps<RowData> = EditableCtrl & {
  changes: Record<number, { oldData: RowData; newData: RowData }>
}

export type BulkDeleteProps = {
  t: TFunction
  SchemaName: string
  tableRef: RefObject<any>
  primaryKey?: string
}

export * from "./material-table-shim"

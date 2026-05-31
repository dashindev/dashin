/**
 * Local shim for the (removed) `material-table` type surface.
 * Only the types actually consumed across bunadmin are reproduced here.
 * The runtime table is a lightweight Tailwind implementation (see ../index.tsx).
 */
import { ReactNode } from "react"

export interface Column<RowData extends object> {
  field?: any
  title?: any
  hidden?: boolean
  width?: number | string
  grouping?: boolean
  filtering?: boolean
  editable?: "always" | "onUpdate" | "onAdd" | "never"
  type?:
    | "string"
    | "boolean"
    | "numeric"
    | "date"
    | "datetime"
    | "time"
    | "currency"
  lookup?: { [key: string]: any }
  render?: (rowData: RowData) => any
  editComponent?: (props: EditComponentProps<RowData>) => ReactNode
  filterComponent?: (props: FilterComponentProps<RowData>) => ReactNode
  // material-table internal row metadata used by selectors
  tableData?: { id: number; [k: string]: any }
  [key: string]: any
}

export interface EditComponentProps<RowData extends object = any> {
  columnDef: Column<RowData>
  rowData: RowData
  value: any
  onChange: (value: any) => void
  onRowDataChange: (rowData: RowData) => void
  error?: boolean
}

export interface FilterComponentProps<RowData extends object = any> {
  columnDef: Column<RowData>
  onFilterChanged: (rowId: string | number, value: any) => void
}

export interface Filter<RowData extends object = any> {
  column: Column<RowData>
  operator: "=" | "<>"
  value: any
}

export interface Query<RowData extends object = any> {
  filters: Filter<RowData>[]
  page: number
  pageSize: number
  search: string
  orderBy?: Column<RowData>
  orderDirection: "asc" | "desc"
}

export interface QueryResult<RowData extends object = any> {
  data: RowData[]
  page: number
  totalCount: number
}

export interface Action<RowData extends object = any> {
  icon: string | (() => ReactNode)
  tooltip?: string
  isFreeAction?: boolean
  onClick: (event: any, data: RowData | RowData[]) => void
  disabled?: boolean
}

export interface EditableData<RowData extends object = any> {
  isEditable?: (rowData: RowData) => boolean
  isDeletable?: (rowData: RowData) => boolean
  onRowAdd?: (newData: RowData) => Promise<any>
  onRowUpdate?: (newData: RowData, oldData?: RowData) => Promise<any>
  onRowDelete?: (oldData: RowData) => Promise<any>
  onBulkUpdate?: (changes: {
    [k: number]: { oldData: RowData; newData: RowData }
  }) => Promise<any>
}

export interface Localization {
  header?: any
  toolbar?: any
  body?: any
  grouping?: any
  pagination?: any
}

export type Icons = { [name: string]: any }

export interface Options<RowData extends object = any> {
  [key: string]: any
}

/** Props accepted by the bunadmin <Table/> (material-table compatible subset). */
export interface MaterialTableProps<RowData extends object> {
  title?: string | ReactNode
  columns: Column<RowData>[]
  data: RowData[] | ((query: Query<RowData>) => Promise<QueryResult<RowData>>)
  editable?: EditableData<RowData>
  actions?: (Action<RowData> | ((rowData: RowData) => Action<RowData>))[]
  icons?: Icons
  options?: Options<RowData>
  localization?: Localization
  style?: React.CSSProperties
  isLoading?: boolean
  tableRef?: any
  components?: { [key: string]: (props: any) => ReactNode }
  detailPanel?:
    | ((rowData: RowData) => ReactNode)
    | { icon?: any; tooltip?: string; render: (rowData: RowData) => ReactNode }[]
  onRowClick?: (event?: any, rowData?: RowData) => void
  // allow other material-table props without type errors
  [key: string]: any
}

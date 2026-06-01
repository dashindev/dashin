import { TFunction } from "i18next"
import { Query, ListServiceRes } from "@xbuilder/bunadmin"

export type DataCtrl<RowData extends object> = {
  t?: TFunction
  listService?: () => Promise<ListServiceRes>
  tableQuery: ListService<RowData>["tableQuery"]
  path?: ListService<RowData>["path"]
  prefix?: ListService<RowData>["prefix"]
  searchField?: ListService<RowData>["searchField"]
}

export type ListService<RowData extends object> = {
  tableQuery: Query<RowData>
  /** SQLite table name */
  path: string
  prefix?: string
  searchField?: "name" | string
}

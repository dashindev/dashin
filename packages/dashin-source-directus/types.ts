import { TFunction } from "i18next"
import { Query, ListServiceRes } from "@dashin-dev/dashin"

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
  /** Directus collection name */
  path: string
  prefix?: string
  searchField?: "name" | string
}

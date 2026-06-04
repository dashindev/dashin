import { TFunction } from "i18next"
import { Query } from "@dashin-dev/dashin"
import { ListServiceRes } from "@dashin-dev/dashin"

export type DataCtrl<RowData extends object> = {
  t?: TFunction
  listService?: () => Promise<ListServiceRes>
  tableQuery: ListService<RowData>["tableQuery"]
  path?: ListService<RowData>["path"]
  prefix?: ListService<RowData>["prefix"]
  searchField?: ListService<RowData>["searchField"]
  searchSuffix?: ListService<RowData>["searchSuffix"]
}

export type ListService<RowData extends object> = {
  tableQuery: Query<RowData>
  path: string
  prefix?: string
  searchField?: "name" | string
  searchSuffix?: "_contains" | string
}

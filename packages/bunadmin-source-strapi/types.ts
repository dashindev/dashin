import { TFunction } from "i18next"
import { Query } from "material-table"
import { ListServiceRes } from "@xbuilder/bunadmin"

export type DataCtrl<RowData extends object> = {
  t?: TFunction
  listService?: () => Promise<ListServiceRes>
  tableQuery: ListService<RowData>["tableQuery"]
  path?: ListService<RowData>["path"]
  prefix?: ListService<RowData>["prefix"]
  skipCount?: ListService<RowData>["skipCount"]
  fixCount?: ListService<RowData>["skipCount"]
  searchField?: ListService<RowData>["searchField"]
  searchSuffix?: ListService<RowData>["searchSuffix"]
}

export type ListService<RowData extends object> = {
  tableQuery: Query<RowData>
  path: string
  prefix?: string
  skipCount?: boolean
  fixCount?: boolean // strapi core APIs (*/count) return number, plugins return { count: number }
  searchField?: "name" | string
  searchSuffix?: "_contains" | string
}

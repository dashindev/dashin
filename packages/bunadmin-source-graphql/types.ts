import { Query } from "material-table"
import { TFunction } from "i18next"
import { ListServiceRes } from "@xbuilder/bunadmin"

export interface DataCtrl {
  t?: TFunction
  tableQuery: ListService["tableQuery"]
  name: ListService["name"]
  fields: ListService["fields"]
  path?: ListService["path"]
  prefix?: ListService["prefix"]
  searchField?: ListService["searchField"]
  searchSuffix?: ListService["searchSuffix"]
  listService?: () => Promise<ListServiceRes>
}

export type ListService = {
  tableQuery: Query<any>
  name: string
  fields: string // graphql selecting fields
  path?: string
  prefix?: string
  variables?: object
  skipCount?: boolean
  searchField?: "name" | string
  searchSuffix?: "_like" | string
}

/**
 * Remote data controller (Appwrite)
 */
import listSer from "../services/listSer"
import { DataCtrl, ListService } from "../types"
import { notice, QueryResult } from "@dashin-dev/dashin"

export default async function dataCtrl<RowData extends object>({
  t,
  listService,
  ...sharedProps
}: DataCtrl<RowData>): Promise<QueryResult<RowData>> {
  const { path, tableQuery } = sharedProps

  let data: any
  let errors
  let totalCount = 0

  if (listService) {
    const resp = await listService()
    data = resp.data
    errors = resp.errors
    totalCount = resp.totalCount
  } else if (path) {
    const resp = await listSer({ path, ...sharedProps } as ListService<RowData>)
    data = resp.data
    errors = resp.errors
    totalCount = resp.totalCount
  } else {
    await notice({
      title: t ? t("One of the listService or path is required") : "path required",
      severity: "error"
    })
    return { page: tableQuery.page, data: [], totalCount: 0 }
  }

  if (errors) {
    await notice({
      title: t ? t("Request Failed") : "Request Failed",
      severity: "error",
      content: JSON.stringify(errors)
    })
    return { page: tableQuery.page, data: [], totalCount: 0 }
  }

  return { page: tableQuery.page, data, totalCount }
}

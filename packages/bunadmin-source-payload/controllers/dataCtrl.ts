import listSer from "../services/listSer"
import { DataCtrl, ListService } from "../types"
import { notice, QueryResult } from "@xbuilder/bunadmin"

export default async function dataCtrl<RowData extends object>({
  t,
  listService,
  ...sharedProps
}: DataCtrl<RowData>): Promise<QueryResult<RowData>> {
  const { path, tableQuery } = sharedProps
  let data: any, errors, totalCount = 0

  if (listService) {
    const r = await listService(); data = r.data; errors = r.errors; totalCount = r.totalCount
  } else if (path) {
    const r = await listSer({ path, ...sharedProps } as ListService<RowData>)
    data = r.data; errors = r.errors; totalCount = r.totalCount
  } else {
    await notice({ title: t ? t("One of the listService or path is required") : "path required", severity: "error" })
    return { page: tableQuery.page, data: [], totalCount: 0 }
  }

  if (errors) {
    await notice({ title: t ? t("Request Failed") : "Request Failed", severity: "error", content: JSON.stringify(errors) })
    return { page: tableQuery.page, data: [], totalCount: 0 }
  }
  return { page: tableQuery.page, data, totalCount }
}

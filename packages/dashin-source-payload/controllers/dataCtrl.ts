import listSer from "../services/listSer"
import { DataCtrl, ListService } from "../types"
import { QueryResult } from "@dashin-dev/dashin"
import { errMessage } from "../services/errors"

export default async function dataCtrl<RowData extends object>({
  t,
  listService,
  ...sharedProps
}: DataCtrl<RowData>): Promise<QueryResult<RowData>> {
  const { path, tableQuery } = sharedProps
  let data: any, errors, totalCount = 0

  if (listService) {
    const r = await listService(tableQuery); data = r.data; errors = r.errors; totalCount = r.totalCount
  } else if (path) {
    const r = await listSer({ path, ...sharedProps } as ListService<RowData>)
    data = r.data; errors = r.errors; totalCount = r.totalCount
  } else {
    throw new Error(t ? t("One of the listService or path is required") : "path required")
  }

  if (errors && (!Array.isArray(errors) || errors.length)) {
    if (errors instanceof Error) throw errors
    throw Object.assign(new Error(errMessage(Array.isArray(errors) ? { errors } : errors)), {
      data: { errors }, cause: errors
    })
  }
  return { page: tableQuery.page, data, totalCount }
}

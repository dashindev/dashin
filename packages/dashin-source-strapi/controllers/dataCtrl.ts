/**
 * Remote data controller
 */
import listSer from "../services/listSer"
import { DataCtrl, ListService } from "../types"
import { notice } from "@dashin-dev/dashin"
import { QueryResult } from "@dashin-dev/dashin"

export default async function dataCtrl<RowData extends object>({
  t,
  listService,
  ...sharedProps
}: DataCtrl<RowData>): Promise<QueryResult<RowData>> {
  const { path, tableQuery } = sharedProps

  let data: any,
    errors,
    totalCount = 0

  if (listService && path) {
    await notice({
      title: t
        ? t("Only one of listService or path is needed")
        : "Only one of listService or path is needed",
      severity: "error"
    })
    return {
      page: tableQuery.page,
      data: [],
      totalCount: 0
    }
  }

  if (!listService && !path) {
    await notice({
      title: t
        ? t("One of the listService or path is required")
        : "One of the listService or path is required",
      severity: "error"
    })
    return {
      page: tableQuery.page,
      data: [],
      totalCount: 0
    }
  }

  if (listService) {
    const resp = await listService()
    data = resp.data
    errors = resp.errors
    totalCount = resp.totalCount
  }

  if (path) {
    const listSerProps: ListService<RowData> = {
      path,
      ...sharedProps
    }

    const resp = await listSer(listSerProps)
    data = resp.data
    errors = resp.errors
    totalCount = resp.totalCount
  }

  if (errors) {
    await notice({
      title: t ? t("Request Failed") : "Request Failed",
      severity: "error",
      content: JSON.stringify(errors)
    })
    return {
      page: tableQuery.page,
      data: [],
      totalCount: 0
    }
  }

  return {
    page: tableQuery.page,
    data,
    totalCount: totalCount
  }
}

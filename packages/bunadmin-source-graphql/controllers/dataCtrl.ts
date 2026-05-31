/**
 * Remote data controller
 */
import { QueryResult } from "@xbuilder/bunadmin"
import { notice } from "@xbuilder/bunadmin"
import listSer from "../services/listSer"
import { DataCtrl, ListService } from "../types"

export default async function dataCtrl({
  t,
  listService,
  ...sharedProps
}: DataCtrl): Promise<QueryResult<any>> {
  const { path, tableQuery } = sharedProps

  let data: any, errors, totalCount: number

  if (listService) {
    const resp = await listService()
    data = resp.data
    errors = resp.errors
    totalCount = resp.totalCount
  } else {
    const listSerProps: ListService = {
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

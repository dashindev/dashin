import { QueryResult, notice } from "@dashin-dev/dashin"
import { atomoListRecords } from "../client"
import { buildAtomoQueryParams } from "../services/filter"
import { AtomoDataCtrlProps } from "../types"

export default async function dataCtrl<RowData extends object>({
  model,
  tableQuery,
  searchField = "name",
  t,
  baseUrl,
  formatError,
}: AtomoDataCtrlProps<RowData>): Promise<QueryResult<RowData>> {
  if (!model) {
    const msg = t ? t("Model name is required for Atomo dataCtrl") : "Model name is required"
    await notice({ title: msg, severity: "error" })
    return { page: tableQuery.page, data: [], totalCount: 0 }
  }

  try {
    const params = buildAtomoQueryParams(tableQuery, searchField)
    const res = await atomoListRecords<RowData>(model, params, { baseUrl })

    return {
      page: tableQuery.page,
      data: res.data,
      totalCount: res.totalCount,
    }
  } catch (err: any) {
    const errorMsg = formatError
      ? formatError(err)
      : err?.message || (t ? t("Failed to load records") : "Failed to load records")
    await notice({
      title: t ? t("Request Failed") : "Request Failed",
      severity: "error",
      content: errorMsg,
    })
    return { page: tableQuery.page, data: [], totalCount: 0 }
  }
}

/**
 * Remote data controller (Payload CMS)
 * GET /api/{collection}?where[..]&sort&limit&page -> { docs, totalDocs }
 */
import { ENV, request } from "@dashin-dev/dashin"
import { ListService } from "../types"
import { buildParams } from "./filter"
import { plHeaders, apiPath } from "./plConfig"

export default async function listSer<RowData extends object>({
  tableQuery,
  path,
  prefix,
  searchField = "name"
}: ListService<RowData>) {
  const { search: searchWords, filters = [], orderBy, orderDirection, page, pageSize } = tableQuery

  const params = buildParams(filters as any, {
    searchWords,
    searchField,
    page,
    pageSize,
    orderBy,
    orderDirection
  })

  const res = await request(apiPath(path), {
    params,
    prefix: prefix || ENV.MAIN_URL || ENV.AUTH_URL,
    method: "GET",
    headers: await plHeaders()
  })

  return {
    data: (res && res.docs) || [],
    totalCount: (res && res.totalDocs) || (res && res.docs ? res.docs.length : 0),
    errors: res && res.errors ? res.errors : undefined
  }
}

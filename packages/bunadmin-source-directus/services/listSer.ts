/**
 * Remote data controller (Directus)
 * GET /items/{collection}?filter[..]&sort&limit&offset&meta=filter_count
 *   -> { data: RowData[], meta: { filter_count } }
 */
import { ENV, request } from "@xbuilder/bunadmin"
import { ListService } from "../types"
import { buildParams } from "./filter"
import { dxHeaders, itemsPath } from "./dxConfig"

export default async function listSer<RowData extends object>({
  tableQuery,
  path,
  prefix
}: ListService<RowData>) {
  const { search: searchWords, filters = [], orderBy, orderDirection, page, pageSize } = tableQuery

  const params = buildParams(filters as any, {
    searchWords,
    page,
    pageSize,
    orderBy,
    orderDirection
  })

  const res = await request(itemsPath(path), {
    params,
    prefix: prefix || ENV.MAIN_URL || ENV.AUTH_URL,
    method: "GET",
    headers: await dxHeaders()
  })

  return {
    data: (res && res.data) || [],
    totalCount: (res && res.meta && res.meta.filter_count) || (res && res.data ? res.data.length : 0),
    errors: res && res.errors ? res.errors : undefined
  }
}

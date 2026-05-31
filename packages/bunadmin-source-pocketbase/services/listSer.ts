/**
 * Remote data controller (PocketBase)
 * GET /api/collections/{name}/records?page=&perPage=&filter=&sort=
 *   -> { page, perPage, totalItems, totalPages, items[] }
 */
import { ENV, request, storedToken } from "@xbuilder/bunadmin"
import { ListService } from "../types"
import { buildFilter, buildSort } from "./filter"

export default async function listSer<RowData extends object>({
  tableQuery,
  path,
  prefix,
  searchField = "name"
}: ListService<RowData>) {
  const {
    search: searchWords,
    filters = [],
    orderBy,
    orderDirection,
    page,
    pageSize
  } = tableQuery

  const filter = buildFilter(filters as any, searchWords, searchField)
  const sort = buildSort(orderBy, orderDirection)

  const token = await storedToken()

  const data = await request(`/api/collections/${path}/records`, {
    params: {
      page: page + 1,
      perPage: pageSize,
      sort,
      ...(filter ? { filter } : {})
    },
    prefix: prefix || ENV.AUTH_URL,
    method: "GET",
    headers: token ? { Authorization: token } : {}
  })

  return {
    data: data.items || [],
    totalCount: data.totalItems || 0,
    errors: data.code && data.code >= 400 ? data : undefined
  }
}

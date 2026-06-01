/**
 * Remote data controller (Supabase / PostgREST)
 * GET /rest/v1/{table}?select=*&{col}={op}.{val}&order=&limit=&offset=
 *   -> RowData[]  (total via Content-Range header when Prefer: count=exact)
 */
import { ENV, request } from "@dashin-dev/dashin"
import { ListService } from "../types"
import { buildParams } from "./filter"
import { sbHeaders, tablePath } from "./sbConfig"

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

  const params = buildParams(filters as any, {
    searchWords,
    searchField,
    page,
    pageSize,
    orderBy,
    orderDirection
  })

  const headers = await sbHeaders({ Prefer: "count=exact" })

  const data = await request(tablePath(path), {
    params,
    prefix: prefix || ENV.MAIN_URL || ENV.AUTH_URL,
    method: "GET",
    headers
  })

  // PostgREST returns an array; total comes from the Content-Range header, which
  // dashin's request() may expose as data._contentRange or similar. Fall back
  // to array length when the header isn't surfaced.
  const rows = Array.isArray(data) ? data : data.data || []
  const total =
    (data && data._total) ||
    (Array.isArray(data) ? rows.length : data.totalCount) ||
    rows.length

  return {
    data: rows,
    totalCount: total,
    errors: data && data.code && data.code >= 400 ? data : undefined
  }
}

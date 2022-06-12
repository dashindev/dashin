/**
 * Remote data controller
 */
import { Query } from "material-table"
import { ENV, request, storedToken } from "@bunred/bunadmin"
import { SchemaName } from "../plugin"

export default async function listSer<RowData extends object>(
  query?: Query<RowData>
) {
  let page = 100,
    pageSize = 0
  if (query) {
    page = query.page
    pageSize = query.pageSize
  }
  const token = await storedToken()

  const data = await request(`/users-permissions/${SchemaName}`, {
    params: { _limit: pageSize, _sort: "username:ASC", _start: page },
    prefix: ENV.AUTH_URL,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  return {
    data: data.roles,
    totalCount: data.roles ? data.roles.length : 0,
    errors: data.error ? data.error : undefined
  }
}

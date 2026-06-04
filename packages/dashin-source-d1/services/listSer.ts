/**
 * Remote data controller (Cloudflare D1) — SELECT + COUNT via POST /query.
 */
import { ListService } from "../types"
import { buildSelect, buildCount } from "./sql"
import { execute } from "./client"

export default async function listSer<RowData extends object>({
  tableQuery,
  path,
  prefix,
  searchField = "name"
}: ListService<RowData>) {
  const countRes = await execute(buildCount(path, tableQuery, searchField), prefix)
  const listRes = await execute(buildSelect(path, tableQuery, searchField), prefix)

  const errors = listRes.error || countRes.error
  const total = countRes.rows[0] ? Number(countRes.rows[0].c) : listRes.rows.length

  return {
    data: listRes.rows || [],
    totalCount: errors ? 0 : total,
    errors
  }
}

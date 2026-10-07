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
  const countRes = await execute(buildCount(path, tableQuery, searchField), prefix, tableQuery.signal)
  if (countRes.error) throwQueryError(countRes.error)
  const listRes = await execute(buildSelect(path, tableQuery, searchField), prefix, tableQuery.signal)
  if (listRes.error) throwQueryError(listRes.error)

  const errors = listRes.error || countRes.error
  const total = countRes.rows[0] ? Number(countRes.rows[0].c) : listRes.rows.length

  return {
    data: listRes.rows || [],
    totalCount: errors ? 0 : total,
    errors
  }
}

/** D1 gateway errors are adapter-specific, not a core envelope heuristic. */
export function throwQueryError(error: any): never {
  if (error instanceof Error) throw error
  const detail = Array.isArray(error) ? error[0] : error
  throw Object.assign(new Error(typeof detail === "string" ? detail : detail?.message || "Request failed"), {
    data: { error }, cause: error
  })
}

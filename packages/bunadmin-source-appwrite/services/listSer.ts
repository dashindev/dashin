/**
 * Remote data controller (Appwrite)
 * GET /v1/databases/{databaseId}/collections/{collectionId}/documents?queries[]=
 *   -> { total, documents[] }
 */
import { ENV, request, storedToken } from "@xbuilder/bunadmin"
import { ListService } from "../types"
import { buildQueries } from "./filter"

// Appwrite needs a project id + database id (from VITE_* env, surfaced on ENV).
const PROJECT = ENV.APPWRITE_PROJECT
const DATABASE = ENV.APPWRITE_DATABASE || "default"

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

  const queries = buildQueries(filters as any, {
    searchWords,
    searchField,
    page,
    pageSize,
    orderBy,
    orderDirection
  })

  const token = await storedToken()

  const data = await request(
    `/v1/databases/${DATABASE}/collections/${path}/documents`,
    {
      params: { "queries[]": queries },
      prefix: prefix || ENV.AUTH_URL,
      method: "GET",
      headers: {
        ...(PROJECT ? { "X-Appwrite-Project": PROJECT } : {}),
        ...(token ? { "X-Appwrite-JWT": token } : {})
      }
    }
  )

  return {
    data: data.documents || [],
    totalCount: data.total || 0,
    errors: data.code && data.code >= 400 ? data : undefined
  }
}

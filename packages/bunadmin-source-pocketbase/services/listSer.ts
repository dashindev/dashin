/**
 * Remote data controller (PocketBase)
 * GET /api/collections/{name}/records?page=&perPage=&filter=&sort=
 *   -> { page, perPage, totalItems, totalPages, items[] }
 */
import { ENV, request, storedToken } from "@xbuilder/bunadmin"
import { ListService } from "../types"

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

  // Build the PocketBase `filter` expression, e.g. status='Published' && name~'a'
  const clauses: string[] = []
  filters.forEach(({ column: { field }, operator, value }) => {
    if (!field || value === undefined || value === "") return
    clauses.push(buildClause(String(field), operator as string, value))
  })
  if (searchWords) clauses.push(`${searchField}~'${escape(searchWords)}'`)
  const filter = clauses.join(" && ")

  // PocketBase sort: `field` (asc) / `-field` (desc)
  const sortField =
    (orderBy && orderBy.field && orderBy.field.toString()) || "created"
  const sort = orderBy
    ? `${orderDirection === "desc" ? "-" : ""}${sortField}`
    : "-created"

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

function escape(v: any): string {
  return String(v).replace(/'/g, "\\'")
}

/** Map a bunadmin column operator to a PocketBase filter clause. */
function buildClause(field: string, operator: string, value: any): string {
  const v = escape(value)
  switch (operator) {
    case "!=":
      return `${field}!='${v}'`
    case ">":
      return `${field}>${Number(value)}`
    case ">=":
      return `${field}>=${Number(value)}`
    case "<":
      return `${field}<${Number(value)}`
    case "<=":
      return `${field}<=${Number(value)}`
    case "_ncs=":
    case "_nc=":
      return `${field}!~'${v}'`
    case "=":
      return `${field}='${v}'`
    case "_cs=":
    case "_c=":
    default:
      return `${field}~'${v}'`
  }
}

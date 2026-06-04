/**
 * Pure helpers mapping dashin table filters to Directus query params.
 * Directus filters use `filter[field][_op]=value` (e.g. filter[status][_eq]=x),
 * sort=`-field` for desc, plus limit/offset/search. Testable core.
 */
import { Filter } from "@dashin-dev/dashin"

/** Map one dashin operator to a Directus filter operator key. */
export function directusOp(operator: string): string {
  switch (operator) {
    case "!=":
      return "_neq"
    case ">":
      return "_gt"
    case ">=":
      return "_gte"
    case "<":
      return "_lt"
    case "<=":
      return "_lte"
    case "_ncs=":
    case "_nc=":
      return "_ncontains"
    case "=":
      return "_eq"
    case "_cs=":
    case "_c=":
    default:
      return "_contains"
  }
}

/** Build Directus query params from table filters + search + sort + pagination. */
export function buildParams(
  filters: Filter<any>[],
  opts: {
    searchWords?: string
    page?: number
    pageSize?: number
    orderBy?: any
    orderDirection?: string
  } = {}
): Record<string, string | number> {
  const { searchWords, page = 0, pageSize = 20, orderBy, orderDirection } = opts
  const params: Record<string, string | number> = {}

  filters.forEach(({ column: { field }, operator, value }) => {
    if (!field || value === undefined || value === "") return
    params[`filter[${field}][${directusOp(operator as string)}]`] = value
  })

  if (searchWords) params.search = searchWords

  if (orderBy && orderBy.field) {
    params.sort = `${orderDirection === "desc" ? "-" : ""}${orderBy.field}`
  }

  params.limit = pageSize
  params.offset = page * pageSize
  params.meta = "filter_count" // so the response includes the total

  return params
}

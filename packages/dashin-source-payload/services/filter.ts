/**
 * Pure helpers mapping dashin table filters to Payload CMS query params.
 * Payload uses `where[field][operator]=value` (equals/contains/greater_than/...),
 * sort=`-field`, and page/limit (page is 1-based). Testable core.
 */
import { Filter } from "@dashin-dev/dashin"

/** Map one dashin operator to a Payload `where` operator key. */
export function payloadOp(operator: string): string {
  switch (operator) {
    case "!=":
      return "not_equals"
    case ">":
      return "greater_than"
    case ">=":
      return "greater_than_equal"
    case "<":
      return "less_than"
    case "<=":
      return "less_than_equal"
    case "_ncs=":
    case "_nc=":
      return "not_equals"
    case "=":
      return "equals"
    case "_cs=":
    case "_c=":
    default:
      return "contains"
  }
}

/** Build Payload query params from table filters + search + sort + pagination. */
export function buildParams(
  filters: Filter<any>[],
  opts: {
    searchWords?: string
    searchField?: string
    page?: number
    pageSize?: number
    orderBy?: any
    orderDirection?: string
  } = {}
): Record<string, string | number> {
  const { searchWords, searchField = "name", page = 0, pageSize = 20, orderBy, orderDirection } = opts
  const params: Record<string, string | number> = {}

  filters.forEach(({ column: { field }, operator, value }) => {
    if (!field || value === undefined || value === "") return
    params[`where[${field}][${payloadOp(operator as string)}]`] = value
  })

  if (searchWords) params[`where[${searchField}][contains]`] = searchWords

  if (orderBy && orderBy.field) {
    params.sort = `${orderDirection === "desc" ? "-" : ""}${orderBy.field}`
  }

  params.limit = pageSize
  params.page = page + 1 // Payload pages are 1-based

  return params
}

/**
 * Pure helpers mapping bunadmin table filters to Appwrite query strings.
 * Appwrite queries are JSON of the form
 *   {"method":"equal","attribute":"status","values":["Published"]}
 * passed as repeated `queries[]=` params. Kept separate from listSer so they're
 * unit-testable (the connector's testable core, mirroring source-pocketbase).
 */
import { Filter } from "@dashin-dev/dashin"

/** Build a single Appwrite query JSON string for a method/attribute/values. */
export function q(method: string, attribute: string, values: any[]): string {
  return JSON.stringify({ method, attribute, values })
}

/** Map one bunadmin column operator to an Appwrite query string. */
export function buildClause(
  field: string,
  operator: string,
  value: any
): string {
  switch (operator) {
    case "!=":
      return q("notEqual", field, [value])
    case ">":
      return q("greaterThan", field, [Number(value)])
    case ">=":
      return q("greaterThanEqual", field, [Number(value)])
    case "<":
      return q("lessThan", field, [Number(value)])
    case "<=":
      return q("lessThanEqual", field, [Number(value)])
    case "_ncs=":
    case "_nc=":
      // Appwrite has no "not contains"; closest is notEqual on the term.
      return q("notEqual", field, [value])
    case "=":
      return q("equal", field, Array.isArray(value) ? value : [value])
    case "_cs=":
    case "_c=":
    default:
      return q("search", field, [value])
  }
}

/**
 * Build the full Appwrite `queries` array from table filters + optional search +
 * pagination + sort. Returned as an array of JSON query strings.
 */
export function buildQueries(
  filters: Filter<any>[],
  opts: {
    searchWords?: string
    searchField?: string
    page?: number
    pageSize?: number
    orderBy?: any
    orderDirection?: string
  } = {}
): string[] {
  const { searchWords, searchField = "name", page = 0, pageSize = 20, orderBy, orderDirection } = opts
  const queries: string[] = []

  filters.forEach(({ column: { field }, operator, value }) => {
    if (!field || value === undefined || value === "") return
    queries.push(buildClause(String(field), operator as string, value))
  })

  if (searchWords) queries.push(q("search", searchField, [searchWords]))

  // sort
  if (orderBy && orderBy.field) {
    const method = orderDirection === "desc" ? "orderDesc" : "orderAsc"
    queries.push(q(method, String(orderBy.field), []))
  } else {
    queries.push(q("orderDesc", "$createdAt", []))
  }

  // pagination: Appwrite uses limit + offset
  queries.push(q("limit", "", [pageSize]))
  queries.push(q("offset", "", [page * pageSize]))

  return queries
}

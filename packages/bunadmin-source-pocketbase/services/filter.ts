/**
 * Pure helpers that map bunadmin table filters to a PocketBase `filter`
 * expression. Kept separate from listSer so they're unit-testable.
 */
import { Filter } from "@xbuilder/bunadmin"

export function escape(v: any): string {
  return String(v).replace(/'/g, "\\'")
}

/** Map a single bunadmin column operator to a PocketBase filter clause. */
export function buildClause(field: string, operator: string, value: any): string {
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

/**
 * Build the full PocketBase `filter` expression from table filters + an
 * optional search term, e.g. `status='Published' && name~'a'`.
 */
export function buildFilter(
  filters: Filter<any>[],
  searchWords?: string,
  searchField = "name"
): string {
  const clauses: string[] = []
  filters.forEach(({ column: { field }, operator, value }) => {
    if (!field || value === undefined || value === "") return
    clauses.push(buildClause(String(field), operator as string, value))
  })
  if (searchWords) clauses.push(`${searchField}~'${escape(searchWords)}'`)
  return clauses.join(" && ")
}

/** PocketBase sort param: `field` (asc) / `-field` (desc); default `-created`. */
export function buildSort(orderBy?: any, orderDirection?: string): string {
  const field = (orderBy && orderBy.field && orderBy.field.toString()) || "created"
  return orderBy ? `${orderDirection === "desc" ? "-" : ""}${field}` : "-created"
}

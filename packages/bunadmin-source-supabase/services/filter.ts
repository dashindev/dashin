/**
 * Pure helpers mapping bunadmin table filters to PostgREST (Supabase) query
 * params. PostgREST filters take the form `column=operator.value`
 * (e.g. status=eq.Published, name=ilike.*foo*). Kept separate from listSer so
 * they're unit-testable (the connector's core, mirroring the other sources).
 */
import { Filter } from "@dashin-dev/dashin"

/** Map one bunadmin column operator to a PostgREST `operator.value` string. */
export function buildClause(operator: string, value: any): string {
  switch (operator) {
    case "!=":
      return `neq.${value}`
    case ">":
      return `gt.${value}`
    case ">=":
      return `gte.${value}`
    case "<":
      return `lt.${value}`
    case "<=":
      return `lte.${value}`
    case "_ncs=":
    case "_nc=":
      // PostgREST "not": not.ilike.*value*
      return `not.ilike.*${value}*`
    case "=":
      return `eq.${value}`
    case "_cs=":
    case "_c=":
    default:
      // case-insensitive contains
      return `ilike.*${value}*`
  }
}

export interface SupabaseQuery {
  /** PostgREST query params: { column: "op.value", order, limit, offset, ... } */
  params: Record<string, string | number>
}

/**
 * Build PostgREST query params from table filters + search + sort + pagination.
 */
export function buildParams(
  filters: Filter<any>[],
  opts: {
    searchWords?: string
    searchField?: string
    page?: number
    pageSize?: number
    orderBy?: any
    orderDirection?: string
    select?: string
  } = {}
): Record<string, string | number> {
  const {
    searchWords,
    searchField = "name",
    page = 0,
    pageSize = 20,
    orderBy,
    orderDirection,
    select = "*"
  } = opts
  const params: Record<string, string | number> = { select }

  filters.forEach(({ column: { field }, operator, value }) => {
    if (!field || value === undefined || value === "") return
    params[String(field)] = buildClause(operator as string, value)
  })

  if (searchWords) params[searchField] = `ilike.*${searchWords}*`

  // sort
  if (orderBy && orderBy.field) {
    params.order = `${orderBy.field}.${orderDirection === "desc" ? "desc" : "asc"}`
  }

  // pagination (PostgREST limit/offset)
  params.limit = pageSize
  params.offset = page * pageSize

  return params
}

import { Filter, Query } from "@dashin-dev/dashin"

/** Map one Dashin table filter operator to an Atomo where operator. */
export function atomoOp(operator: string): string {
  switch (operator) {
    case "!=":
    case "_ncs=":
    case "_nc=":
      return "not"
    case ">":
      return "gt"
    case ">=":
      return "gte"
    case "<":
      return "lt"
    case "<=":
      return "lte"
    case "=":
      return "equals"
    case "in":
      return "in"
    case "startsWith":
      return "startsWith"
    case "endsWith":
      return "endsWith"
    case "_cs=":
    case "_c=":
    case "contains":
    default:
      return "contains"
  }
}

export function buildAtomoWhere(
  filters: Filter<any>[] = [],
  searchWords?: string,
  searchField = "name"
): Record<string, any> {
  const where: Record<string, any> = {}

  for (const f of filters) {
    const field = f.column?.field as string
    const val = f.value
    if (!field || val === undefined || val === "") continue
    const op = atomoOp(f.operator as string)
    where[field] = { ...(where[field] || {}), [op]: val }
  }

  if (searchWords && searchWords.trim()) {
    where[searchField] = {
      ...(where[searchField] || {}),
      contains: searchWords.trim(),
    }
  }

  return where
}

export function buildAtomoOrderBy(
  orderBy?: any,
  orderDirection?: string
): Record<string, string> | undefined {
  if (!orderBy) return undefined
  const field = typeof orderBy === "string" ? orderBy : orderBy.field
  if (!field) return undefined
  const direction = (orderDirection || "asc").toUpperCase()
  return { [field]: direction }
}

export function buildAtomoQueryParams<RowData extends object>(
  query: Query<RowData>,
  searchField = "name"
): {
  page: number
  limit: number
  where: Record<string, any>
  orderBy?: Record<string, string>
} {
  const page = (query.page ?? 0) + 1 // Dashin table query is 0-based; Atomo is 1-based
  const limit = query.pageSize || 20
  const where = buildAtomoWhere(query.filters, query.search, searchField)
  const orderBy = buildAtomoOrderBy(query.orderBy, query.orderDirection)

  return {
    page,
    limit,
    where,
    orderBy,
  }
}

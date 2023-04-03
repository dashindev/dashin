/**
 * Remote data controller
 */
import { ENV, request, storedToken } from "@xbuilder/bunadmin"
import { ListService } from "../types"

export default async function listSer<RowData extends object>({
  tableQuery,
  path,
  prefix,
  searchField = "name",
  searchSuffix = "$contains"
}: ListService<RowData>) {
  const {
    search: searchWords,
    filters = [],
    orderBy,
    orderDirection,
    page,
    pageSize
  } = tableQuery

  let filtersStr = ""

  filters.map(({ column: { field }, operator, value }) => {
    if (!field) return

    operator = handleOperator(operator as any) as "="

    filtersStr += `&filters[${field as string}][${operator}]=${value}`
  })
  filtersStr = filtersStr.replace("attributes.", "")

  if (searchWords) {
    filtersStr =
      filtersStr + `&filters[${searchField}][${searchSuffix}]=${searchWords}`
  }
  if (filtersStr) {
    filtersStr += "&"
  }

  let orderByField =
    (orderBy && orderBy.field && orderBy.field.toString()) || "created_at"
  orderByField = orderByField.replace("attributes.", "")

  const params = {
    "pagination[page]": page + 1,
    "pagination[pageSize]": pageSize,
    "sort[0]": orderBy ? `${orderByField}:${orderDirection}` : undefined
  }

  const token = await storedToken()

  const data = await request(`/${path}${filtersStr}`, {
    params,
    prefix: prefix || ENV.AUTH_URL,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  // Adapt to total users by 'data.length'
  const { total = data.length } = data.meta?.pagination || {}

  return {
    data: data.data || data,
    totalCount: total,
    errors: data.error ? data.error : undefined
  }
}

function handleOperator(operator: string): string {
  let suffix
  switch (operator) {
    case "=":
      suffix = "$eq"
      break
    case "!=":
      suffix = "$ne"
      break
    case "<":
      suffix = "$lt"
      break
    case ">":
      suffix = "$gt"
      break
    case "<=":
      suffix = "$lte"
      break
    case ">=":
      suffix = "$gte"
      break
    case "_in=":
      suffix = "$in"
      break
    case "_nin=":
      suffix = "$nin"
      break
    case "_c=":
      suffix = "$contains"
      break
    case "_nc=":
      suffix = "$notContains"
      break
    case "_cs=":
      suffix = "$containsi"
      break
    case "_ncs=":
      suffix = "$notContainsi"
      break
    case "_null=":
      suffix = "$null"
      break
    default:
      suffix = "$contains"
  }
  return suffix
}

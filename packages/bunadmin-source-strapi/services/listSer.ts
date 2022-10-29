/**
 * Remote data controller
 */
import {
  ENV,
  request,
  storedToken,
  store,
  TableState
} from "@xbuilder/bunadmin"
import { ListService } from "../types"

const operatorRex = new RegExp(/=|<=|>=|<|>|_.*=/)

export default async function listSer<RowData extends object>({
  tableQuery,
  path,
  prefix,
  skipCount,
  fixCount,
  searchField = "name",
  searchSuffix = "_contains"
}: ListService<RowData>) {
  const {
    search: searchWords,
    filters = [],
    orderBy,
    orderDirection,
    page,
    pageSize
  } = tableQuery

  let filtersObj: any = {}
  filters.map(({ column, value: filterValue }) => {
    let suffix = "_contains" // default: contains

    if (!column.field) return
    const field = column.field.toString()

    const state = store.getState()
    const table: TableState = state.table
    let filterField = field

    const extraFilter = table.filters?.find(
      item => item.column?.field === field
    )

    if (extraFilter && extraFilter.filterField) {
      filterField = extraFilter.filterField
    }

    if (extraFilter && typeof extraFilter.filterOperator === "string") {
      suffix = extraFilter.filterOperator
    }

    if (typeof filterValue === "object") {
      suffix = "" // eq
      const filterKey = filterField + suffix
      return (filtersObj[filterKey] = filterValue)
    }

    const isOperator = filterValue.replace(operatorRex, "") === ""
    if (isOperator) return

    if (suffix !== "") suffix = handleValueSuffix(filterValue)

    // handling numeric column
    if (column.type === "numeric") suffix = "" // eq

    // handling boolean column
    if (column.type === "boolean") {
      suffix = "" // eq
      if (filterValue === "checked") filterValue = "true"
      if (filterValue === "unchecked") filterValue = "false"
    }

    const filterKey = filterField + suffix

    filtersObj[filterKey] = filterValue.replace(operatorRex, "")
  })

  const searchKey = searchField + searchSuffix

  const orderByField =
    (orderBy && orderBy.field && orderBy.field.toString()) || "created_at"

  const params = {
    [searchKey]: searchWords || "",
    _limit: pageSize,
    _sort: orderBy ? `${orderByField}:${orderDirection}` : undefined,
    _start: page * pageSize,
    ...filtersObj
  }

  const token = await storedToken()

  const data = await request(`/${path}`, {
    params,
    prefix: prefix || ENV.AUTH_URL,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  let count = data.length || 0
  if (!skipCount)
    count = await request(`/${path}/count`, {
      params,
      prefix: prefix || ENV.AUTH_URL,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

  return {
    data,
    totalCount: fixCount ? count.count : count,
    errors: data.error ? data.error : undefined
  }
}

function handleOperator(operator: string): string {
  let suffix
  switch (operator) {
    case "=":
      suffix = "eq"
      break
    case "!=":
      suffix = "ne"
      break
    case "<":
      suffix = "lt"
      break
    case ">":
      suffix = "gt"
      break
    case "<=":
      suffix = "lte"
      break
    case ">=":
      suffix = "gte"
      break
    case "_in=":
      suffix = "in"
      break
    case "_nin=":
      suffix = "nin"
      break
    case "_c=":
      suffix = "contains"
      break
    case "_nc=":
      suffix = "ncontains"
      break
    case "_cs=":
      suffix = "containss"
      break
    case "_ncs=":
      suffix = "ncontainss"
      break
    case "_null=":
      suffix = "null"
      break
    default:
      suffix = "contains"
  }
  return suffix
}

/**
 * Type `suffix` to filter, example: >0, >=0, <100, _null=true
 */
function handleValueSuffix(filterValue: string): string {
  let suffix = "contains" // default filter use 'contains

  // bunadmin columns' filterValue e.g.: `gt::blocked`
  const hasOperator = operatorRex.test(filterValue)

  if (hasOperator) {
    const operatorMath = filterValue.match(operatorRex)
    const operator = operatorMath ? operatorMath[0] : "_c"
    suffix = handleOperator(operator)
  }

  return `_${suffix}`
}

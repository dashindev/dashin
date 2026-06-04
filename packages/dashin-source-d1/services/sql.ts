/**
 * Pure SQL builders for Cloudflare D1. VALUES are always bound parameters (`?`)
 * — never string-interpolated — so this is injection-safe. Identifiers
 * (table/column names) can't be parameters, so they're validated against a
 * strict pattern and quoted. Testable core of the connector.
 */
import { Filter } from "@dashin-dev/dashin"

/** A SQL statement with bound args, in D1 stmt shape. */
export interface Stmt {
  sql: string
  args: any[]
}

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/

/** Validate + quote a SQL identifier (table/column). Throws on anything unsafe. */
export function ident(name: string): string {
  if (!IDENT.test(name)) throw new Error(`unsafe SQL identifier: ${JSON.stringify(name)}`)
  return `"${name}"`
}

/** Map a dashin operator to a SQL operator + value transform (for LIKE). */
function sqlOp(operator: string, value: any): { op: string; val: any } {
  switch (operator) {
    case "!=":
      return { op: "!=", val: value }
    case ">":
      return { op: ">", val: value }
    case ">=":
      return { op: ">=", val: value }
    case "<":
      return { op: "<", val: value }
    case "<=":
      return { op: "<=", val: value }
    case "_ncs=":
    case "_nc=":
      return { op: "NOT LIKE", val: `%${value}%` }
    case "=":
      return { op: "=", val: value }
    case "_cs=":
    case "_c=":
    default:
      return { op: "LIKE", val: `%${value}%` }
  }
}

/** Build the WHERE clause (+ args) from table filters + optional search. */
export function buildWhere(
  filters: Filter<any>[],
  searchWords?: string,
  searchField = "name"
): { clause: string; args: any[] } {
  const parts: string[] = []
  const args: any[] = []
  filters.forEach(({ column: { field }, operator, value }) => {
    if (!field || value === undefined || value === "") return
    const { op, val } = sqlOp(operator as string, value)
    parts.push(`${ident(String(field))} ${op} ?`)
    args.push(val)
  })
  if (searchWords) {
    parts.push(`${ident(searchField)} LIKE ?`)
    args.push(`%${searchWords}%`)
  }
  return { clause: parts.length ? ` WHERE ${parts.join(" AND ")}` : "", args }
}

/** SELECT with filters, sort, pagination. */
export function buildSelect(
  table: string,
  tableQuery: any,
  searchField = "name"
): Stmt {
  const { search, filters = [], orderBy, orderDirection, page = 0, pageSize = 20 } = tableQuery
  const { clause, args } = buildWhere(filters, search, searchField)
  let sql = `SELECT * FROM ${ident(table)}${clause}`
  if (orderBy && orderBy.field) {
    sql += ` ORDER BY ${ident(String(orderBy.field))} ${orderDirection === "desc" ? "DESC" : "ASC"}`
  }
  sql += ` LIMIT ? OFFSET ?`
  return { sql, args: [...args, pageSize, page * pageSize] }
}

/** COUNT(*) with the same filters (for totalCount). */
export function buildCount(table: string, tableQuery: any, searchField = "name"): Stmt {
  const { search, filters = [] } = tableQuery
  const { clause, args } = buildWhere(filters, search, searchField)
  return { sql: `SELECT COUNT(*) AS c FROM ${ident(table)}${clause}`, args }
}

/** INSERT from a row object. */
export function buildInsert(table: string, data: Record<string, any>): Stmt {
  const keys = Object.keys(data)
  const cols = keys.map(ident).join(", ")
  const ph = keys.map(() => "?").join(", ")
  return { sql: `INSERT INTO ${ident(table)} (${cols}) VALUES (${ph})`, args: keys.map(k => data[k]) }
}

/** UPDATE by primary key. */
export function buildUpdate(
  table: string,
  data: Record<string, any>,
  pk: string,
  pkValue: any
): Stmt {
  const keys = Object.keys(data).filter(k => k !== pk)
  const set = keys.map(k => `${ident(k)} = ?`).join(", ")
  return {
    sql: `UPDATE ${ident(table)} SET ${set} WHERE ${ident(pk)} = ?`,
    args: [...keys.map(k => data[k]), pkValue]
  }
}

/** DELETE by primary key. */
export function buildDelete(table: string, pk: string, pkValue: any): Stmt {
  return { sql: `DELETE FROM ${ident(table)} WHERE ${ident(pk)} = ?`, args: [pkValue] }
}

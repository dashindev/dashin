/**
 * Cloudflare D1 HTTP client. Executes a statement via `POST /query` against the
 * D1 gateway Worker (see workers/d1-demo-api) and returns its decoded rows.
 *
 * Wire format (kept deliberately simple — the Worker runs the SQL on D1):
 *   request:  { sql: string, args: any[] }
 *   response: { rows: object[], rowsAffected: number }  // success
 *             { error: any }                            // query/guard error
 */
import { ENV, request, storedToken } from "@dashin-dev/dashin"
import { Stmt } from "./sql"

/** Coerce a JS value into something D1's bind() accepts (string/number/null). */
function arg(v: any): any {
  if (v === undefined) return null
  if (typeof v === "boolean") return v ? 1 : 0
  return v
}

/** Execute one SQL statement against the D1 gateway Worker. */
export async function execute(
  stmt: Stmt,
  prefix?: string
): Promise<{ rows: any[]; affectedRows: number; error?: any }> {
  const token = await storedToken()
  const res = await request(`/query`, {
    prefix: prefix || ENV.MAIN_URL || ENV.AUTH_URL,
    method: "POST",
    headers: token
      ? { Authorization: `Bearer ${String(token).replace(/^Bearer /, "")}` }
      : {},
    data: { sql: stmt.sql, args: stmt.args.map(arg) }
  })

  if (!res || res.error) {
    return { rows: [], affectedRows: 0, error: (res && res.error) || res }
  }
  return { rows: res.rows || [], affectedRows: res.rowsAffected || 0 }
}

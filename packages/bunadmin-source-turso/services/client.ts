/**
 * libSQL/Turso HTTP client. Executes a statement via POST /v2/pipeline and
 * decodes the {cols, rows} response into row objects.
 * https://docs.turso.tech/sdk/http/reference
 */
import { ENV, request, storedToken } from "@xbuilder/bunadmin"
import { Stmt } from "./sql"

/** Encode a JS value into a libSQL arg ({ type, value }). */
function encodeArg(v: any): { type: string; value: string } {
  if (v === null || v === undefined) return { type: "null", value: "" } as any
  if (typeof v === "number")
    return Number.isInteger(v)
      ? { type: "integer", value: String(v) }
      : { type: "float", value: String(v) }
  if (typeof v === "boolean") return { type: "integer", value: v ? "1" : "0" }
  return { type: "text", value: String(v) }
}

/** Decode a libSQL result into { rows: object[], affectedRows }. */
function decode(result: any): { rows: any[]; affectedRows: number } {
  if (!result) return { rows: [], affectedRows: 0 }
  const cols = (result.cols || []).map((c: any) => c.name)
  const rows = (result.rows || []).map((row: any[]) => {
    const o: Record<string, any> = {}
    row.forEach((cell: any, i: number) => {
      // cells are { type, value } | scalar depending on protocol version
      o[cols[i]] = cell && typeof cell === "object" && "value" in cell ? cell.value : cell
    })
    return o
  })
  return { rows, affectedRows: result.affected_row_count || 0 }
}

/** Execute one SQL statement against the libSQL HTTP endpoint. */
export async function execute(
  stmt: Stmt,
  prefix?: string
): Promise<{ rows: any[]; affectedRows: number; error?: any }> {
  const token = await storedToken()
  const res = await request(`/v2/pipeline`, {
    prefix: prefix || ENV.MAIN_URL || ENV.AUTH_URL,
    method: "POST",
    headers: token ? { Authorization: `Bearer ${String(token).replace(/^Bearer /, "")}` } : {},
    data: {
      requests: [
        { type: "execute", stmt: { sql: stmt.sql, args: stmt.args.map(encodeArg) } },
        { type: "close" }
      ]
    }
  })

  const first = res && res.results && res.results[0]
  if (!first || first.type === "error" || (res && res.error)) {
    return { rows: [], affectedRows: 0, error: (first && first.error) || res }
  }
  return decode(first.response && first.response.result)
}

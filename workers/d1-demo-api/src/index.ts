/**
 * Dashin D1 demo gateway Worker.
 *
 * Exposes a tiny HTTP API over a Cloudflare D1 database so the browser-side
 * `@dashin-dev/source-d1` connector can run its (injection-safe, parameterised)
 * SQL:
 *   POST /query  { sql, args }  -> { rows, rowsAffected } | { error }
 *   POST /reset                 -> re-seed (also runs on a cron) [token-gated]
 *
 * Public-demo safety:
 *  - A SQL guard allows only SELECT/INSERT/UPDATE/DELETE on the demo tables,
 *    rejects DDL, multi-statements and comments.
 *  - A `scheduled` cron re-seeds the data every 30 min (see wrangler.jsonc), so
 *    anything a visitor changes reverts. There are no server-side credentials
 *    (the demo logs in via the client-side auth-local plugin).
 */

export interface Env {
  DB: D1Database
  /** Optional bearer token gating POST /reset (set via `wrangler secret put`). */
  RESET_TOKEN?: string
}

const ALLOWED_TABLES = ["posts", "products"]

/** The seed = single source of truth for demo data. Run on reset + cron. */
const SEED: string[] = [
  `DELETE FROM posts`,
  `DELETE FROM products`,
  `INSERT INTO posts (title, status, views) VALUES
     ('Welcome to the Dashin × Cloudflare D1 demo', 'published', 1280),
     ('Edit me — everything resets every 30 minutes', 'published', 342),
     ('Draft: this admin runs 100% free on Cloudflare', 'draft', 12)`,
  `INSERT INTO products (name, price, in_stock) VALUES
     ('Starter', 0, 1),
     ('Pro', 19, 1),
     ('Enterprise', 99, 0)`
]

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS }
  })

/** Returns an error string if the statement is not allowed, else null. */
export function guard(sql: string): string | null {
  const s = sql.trim()
  if (!s) return "empty statement"
  if (s.includes("--") || s.includes("/*")) return "comments not allowed"
  // No inner semicolons (one statement only); a single trailing `;` is fine.
  if (s.replace(/;\s*$/, "").includes(";")) return "multiple statements not allowed"
  const verb = (s.match(/^([A-Za-z]+)/)?.[1] || "").toUpperCase()
  if (!["SELECT", "INSERT", "UPDATE", "DELETE"].includes(verb))
    return `statement not allowed: ${verb || "?"}`
  // The connector always quotes the table identifier right after the verb/FROM.
  const m = s.match(
    /^(?:SELECT[\s\S]*?\bFROM|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+"([A-Za-z_][A-Za-z0-9_]*)"/i
  )
  if (!m) return "could not identify target table"
  if (!ALLOWED_TABLES.includes(m[1])) return `table not allowed: ${m[1]}`
  return null
}

async function reseed(env: Env): Promise<void> {
  await env.DB.batch(SEED.map(sql => env.DB.prepare(sql)))
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS })
    const url = new URL(req.url)

    if (url.pathname === "/query" && req.method === "POST") {
      let body: { sql?: string; args?: unknown[] }
      try {
        body = await req.json()
      } catch {
        return json({ error: "invalid JSON body" })
      }
      const sql = String(body.sql || "")
      const args = Array.isArray(body.args) ? body.args : []
      const bad = guard(sql)
      if (bad) return json({ error: bad })
      try {
        const { results, meta } = await env.DB.prepare(sql)
          .bind(...args)
          .all()
        return json({ rows: results ?? [], rowsAffected: meta?.changes ?? 0 })
      } catch (e: any) {
        return json({ error: String(e?.message || e) })
      }
    }

    if (url.pathname === "/reset" && req.method === "POST") {
      const auth = req.headers.get("Authorization") || ""
      if (env.RESET_TOKEN && auth !== `Bearer ${env.RESET_TOKEN}`)
        return json({ error: "unauthorized" }, 401)
      await reseed(env)
      return json({ ok: true, reset: true })
    }

    if (url.pathname === "/" || url.pathname === "/health")
      return json({ ok: true, service: "dashin-d1-demo-api" })

    return json({ error: "not found" }, 404)
  },

  // The "reset every 30 minutes" — schedule is in wrangler.jsonc (triggers.crons).
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    await reseed(env)
  }
}

/**
 * Dashin D1 demo gateway Worker.
 *
 * Exposes a tiny HTTP API over a Cloudflare D1 database so the browser-side
 * `@dashin-dev/source-d1` connector can run its (injection-safe, parameterised)
 * SQL:
 *   POST /query  { sql, args }  -> { rows, rowsAffected } | { error }
 *   POST /reset                 -> re-seed (also runs on a cron) [token-gated]
 *
 * This is a PUBLIC demo, so it's defended against abuse / runaway cost:
 *  - Per-IP rate limit (RATE_LIMITER binding) — caps request floods.
 *  - SQL guard: only SELECT/INSERT/UPDATE/DELETE on the demo tables; no DDL,
 *    multi-statements or comments; bounded statement length; SELECT must carry
 *    a small LIMIT (no full-table scans).
 *  - Write cap: INSERT is refused once a table reaches MAX_ROWS, so storage /
 *    the D1 write budget can't be inflated.
 *  - `scheduled` cron re-seeds every 30 min, so any change reverts.
 *  - `/reset` over HTTP requires RESET_TOKEN; CORS is limited to the demo origin.
 *  - No server credentials (demo auth is client-side auth-local).
 */

export interface Env {
  DB: D1Database
  /** Bearer token gating POST /reset (set via `wrangler secret put RESET_TOKEN`). */
  RESET_TOKEN?: string
  /** Per-IP rate limiter binding (see wrangler.jsonc). */
  RATE_LIMITER: { limit(opts: { key: string }): Promise<{ success: boolean }> }
}

const ALLOWED_TABLES = ["posts", "products"]
const MAX_SQL_LEN = 2000
const SELECT_MAX_LIMIT = 200
const MAX_ROWS_PER_TABLE = 500

// The demo frontend (Worker "dashin-demo") on any account subdomain, the custom
// domain, or local dev. Pattern-based so switching CF accounts needs no edits.
const ORIGIN_RE =
  /^https:\/\/dashin-demo\.[a-z0-9-]+\.workers\.dev$|^https:\/\/demo\.dashin\.dev$|^http:\/\/(localhost|127\.0\.0\.1):3000$/

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

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || ""
  const allow = ORIGIN_RE.test(origin) ? origin : "https://demo.dashin.dev"
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin"
  }
}

const json = (body: unknown, req: Request, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(req) }
  })

/** Identify the target table of a connector-generated statement (quoted ident). */
function targetTable(sql: string): string | null {
  const m = sql.match(
    /^(?:SELECT[\s\S]*?\bFROM|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+"([A-Za-z_][A-Za-z0-9_]*)"/i
  )
  return m ? m[1] : null
}

/** Returns an error string if the statement is not allowed, else null. */
export function guard(sql: string): string | null {
  const s = sql.trim()
  if (!s) return "empty statement"
  if (s.length > MAX_SQL_LEN) return "statement too long"
  if (s.includes("--") || s.includes("/*")) return "comments not allowed"
  if (s.replace(/;\s*$/, "").includes(";")) return "multiple statements not allowed"
  const verb = (s.match(/^([A-Za-z]+)/)?.[1] || "").toUpperCase()
  if (!["SELECT", "INSERT", "UPDATE", "DELETE"].includes(verb))
    return `statement not allowed: ${verb || "?"}`
  const table = targetTable(s)
  if (!table) return "could not identify target table"
  if (!ALLOWED_TABLES.includes(table)) return `table not allowed: ${table}`
  if (verb === "SELECT") {
    // Aggregates (the connector's COUNT(*) for totalCount) return one row, so
    // they don't need a LIMIT. Row-returning SELECTs must be bounded.
    const isAggregate = /^SELECT\s+COUNT\s*\(/i.test(s)
    if (!isAggregate) {
      const lim = s.match(/\bLIMIT\s+(\d+)/i)
      if (!lim) return "SELECT must include a LIMIT"
      if (Number(lim[1]) > SELECT_MAX_LIMIT) return `LIMIT too large (max ${SELECT_MAX_LIMIT})`
    }
  }
  return null
}

async function reseed(env: Env): Promise<void> {
  await env.DB.batch(SEED.map(sql => env.DB.prepare(sql)))
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders(req) })
    const url = new URL(req.url)

    if (url.pathname === "/" || url.pathname === "/health")
      return json({ ok: true, service: "dashin-d1-demo-api" }, req)

    // Per-IP rate limit on the mutating/expensive routes.
    // (Optional-chained so local `wrangler dev` without the binding still runs.)
    if (req.method === "POST" && env.RATE_LIMITER?.limit) {
      const ip = req.headers.get("CF-Connecting-IP") || "anon"
      const { success } = await env.RATE_LIMITER.limit({ key: ip })
      if (!success) return json({ error: "rate limited — slow down" }, req, 429)
    }

    if (url.pathname === "/query" && req.method === "POST") {
      let body: { sql?: string; args?: unknown[] }
      try {
        body = await req.json()
      } catch {
        return json({ error: "invalid JSON body" }, req)
      }
      const sql = String(body.sql || "")
      const args = Array.isArray(body.args) ? body.args.slice(0, 64) : []
      const bad = guard(sql)
      if (bad) return json({ error: bad }, req)

      // Write cap: don't let anyone inflate storage / the D1 write budget.
      if (/^INSERT/i.test(sql.trim())) {
        const table = targetTable(sql)!
        const { results } = await env.DB.prepare(
          `SELECT COUNT(*) AS c FROM "${table}"`
        ).all<{ c: number }>()
        if ((results?.[0]?.c ?? 0) >= MAX_ROWS_PER_TABLE)
          return json({ error: "demo table is full — it resets every 30 minutes" }, req)
      }

      try {
        const { results, meta } = await env.DB.prepare(sql)
          .bind(...args)
          .all()
        return json({ rows: results ?? [], rowsAffected: meta?.changes ?? 0 }, req)
      } catch (e: any) {
        return json({ error: String(e?.message || e) }, req)
      }
    }

    if (url.pathname === "/reset" && req.method === "POST") {
      const auth = req.headers.get("Authorization") || ""
      if (!env.RESET_TOKEN || auth !== `Bearer ${env.RESET_TOKEN}`)
        return json({ error: "unauthorized" }, req, 401)
      await reseed(env)
      return json({ ok: true, reset: true }, req)
    }

    return json({ error: "not found" }, req, 404)
  },

  // The "reset every 30 minutes" — schedule is in wrangler.jsonc (triggers.crons).
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    await reseed(env)
  }
}

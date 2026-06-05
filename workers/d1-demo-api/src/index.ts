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

const ALLOWED_TABLES = ["categories", "products", "customers", "orders"]
const MAX_SQL_LEN = 2000
const SELECT_MAX_LIMIT = 200
const MAX_ROWS_PER_TABLE = 500

// The demo frontend (Worker "dashin-demo") on any account subdomain, the custom
// domain, or local dev. Pattern-based so switching CF accounts needs no edits.
const ORIGIN_RE =
  /^https:\/\/dashin-demo\.[a-z0-9-]+\.workers\.dev$|^https:\/\/demo\.dashin\.dev$|^http:\/\/(localhost|127\.0\.0\.1):3000$/

/**
 * The seed = single source of truth for demo data (an e-commerce store).
 * Run on reset + the 30-min cron. `created_at` uses relative dates so the data
 * is always "recent" → real, always-fresh trend charts on the dashboard.
 */
const SEED: string[] = [
  `DELETE FROM orders`,
  `DELETE FROM products`,
  `DELETE FROM customers`,
  `DELETE FROM categories`,

  `INSERT INTO categories (id, name, slug) VALUES
     (1,'Electronics','electronics'),
     (2,'Apparel','apparel'),
     (3,'Home & Kitchen','home-kitchen'),
     (4,'Books','books'),
     (5,'Toys & Games','toys-games'),
     (6,'Sports & Outdoors','sports'),
     (7,'Beauty','beauty'),
     (8,'Grocery','grocery')`,

  `INSERT INTO products (name, price, stock, status, category_id) VALUES
     ('Wireless Earbuds Pro', 129.00, 84, 'active', 1),
     ('4K Ultra Monitor 27"', 349.00, 23, 'active', 1),
     ('Mechanical Keyboard', 89.00, 0, 'active', 1),
     ('USB-C 7-in-1 Hub', 39.00, 140, 'active', 1),
     ('Smart Watch Series 6', 199.00, 31, 'active', 1),
     ('Bluetooth Speaker Mini', 45.00, 60, 'draft', 1),
     ('Noise-Cancelling Headphones', 159.00, 18, 'active', 1),
     ('Cotton Crew T-Shirt', 19.00, 220, 'active', 2),
     ('Denim Jacket', 79.00, 44, 'active', 2),
     ('Running Shoes', 110.00, 0, 'active', 2),
     ('Merino Wool Beanie', 24.00, 95, 'active', 2),
     ('Rain Shell', 129.00, 12, 'archived', 2),
     ('Ceramic Mug Set (4)', 32.00, 73, 'active', 3),
     ('Chef Knife 8"', 64.00, 27, 'active', 3),
     ('Air Fryer 5L', 119.00, 15, 'active', 3),
     ('Throw Blanket', 38.00, 51, 'active', 3),
     ('The Pragmatic Programmer', 42.00, 130, 'active', 4),
     ('Clean Code', 38.00, 88, 'active', 4),
     ('Designing Data-Intensive Apps', 55.00, 40, 'active', 4),
     ('Building Blocks Set (500)', 49.00, 64, 'active', 5),
     ('Strategy Board Game', 35.00, 22, 'active', 5),
     ('RC Drift Car', 89.00, 9, 'draft', 5),
     ('Yoga Mat Pro', 45.00, 110, 'active', 6),
     ('Adjustable Dumbbell Pair', 199.00, 6, 'active', 6),
     ('Insulated Water Bottle', 28.00, 175, 'active', 6),
     ('Vitamin C Serum', 26.00, 90, 'active', 7),
     ('Lip Balm Trio', 14.00, 0, 'active', 7),
     ('Single-Origin Coffee 1kg', 22.00, 200, 'active', 8),
     ('Dark Chocolate 70% (6)', 18.00, 130, 'active', 8),
     ('Organic Wildflower Honey', 16.00, 58, 'active', 8)`,

  `INSERT INTO customers (name, email, country, created_at) VALUES
     ('Ava Thompson','ava.thompson@example.com','US', date('now','-58 days')),
     ('Liam Chen','liam.chen@example.com','CA', date('now','-55 days')),
     ('Sofia Rossi','sofia.rossi@example.com','IT', date('now','-51 days')),
     ('Noah Müller','noah.muller@example.com','DE', date('now','-49 days')),
     ('Emma Dubois','emma.dubois@example.com','FR', date('now','-44 days')),
     ('Oliver Smith','oliver.smith@example.com','UK', date('now','-41 days')),
     ('Mia Garcia','mia.garcia@example.com','ES', date('now','-39 days')),
     ('Lucas Silva','lucas.silva@example.com','BR', date('now','-35 days')),
     ('Hana Sato','hana.sato@example.com','JP', date('now','-33 days')),
     ('Arjun Patel','arjun.patel@example.com','IN', date('now','-30 days')),
     ('Charlotte Brown','charlotte.brown@example.com','AU', date('now','-28 days')),
     ('Ethan Wilson','ethan.wilson@example.com','US', date('now','-25 days')),
     ('Isabella Moore','isabella.moore@example.com','US', date('now','-23 days')),
     ('Mateo Lopez','mateo.lopez@example.com','MX', date('now','-21 days')),
     ('Amelia Taylor','amelia.taylor@example.com','UK', date('now','-19 days')),
     ('James Anderson','james.anderson@example.com','CA', date('now','-16 days')),
     ('Yuki Tanaka','yuki.tanaka@example.com','JP', date('now','-14 days')),
     ('Lena Schmidt','lena.schmidt@example.com','DE', date('now','-12 days')),
     ('Hugo Martin','hugo.martin@example.com','FR', date('now','-9 days')),
     ('Grace Kim','grace.kim@example.com','KR', date('now','-7 days')),
     ('Daniel Nguyen','daniel.nguyen@example.com','US', date('now','-5 days')),
     ('Freya Olsen','freya.olsen@example.com','NO', date('now','-3 days')),
     ('Marco Bianchi','marco.bianchi@example.com','IT', date('now','-2 days')),
     ('Zoe Clark','zoe.clark@example.com','AU', date('now','-1 days'))`,

  // 56 orders, generated over the last 30 days; status weighted toward paid/shipped.
  `INSERT INTO orders (customer_id, total, status, created_at)
   WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 56)
   SELECT
     (abs(random()) % 24) + 1,
     round((abs(random()) % 48000) / 100.0 + 12.99, 2),
     (CASE abs(random()) % 10
        WHEN 0 THEN 'pending' WHEN 1 THEN 'pending'
        WHEN 2 THEN 'paid' WHEN 3 THEN 'paid' WHEN 4 THEN 'paid' WHEN 5 THEN 'paid'
        WHEN 6 THEN 'shipped' WHEN 7 THEN 'shipped' WHEN 8 THEN 'shipped'
        ELSE 'cancelled' END),
     date('now', '-' || (abs(random()) % 30) || ' days')
   FROM seq`
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
  // Result size is already bounded by the per-table row cap (MAX_ROWS_PER_TABLE),
  // so a LIMIT isn't required. The connector parameterises LIMIT as `LIMIT ?`;
  // only reject an explicit, oversized literal LIMIT.
  if (verb === "SELECT") {
    const lim = s.match(/\bLIMIT\s+(\d+)/i)
    if (lim && Number(lim[1]) > SELECT_MAX_LIMIT) return `LIMIT too large (max ${SELECT_MAX_LIMIT})`
  }
  return null
}

// Idempotent schema (mirrors schema.sql) so the Worker can bootstrap its own
// tables — lets a fresh deploy (e.g. Cloudflare Workers Builds) come up with no
// manual DDL: the reseed below creates anything missing, then fills it.
const SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL NOT NULL DEFAULT 0, stock INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'active', category_id INTEGER NOT NULL DEFAULT 1)`,
  `CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, country TEXT NOT NULL DEFAULT 'US', created_at TEXT NOT NULL DEFAULT (date('now')))`,
  `CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL DEFAULT 1, total REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL DEFAULT (date('now')))`
]

async function ensureSchema(env: Env): Promise<void> {
  // One-time cleanup of the pre-e-commerce demo tables.
  await env.DB.exec("DROP TABLE IF EXISTS posts")
  // The old `products` table had a different shape; if it predates the
  // e-commerce schema (no `category_id`), drop it so the new CREATE applies.
  try {
    const info = await env.DB.prepare("PRAGMA table_info(products)").all()
    const cols = (info.results || []) as Array<{ name: string }>
    if (cols.length && !cols.some(c => c.name === "category_id")) {
      await env.DB.exec("DROP TABLE IF EXISTS products")
    }
  } catch {
    /* table doesn't exist yet — the CREATE below handles it */
  }
  for (const ddl of SCHEMA) await env.DB.exec(ddl)
}

async function reseed(env: Env): Promise<void> {
  await ensureSchema(env)
  await env.DB.batch(SEED.map(sql => env.DB.prepare(sql)))
}

// De-duped one-time bootstrap so concurrent first requests (the dashboard fires
// several queries at once) don't all reseed. Lets a freshly deployed Worker
// self-seed on first use instead of waiting for the 30-min cron.
let bootstrapPromise: Promise<void> | null = null
function ensureSeeded(env: Env): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = reseed(env).catch(e => {
      bootstrapPromise = null // failed — let a later request retry
      throw e
    })
  }
  return bootstrapPromise
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
        // Self-heal: on a fresh/just-deployed DB the tables may not exist yet.
        // Bootstrap (create + seed) once, then retry, so the first visitor sees
        // data without waiting for the cron.
        if (/no such table/i.test(String(e?.message || e))) {
          try {
            await ensureSeeded(env)
            const { results, meta } = await env.DB.prepare(sql)
              .bind(...args)
              .all()
            return json({ rows: results ?? [], rowsAffected: meta?.changes ?? 0 }, req)
          } catch (e2: any) {
            return json({ error: String(e2?.message || e2) }, req)
          }
        }
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

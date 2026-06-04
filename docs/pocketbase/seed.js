#!/usr/bin/env node
/**
 * Seed a local PocketBase for the dashin demo.
 * Usage:
 *   node docs/pocketbase/seed.js            (PB at http://127.0.0.1:8090)
 *   PB_URL=... PB_ADMIN=... PB_ADMIN_PW=... node docs/pocketbase/seed.js
 *
 * Creates: a `posts` collection (name/status/views), a demo user
 * (demo / bunadmin123), and a few sample records. Idempotent-ish: ignores
 * "already exists" errors.
 */
const PB = process.env.PB_URL || "http://127.0.0.1:8090"
const ADMIN = process.env.PB_ADMIN || "admin@bunadmin.test"
const ADMIN_PW = process.env.PB_ADMIN_PW || "bunadmin123"

async function api(path, opts = {}, token) {
  const res = await fetch(`${PB}${path}`, {
    method: opts.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {})
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}

async function main() {
  // Admin auth (PocketBase 0.22: /api/admins; 0.23+: /api/collections/_superusers)
  let auth = await api("/api/admins/auth-with-password", {
    method: "POST",
    body: { identity: ADMIN, password: ADMIN_PW }
  })
  if (!auth.ok)
    auth = await api("/api/collections/_superusers/auth-with-password", {
      method: "POST",
      body: { identity: ADMIN, password: ADMIN_PW }
    })
  if (!auth.ok) {
    console.error("Admin auth failed. Create an admin first:")
    console.error("  ./pocketbase admin create", ADMIN, ADMIN_PW)
    process.exit(1)
  }
  const token = auth.json.token

  // posts collection
  const coll = await api(
    "/api/collections",
    {
      method: "POST",
      body: {
        name: "posts",
        type: "base",
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
        schema: [
          { name: "name", type: "text", required: true },
          {
            name: "status",
            type: "select",
            options: { maxSelect: 1, values: ["Draft", "Published"] }
          },
          { name: "views", type: "number" }
        ]
      }
    },
    token
  )
  console.log("posts collection:", coll.ok ? "created" : `skip (${coll.status})`)

  // products collection (second schema → demonstrates multi-level menus)
  const prodColl = await api(
    "/api/collections",
    {
      method: "POST",
      body: {
        name: "products",
        type: "base",
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: "",
        deleteRule: "",
        schema: [
          { name: "name", type: "text", required: true },
          { name: "price", type: "number", required: true },
          { name: "in_stock", type: "bool" }
        ]
      }
    },
    token
  )
  console.log("products collection:", prodColl.ok ? "created" : `skip (${prodColl.status})`)

  // demo user
  const user = await api(
    "/api/collections/users/records",
    {
      method: "POST",
      body: {
        username: "demo",
        email: "demo@bunadmin.test",
        password: "bunadmin123",
        passwordConfirm: "bunadmin123"
      }
    },
    token
  )
  console.log("demo user:", user.ok ? "created (demo / bunadmin123)" : `skip (${user.status})`)

  // sample records
  for (let i = 1; i <= 3; i++) {
    const r = await api(
      "/api/collections/posts/records",
      {
        method: "POST",
        body: {
          name: `Post ${i}`,
          status: i % 2 ? "Draft" : "Published",
          views: i * 10
        }
      },
      token
    )
    console.log(`post ${i}:`, r.ok ? "created" : `skip (${r.status})`)
  }

  // sample products
  const products = [
    { name: "Widget", price: 9.99, in_stock: true },
    { name: "Gadget", price: 24.99, in_stock: true },
    { name: "Thingamajig", price: 4.99, in_stock: false }
  ]
  for (const p of products) {
    const r = await api(
      "/api/collections/products/records",
      { method: "POST", body: p },
      token
    )
    console.log(`product ${p.name}:`, r.ok ? "created" : `skip (${r.status})`)
  }
  console.log("\nDone. Set your dashin .env:")
  console.log("  VITE_AUTH_PLUGIN=@dashin-dev/auth-pocketbase")
  console.log(`  VITE_AUTH_URL=${PB}`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})

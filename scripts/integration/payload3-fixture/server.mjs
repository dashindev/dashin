// Real Payload 3 REST handlers, as supported by Payload's REST testing docs.
// A small HTTP transport avoids pretending this verifies Next.js UI/SSR.
import http from "node:http"
import { randomBytes } from "node:crypto"
import { APIError, buildConfig, getPayload } from "payload"
import { sqliteAdapter } from "@payloadcms/db-sqlite"
import { REST_GET, REST_POST, REST_PATCH, REST_DELETE } from "@payloadcms/next/routes"

const allow = () => true
const config = buildConfig({
  secret: randomBytes(32).toString("hex"), telemetry: false,
  db: sqliteAdapter({ client: { url: "file:/tmp/fixture/fixture.db" } }),
  admin: { disable: true },
  collections: [
    { slug: "users", auth: true, fields: [] },
    { slug: "products", access: { read: allow, create: allow, update: allow, delete: allow },
      fields: [
        { name: "sku", type: "text", required: true, unique: true },
        { name: "name", type: "text", required: true, validate: value => value === "reject-write" ? "Synthetic validation refusal" : true }
      ],
      hooks: { beforeOperation: [async ({ args, operation }) => {
        if (operation === "read" && Number(args.limit) === 17) await new Promise(resolve => setTimeout(resolve, 1500))
        return args
      }] }
    },
    { slug: "restricted-products", fields: [{ name: "name", type: "text" }],
      access: { read: allow }, hooks: { beforeOperation: [({ args }) => { throw new APIError("Synthetic query refusal", 400) }] }
    }
  ]
})
const payload = await getPayload({ config })
const handlers = { GET: REST_GET(config), POST: REST_POST(config), PATCH: REST_PATCH(config), DELETE: REST_DELETE(config) }
const metrics = { productsRequests: 0 }
const server = http.createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url, "http://127.0.0.1:3000")
    if (url.pathname === "/fixture/health") {
      outgoing.setHeader("Content-Type", "application/json")
      outgoing.end(JSON.stringify({ runId: process.env.FIXTURE_RUN_ID, version: "3.90.2", ...metrics })); return
    }
    if (!url.pathname.startsWith("/api/")) { outgoing.writeHead(404); outgoing.end(); return }
    if (url.pathname === "/api/products") metrics.productsRequests++
    const chunks = []
    for await (const chunk of incoming) chunks.push(chunk)
    const method = incoming.method
    const request = new Request(url, { method, headers: incoming.headers, ...(["POST", "PATCH"].includes(method) ? { body: Buffer.concat(chunks) } : {}) })
    const handler = handlers[method]
    if (!handler) { outgoing.writeHead(405); outgoing.end(); return }
    const response = await handler(request, { params: Promise.resolve({ slug: url.pathname.slice(5).split("/") }) })
    outgoing.writeHead(response.status, Object.fromEntries(response.headers))
    outgoing.end(Buffer.from(await response.arrayBuffer()))
  } catch (error) {
    console.error(error)
    if (!outgoing.headersSent) outgoing.writeHead(500, { "Content-Type": "application/json" })
    outgoing.end(JSON.stringify({ errors: [{ message: String(error.message || error) }] }))
  }
})
server.listen(3000, "0.0.0.0", () => console.log("Isolated Payload 3 REST ready; no production credentials."))
process.once("SIGTERM", async () => { server.close(); await payload.db.destroy(); process.exit(0) })

#!/usr/bin/env bash
# One-command dashin demo: Payload CMS + SQLite.
#
#   ./start.sh            # installs Payload, seeds it, serves on :3001
#
# Then in another terminal, scaffold + run the admin (see README.md).
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
PAYLOAD_DIR="$DIR/.payload"
PORT="${PAYLOAD_PORT:-3001}"

mkdir -p "$PAYLOAD_DIR"
cd "$PAYLOAD_DIR"

# 1. Scaffold Payload project if not already present.
if [ ! -f "package.json" ]; then
  echo "→ scaffolding Payload CMS project ..."
  cat > package.json <<'PKG'
{
  "name": "dashin-payload-demo",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "payload dev",
    "seed": "node seed.js"
  },
  "dependencies": {
    "payload": "^3.0.0",
    "@payloadcms/db-sqlite": "^3.0.0",
    "@payloadcms/next": "^3.0.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "graphql": "^16.9.0",
    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0"
  }
}
PKG

  # payload.config.ts — SQLite, REST API enabled, posts collection
  cat > payload.config.ts <<'CFG'
import { buildConfig } from "payload"
import { sqliteAdapter } from "@payloadcms/db-sqlite"
import path from "path"

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "dashin-demo-secret-change-me",
  db: sqliteAdapter({ url: `file:${path.resolve(__dirname, "data.db")}` }),
  collections: [
    {
      slug: "posts",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "status", type: "select", options: ["draft", "published"], defaultValue: "draft" },
        { name: "views", type: "number", defaultValue: 0 },
      ],
    },
    {
      slug: "products",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "price", type: "number", required: true },
        { name: "inStock", type: "checkbox", defaultValue: true },
      ],
    },
  ],
})
CFG

  # seed script
  cat > seed.js <<'SEED'
import { getPayload } from "payload"
import config from "./payload.config.ts"

const ADMIN_EMAIL = process.env.PAYLOAD_ADMIN || "admin@dashin.test"
const ADMIN_PW = process.env.PAYLOAD_ADMIN_PW || "dashin123"

async function seed() {
  const payload = await getPayload({ config })

  // Create admin user (Payload auto-creates a users collection)
  try {
    await payload.create({ collection: "users", data: { email: ADMIN_EMAIL, password: ADMIN_PW } })
    console.log(`✓ admin created: ${ADMIN_EMAIL}`)
  } catch { console.log("  admin already exists") }

  // Seed posts
  const posts = [
    { title: "Hello World", status: "published", views: 42 },
    { title: "Getting Started with Dashin", status: "published", views: 128 },
    { title: "Draft Post", status: "draft", views: 0 },
  ]
  for (const p of posts) {
    await payload.create({ collection: "posts", data: p })
  }
  console.log(`✓ seeded ${posts.length} posts`)

  // Seed products
  const products = [
    { name: "Widget", price: 9.99, inStock: true },
    { name: "Gadget", price: 24.99, inStock: true },
    { name: "Thingamajig", price: 4.99, inStock: false },
  ]
  for (const p of products) {
    await payload.create({ collection: "products", data: p })
  }
  console.log(`✓ seeded ${products.length} products`)

  process.exit(0)
}

seed()
SEED

  echo "→ installing dependencies (this may take a minute) ..."
  npm install
fi

# 2. Seed data (idempotent-ish — duplicates are harmless for a demo).
echo "→ seeding demo data ..."
npx tsx seed.js 2>/dev/null || node --loader tsx seed.js

# 3. Start Payload dev server.
echo "→ starting Payload on http://127.0.0.1:${PORT} ..."
echo "  admin panel: http://127.0.0.1:${PORT}/admin"
echo "  REST API:    http://127.0.0.1:${PORT}/api/posts"
PORT=$PORT npx payload dev

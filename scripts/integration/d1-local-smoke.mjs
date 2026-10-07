// Real HTTP -> existing gateway -> workerd/D1 SQLite. No remote bindings or credentials.
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { createRequire } from "node:module"
import { spawn } from "node:child_process"

const repo = process.cwd()
const workerRequire = createRequire(path.join(repo, "workers/d1-demo-api/package.json"))
const { Miniflare } = workerRequire("miniflare")
const { transformSync } = workerRequire("esbuild")
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dashin-d1-isolated-"))
const script = transformSync(fs.readFileSync(path.join(repo, "workers/d1-demo-api/src/index.ts"), "utf8"), { loader: "ts", format: "esm" }).code
console.log(`Local-only state: ${tmp}`)
const mf = new Miniflare({ modules: true, script, compatibilityDate: "2025-01-01", host: "127.0.0.1", port: 0, d1Databases: { DB: "dashin-isolated" }, d1Persist: tmp })
try {
  const url = await mf.ready
  console.log(`Local-only HTTP gateway: ${url}`)
  const response = await fetch(new URL("/health", url))
  if (!(await response.json()).ok) throw new Error("gateway not healthy")
  // Seed only this newly-created local DB through the existing bootstrap path.
  const seed = await fetch(new URL("/query", url), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sql: 'SELECT * FROM "categories" LIMIT 1', args: [] }) })
  const result = await seed.json()
  if (!result.rows?.length) throw new Error(`local bootstrap failed: ${JSON.stringify(result)}`)
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(repo, "node_modules/vitest/vitest.mjs"), "run", "--config", "scripts/integration/vitest.config.ts"], {
      cwd: repo, stdio: "inherit", windowsHide: true,
      env: { ...process.env, DASHIN_D1_TEST_URL: url.origin, DASHIN_PAYLOAD_TEST_URL: "" }
    })
    child.once("error", reject); child.once("exit", resolve)
  })
  if (code !== 0) throw new Error(`D1 integration tests exited ${code}`)
} finally {
  await mf.dispose()
  const resolved = path.resolve(tmp)
  if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith("dashin-d1-isolated-")) throw new Error("unsafe cleanup target")
  fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  if (fs.existsSync(resolved)) throw new Error("local state cleanup failed")
  console.log("Local worker stopped; disposable state removed.")
}

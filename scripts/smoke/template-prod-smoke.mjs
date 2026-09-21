/**
 * Consumer prod-build smoke test.
 *
 * Scaffolds the Vite template into a temp dir, points its @dashin-dev/* deps at
 * the LOCAL workspace packages (so it tests the built `lib/` a real consumer
 * gets, not the published alpha), runs a production `vite build`, serves
 * `vite preview`, and headless-loads it asserting the app mounts with no fatal
 * runtime errors.
 *
 * This is the layer unit tests can't reach: it would have caught the prod-only
 * "Object.defineProperty called on non-object" crash (commonjs strictRequires),
 * the "exports is not defined" i18n-glob crash, and an unstyled shell.
 *
 * Build all package lib/ first (`yarn tsc:build`). Set SMOKE_BUILD_ONLY=1 to
 * stop after `vite build` (skips installing a browser) for a quick local check.
 */
import { execFileSync, execSync, spawn } from "node:child_process"
import fs from "node:fs"
import net from "node:net"
import os from "node:os"
import path from "node:path"
import { randomUUID } from "node:crypto"

const repo = process.cwd()
const templateDir = path.join(
  repo,
  "packages/dashin-cli/templates/typescript-vite"
)
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dashin-smoke-"))
const BUILD_ONLY = process.env.SMOKE_BUILD_ONLY === "1"
const RUN_ID = randomUUID()

// Fatal runtime errors that build/unit tests can't catch.
const FATAL =
  /Object\.defineProperty called on non-object|exports is not defined|require is not defined|does not provide an export|auth plugin is required|Failed to fetch dynamically imported module/i

const log = (m) => console.log(`\n▸ ${m}`)

// Pack a local workspace package to a tarball and return its path. Installing
// the tarball mimics a real registry install (no symlink quirks; only `files`
// are included; transitive deps resolve from the registry) — unlike a `file:`
// dir dep, which can break Rollup's named-export resolution through symlinks.
function packLocal(pkgDir, outDir) {
  const out = execSync(`npm pack --silent --pack-destination "${outDir}"`, {
    cwd: path.join(repo, pkgDir)
  })
    .toString()
    .trim()
    .split(/\r?\n/)
    .pop()
    .trim()
  return "file:" + path.join(outDir, out)
}

let server
let port

function getFreePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer()
    probe.unref()
    probe.once("error", reject)
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address()
      const freePort = typeof address === "object" && address ? address.port : 0
      probe.close(error => error ? reject(error) : resolve(freePort))
    })
  })
}

function waitForExit(child, timeoutMs = 10_000) {
  if (!child || child.exitCode !== null) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`process ${child.pid} did not exit`)), timeoutMs)
    child.once("exit", () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

async function stopProcessTree(child) {
  if (!child || child.exitCode !== null || !child.pid) return
  if (process.platform === "win32") {
    try {
      execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" })
    } catch {
      if (child.exitCode === null) child.kill()
    }
  } else {
    try { process.kill(-child.pid, "SIGTERM") } catch { child.kill("SIGTERM") }
  }
  await waitForExit(child)
}

async function assertPortReleased(portNumber, timeoutMs = 10_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const available = await new Promise(resolve => {
      const probe = net.createServer()
      probe.unref()
      probe.once("error", () => resolve(false))
      probe.listen(portNumber, "127.0.0.1", () => probe.close(() => resolve(true)))
    })
    if (available) return
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(`preview port ${portNumber} was not released`)
}

async function cleanup() {
  await stopProcessTree(server)
  if (port) await assertPortReleased(port)
  fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  if (fs.existsSync(tmp)) throw new Error(`temporary directory was not removed: ${tmp}`)
}

async function waitForServer(url, child, getSpawnError, timeoutMs = 60_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const spawnError = getSpawnError()
    if (spawnError) throw new Error(`vite preview failed to start: ${spawnError.message}`)
    if (child.exitCode !== null) {
      throw new Error(`vite preview exited before becoming ready (code ${child.exitCode})`)
    }
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(2_000) })
      if (r.ok && (await r.text()).includes(RUN_ID)) return
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`current smoke preview not ready at ${url}`)
}

async function main() {
  log(`scaffolding template -> ${tmp}`)
  fs.cpSync(templateDir, tmp, { recursive: true })

  // A per-run marker prevents an unrelated or leaked preview from satisfying
  // readiness checks for this newly-scaffolded application.
  const indexPath = path.join(tmp, "index.html")
  const indexHtml = fs.readFileSync(indexPath, "utf8")
  fs.writeFileSync(
    indexPath,
    indexHtml.replace("</head>", `  <meta name="dashin-smoke-run" content="${RUN_ID}" />\n</head>`)
  )

  // Point @dashin-dev/* at locally-packed tarballs of the workspace packages.
  const tgzDir = path.join(tmp, "_pkgs")
  fs.mkdirSync(tgzDir)
  log("npm pack local packages")
  const pkgPath = path.join(tmp, "package.json")
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
  pkg.dependencies["@dashin-dev/dashin"] = packLocal("packages/dashin", tgzDir)
  pkg.dependencies["@dashin-dev/auth-local"] = packLocal("plugins/auth-local", tgzDir)
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))

  // Materialize .env (default template auth-local — no backend needed).
  fs.copyFileSync(path.join(tmp, ".env.example"), path.join(tmp, ".env"))

  log("npm install (local @dashin-dev/* + deps)")
  execSync("npm install --no-audit --no-fund --no-save=false", {
    cwd: tmp,
    stdio: "inherit"
  })

  log("vite build (production)")
  execSync("npx vite build", { cwd: tmp, stdio: "inherit" })

  if (BUILD_ONLY) {
    log("SMOKE_BUILD_ONLY=1 — built OK, skipping browser check")
    return
  }

  log("vite preview")
  port = await getFreePort()
  const viteBin = path.join(tmp, "node_modules", "vite", "bin", "vite.js")
  server = spawn(
    process.execPath,
    [viteBin, "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
    {
      cwd: tmp,
      stdio: "inherit",
      shell: false,
      windowsHide: true,
      detached: process.platform !== "win32"
    }
  )
  let spawnError
  server.once("error", error => { spawnError = error })
  const base = `http://127.0.0.1:${port}/`
  await waitForServer(base, server, () => spawnError)

  log("headless load + assert")
  const { chromium } = await import("@playwright/test")
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()))

  await page.goto(base, { waitUntil: "networkidle" })
  const marker = await page.locator(`meta[name="dashin-smoke-run"][content="${RUN_ID}"]`).count()
  const rootHtml = (await page.locator("#root").innerHTML().catch(() => "")) || ""
  await browser.close()

  const fatal = errors.filter((e) => FATAL.test(e))
  if (fatal.length) {
    throw new Error(`fatal runtime errors:\n${fatal.join("\n")}`)
  }
  if (!rootHtml.trim()) {
    throw new Error("#root is empty — app did not mount")
  }
  if (marker !== 1) {
    throw new Error("loaded page does not belong to the current smoke run")
  }
  log(`OK — app mounted (root len ${rootHtml.length}), no fatal errors`)
}

let failure
try {
  await main()
} catch (error) {
  failure = error
}

try {
  await cleanup()
} catch (cleanupError) {
  failure = failure
    ? new Error(`${failure.message}\ncleanup failed: ${cleanupError.message}`)
    : cleanupError
}

if (failure) {
  console.error("\n✗ SMOKE FAILED:", failure.message)
  process.exit(1)
}

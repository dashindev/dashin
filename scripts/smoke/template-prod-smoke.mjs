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
import { execSync, spawn } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

const repo = process.cwd()
const templateDir = path.join(
  repo,
  "packages/dashin-cli/templates/typescript-vite"
)
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dashin-smoke-"))
const PORT = 4188
const BUILD_ONLY = process.env.SMOKE_BUILD_ONLY === "1"

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
function cleanup() {
  try {
    if (server && !server.killed) server.kill()
  } catch {}
  try {
    fs.rmSync(tmp, { recursive: true, force: true })
  } catch {}
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url)
      if (r.ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`server not ready at ${url}`)
}

async function main() {
  log(`scaffolding template -> ${tmp}`)
  fs.cpSync(templateDir, tmp, { recursive: true })

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
  server = spawn(
    "npx",
    ["vite", "preview", "--port", String(PORT), "--strictPort"],
    { cwd: tmp, stdio: "inherit", shell: process.platform === "win32" }
  )
  const base = `http://localhost:${PORT}/`
  await waitForServer(base)

  log("headless load + assert")
  const { chromium } = await import("@playwright/test")
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()))

  await page.goto(base, { waitUntil: "networkidle" })
  const rootText = (await page.locator("#root").innerText().catch(() => "")) || ""
  const rootHtml = (await page.locator("#root").innerHTML().catch(() => "")) || ""
  await browser.close()

  const fatal = errors.filter((e) => FATAL.test(e))
  if (fatal.length) {
    throw new Error(`fatal runtime errors:\n${fatal.join("\n")}`)
  }
  if (!rootHtml.trim()) {
    throw new Error("#root is empty — app did not mount")
  }
  log(`OK — app mounted (root len ${rootHtml.length}), no fatal errors`)
}

main()
  .then(() => {
    cleanup()
    process.exit(0)
  })
  .catch((e) => {
    console.error("\n✗ SMOKE FAILED:", e.message)
    cleanup()
    process.exit(1)
  })

// Dedicated WSL Docker container; no existing databases, services or credentials.
import path from "node:path"
import { randomUUID } from "node:crypto"
import { execFileSync, spawn } from "node:child_process"
const repo = process.cwd(), runId = randomUUID()
const distribution = "Ubuntu", name = `dashin-payload3-${runId}`
const wsl = (...args) => execFileSync("wsl.exe", ["-d", distribution, "--", ...args], { encoding: "utf8", windowsHide: true }).trim()
const linuxTmp = wsl("mktemp", "-d", "/tmp/dashin-payload3-XXXXXXXX")
if (!/^\/tmp\/dashin-payload3-[A-Za-z0-9]+$/.test(linuxTmp)) throw new Error("unsafe temporary path")
let container
try {
  const fixtureSource = path.join(repo, "scripts/integration/payload3-fixture").replaceAll(String.fromCharCode(92), "/").replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`)
  wsl("cp", "--", `${fixtureSource}/package.json`, `${fixtureSource}/server.mjs`, linuxTmp)
  const uid = wsl("id", "-u"), gid = wsl("id", "-g")
  const image = wsl("docker", "image", "inspect", "node:20-alpine", "--format", "{{.Id}}")
  if (!/^sha256:[a-f0-9]{64}$/.test(image)) throw new Error("cached Node image not found")
  console.log(`Isolated fixture directory: ${linuxTmp}; Node image: ${image}`)
  if (wsl("test", "-f", `${linuxTmp}/package.json`) !== "") throw new Error("unexpected fixture path check output")
  container = wsl("docker", "create", "--name", name,
    "--label", `dashin.smoke.run=${runId}`, "--user", `${uid}:${gid}`, "--cap-drop", "ALL",
    "--security-opt", "no-new-privileges", "--memory", "2g", "--pids-limit", "256",
    "--publish", "127.0.0.1::3000",
    "--workdir", "/tmp", "--env", "HOME=/tmp", "--env", "NEXT_TELEMETRY_DISABLED=1",
    "--env", `FIXTURE_RUN_ID=${runId}`, image, "sh", "-c", "cd /tmp/fixture && corepack prepare pnpm@9.15.9 --activate && corepack pnpm install --reporter=append-only --network-concurrency=8 && node server.mjs")
  if (!/^[a-f0-9]{64}$/.test(container)) throw new Error("invalid container ID")
  // Copy through the Docker API: daemon and WSL may have different /tmp mounts.
  wsl("docker", "cp", "--archive", linuxTmp, `${container}:/tmp/fixture`)
  wsl("docker", "start", container)
  const mapping = wsl("docker", "port", container, "3000/tcp")
  if (!/^127\.0\.0\.1:\d+$/.test(mapping)) throw new Error(`expected dedicated loopback mapping, got ${mapping}`)
  const prefix = `http://${mapping}`
  console.log(`Dedicated Payload REST: ${prefix}; container ${name}`)
  let ready = false
  for (let attempt = 0; attempt < 300; attempt++) {
    try {
      const response = await fetch(`${prefix}/fixture/health`, { signal: AbortSignal.timeout(1000) })
      if (response.ok && (await response.json()).runId === runId) { ready = true; break }
    } catch {}
    if (attempt % 15 === 0) console.log(`Waiting for isolated Payload install/start (${attempt * 2}s)...`)
    if (wsl("docker", "ps", "--quiet", "--filter", `id=${container}`) === "") throw new Error("fixture container stopped during install/start")
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  if (!ready) throw new Error("Payload fixture did not become ready within deadline")
  console.log("Payload 3.90.2 + SQLite ready; running real adapter chain tests.")
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(repo, "node_modules/vitest/vitest.mjs"), "run", "--config", "scripts/integration/vitest.config.ts"], {
      cwd: repo, stdio: "inherit", windowsHide: true, env: { ...process.env, DASHIN_PAYLOAD_TEST_URL: prefix, DASHIN_PAYLOAD_RUN_ID: runId }
    })
    child.once("error", reject); child.once("exit", resolve)
  })
  if (code !== 0) throw new Error(`Payload integration tests exited ${code}`)
} catch (error) {
  if (container) { try { console.error(wsl("docker", "logs", "--tail", "40", container)) } catch {} }
  throw error
} finally {
  if (container && wsl("docker", "ps", "--quiet", "--filter", `id=${container}`)) {
    // The ID came only from our successful run command, not another project.
    wsl("docker", "stop", "--time", "10", container)
  }
  if (container && wsl("docker", "ps", "--all", "--quiet", "--filter", `id=${container}`)) wsl("docker", "rm", container)
  const resolved = wsl("realpath", linuxTmp)
  if (resolved !== linuxTmp || !/^\/tmp\/dashin-payload3-[A-Za-z0-9]+$/.test(resolved)) throw new Error("unsafe cleanup path")
  wsl("rm", "-r", "--", resolved)
  console.log("Dedicated container stopped; isolated fixture/database removed.")
}

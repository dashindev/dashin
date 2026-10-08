// Run real Vitest suites without invoking legacy placeholder Jest/Prettier scripts.
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { createRequire } = require('node:module')
const root = path.resolve(__dirname, '..')
const exclude = process.argv.includes('--additional')
  ? new Set(['@dashin-dev/dashin', '@dashin-dev/source-payload', '@dashin-dev/source-d1'])
  : new Set()
let count = 0
for (const parent of ['packages', 'plugins']) {
  for (const entry of fs.readdirSync(path.join(root, parent), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const cwd = path.join(root, parent, entry.name)
    const manifest = path.join(cwd, 'package.json')
    if (!fs.existsSync(manifest)) continue
    const pkg = JSON.parse(fs.readFileSync(manifest, 'utf8'))
    if (pkg.scripts?.test !== 'vitest run' || exclude.has(pkg.name)) continue
    console.log(`\nSecurity workspace test: ${pkg.name}`)
    const localRequire = createRequire(manifest)
    const cli = path.join(path.dirname(localRequire.resolve('vitest/package.json')), 'vitest.mjs')
    const result = spawnSync(process.execPath, [cli, 'run'], { cwd, stdio: 'inherit' })
    if (result.error) throw result.error
    if (result.status !== 0) process.exit(result.status || 1)
    count++
  }
}
if (!count) throw new Error('No Vitest workspace suites selected')
console.log(`Security workspace suites passed: ${count}`)

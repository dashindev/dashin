// Focused regression gate, not a replacement for a full dependency audit.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')

const root = path.resolve(__dirname, '..')
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const manifests = [path.join(root, 'package.json')]
for (const parent of ['packages', 'plugins']) {
  for (const entry of fs.readdirSync(path.join(root, parent), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const file = path.join(root, parent, entry.name, 'package.json')
    if (fs.existsSync(file)) manifests.push(file)
  }
}

const lock = fs.readFileSync(path.join(root, 'yarn.lock'), 'utf8')
assert.ok(!/^.*\btinypool@.*:$/m.test(lock), 'Vulnerable legacy worker pool returned to yarn.lock')
assert.ok(!/^.*(?:vitest|@vitest\/coverage-v8)@(?:\^)?[123]\./m.test(lock), 'Legacy Vitest/coverage returned')
assert.equal(readJson(manifests[0]).resolutions['smol-toml'], '1.9.0')
assert.equal(readJson(manifests[0]).resolutions['vitest/vite'], '6.4.3')

let runners = 0
for (const file of manifests) {
  const pkg = readJson(file)
  const localRequire = createRequire(file)
  for (const name of ['vitest', '@vitest/coverage-v8']) {
    const declared = pkg.devDependencies?.[name]
    if (!declared) continue
    assert.equal(declared, '4.1.11', `${file}: ${name} must match the verified runner`)
    const installed = localRequire(`${name}/package.json`)
    assert.equal(installed.version, declared, `${file}: installed ${name} drifted`)
    assert.equal(installed.dependencies?.tinypool, undefined, `${name} reintroduced tinypool`)
    if (name === 'vitest') {
      const runnerRequire = createRequire(localRequire.resolve('vitest/package.json'))
      assert.equal(runnerRequire('vite/package.json').version, '6.4.3', 'Runner Vite drifted from the verified baseline')
    }
    runners++
  }
}
const nxRequire = createRequire(require.resolve('nx/package.json', { paths: [root] }))
// smol-toml does not export package.json. Resolve the entry Nx actually loads.
const tomlManifest = path.resolve(path.dirname(nxRequire.resolve('smol-toml')), '../package.json')
assert.equal(readJson(tomlManifest).version, '1.9.0', 'Nx does not resolve the fixed TOML parser')
const parsed = nxRequire('smol-toml').parse('name = "dashin"\n[build]\nenabled = true')
assert.equal(parsed.name, 'dashin')
assert.equal(parsed.build.enabled, true)
assert.equal(Object.getPrototypeOf(parsed), null)
console.log(`Security toolchain OK: ${runners} runner/coverage declarations; Nx smol-toml 1.9.0; no locked tinypool`)

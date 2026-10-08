const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const script = path.resolve(__dirname, '../check-security-toolchain.cjs')
const root = path.resolve(__dirname, '../..')
const source = fs.readFileSync(script, 'utf8')

// Inject broken manifests/locks in memory; never mutate the workspace or install.
function verify(mutate = (_file, text) => text) {
  const gateRequire = name => name === 'node:fs' ? {
    ...fs,
    readFileSync: (file, options) => mutate(path.resolve(file), fs.readFileSync(file, options))
  } : require(name)
  gateRequire.resolve = require.resolve
  vm.runInNewContext(source, {
    require: gateRequire,
    __dirname: path.dirname(script),
    console: { log() {} }
  }, { filename: script })
}

test('accepts the actually installed and locked fixed toolchain', () => verify())
test('rejects a legacy locked worker pool', () => {
  assert.throws(() => verify((file, text) => file === path.join(root, 'yarn.lock')
    ? `${text}\ntinypool@^1.1.1:\n  version "1.1.1"\n` : text), /legacy worker pool/)
})
test('rejects legacy Vitest entries even without a pool entry', () => {
  assert.throws(() => verify((file, text) => file === path.join(root, 'yarn.lock')
    ? `${text}\nvitest@^3.2.6:\n  version "3.2.6"\n` : text), /Legacy Vitest/)
})
test('rejects the old TOML resolution', () => {
  assert.throws(() => verify((file, text) => file === path.join(root, 'package.json')
    ? text.replace('"smol-toml": "1.9.0"', '"smol-toml": "1.7.1"') : text), /1\.7\.1/)
})
test('rejects a mismatched coverage declaration', () => {
  assert.throws(() => verify((file, text) => file === path.join(root, 'packages/dashin/package.json')
    ? text.replace('"@vitest/coverage-v8": "4.1.11"', '"@vitest/coverage-v8": "1.6.1"') : text), /must match/)
})

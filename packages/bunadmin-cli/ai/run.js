#!/usr/bin/env node
// Spike runner: node ai/run.js --url ... --collection posts [--mock '<json>'] [--out dir]
const { aiGenerate } = require("./generate")

function parseArgs(argv) {
  const o = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const k = argv[i].slice(2)
      const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true
      o[k] = v
    }
  }
  return o
}

;(async () => {
  const a = parseArgs(process.argv.slice(2))
  const res = await aiGenerate({
    source: a.source || "pocketbase",
    url: a.url,
    collection: a.collection,
    token: a.token,
    out: a.out || ".",
    mock: a.mock
  })
  if (res.errors) {
    console.error(`[${res.providerName || "?"}] ✗`, res.errors)
    process.exit(1)
  }
  console.log(
    `[${res.providerName}] ✓ valid after ${res.attempts} attempt(s) -> ${res.outPath}`
  )
})()

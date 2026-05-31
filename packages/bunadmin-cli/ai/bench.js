#!/usr/bin/env node
/**
 * Benchmark: real-model pass-rate through the validator.
 * Usage: node ai/bench.js   (reads BUNADMIN_AI_* + PB token from env/args)
 * The investor metric: what % of generations on a CHEAP model end up valid.
 */
const { introspectPocketbase } = require("./introspect")
const { getProvider } = require("./provider")
const { buildPrompt, extractJson } = require("./generate")
const { validateColumns } = require("./validate")

const PB = process.env.PB_URL || "http://127.0.0.1:8090"
const COLLECTIONS = (process.env.BENCH_COLLECTIONS || "posts,products,customers").split(",")
const RUNS = Number(process.env.BENCH_RUNS || 5)
const MODELS = (process.env.BENCH_MODELS || "llama-3.1-8b-instant,llama-3.3-70b-versatile").split(",")

async function adminToken() {
  const r = await fetch(`${PB}/api/admins/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identity: process.env.PB_ADMIN || "admin@bunadmin.test",
      password: process.env.PB_ADMIN_PW || "bunadmin123"
    })
  }).then(r => r.json())
  return r.token
}

/** one generation; returns {valid, attempts, reason} using the same retry policy */
async function oneRun(provider, schema) {
  const prompt = buildPrompt(schema)
  let lastErrors = []
  let reason = ""
  for (let attempt = 1; attempt <= 2; attempt++) {
    const raw = await provider.complete(
      attempt === 1 ? prompt : prompt + "\n\nPrevious output invalid:\n" + lastErrors.join("\n")
    )
    if (!raw) { reason = "empty-from-api"; await sleep(400); continue }
    const parsed = extractJson(raw)
    if (!parsed) { reason = "parse-fail"; lastErrors = ["unparseable JSON"]; continue }
    const r = validateColumns(parsed, schema)
    if (r.ok) return { valid: true, attempts: attempt }
    reason = "validation-reject"
    lastErrors = r.errors
  }
  return { valid: false, attempts: 2, reason, errors: lastErrors }
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

;(async () => {
  const token = await adminToken()
  const schemas = {}
  for (const c of COLLECTIONS) schemas[c] = await introspectPocketbase(PB, c, token)

  for (const model of MODELS) {
    process.env.BUNADMIN_AI_PROVIDER = "openai"
    process.env.BUNADMIN_AI_BASE_URL = "https://api.groq.com/openai/v1"
    process.env.BUNADMIN_AI_API_KEY = process.env.GROQ_API_KEY
    process.env.BUNADMIN_AI_MODEL = model
    const provider = getProvider()

    let pass = 0, total = 0, firstTry = 0
    const reasons = {}
    for (const c of COLLECTIONS) {
      for (let i = 0; i < RUNS; i++) {
        total++
        let res
        try {
          res = await oneRun(provider, schemas[c])
        } catch (e) {
          res = { valid: false, attempts: 0, reason: "exception", errors: [e.message] }
        }
        if (res.valid) {
          pass++
          if (res.attempts === 1) firstTry++
        } else {
          reasons[res.reason] = (reasons[res.reason] || 0) + 1
        }
        await sleep(250)
      }
    }
    const pct = ((pass / total) * 100).toFixed(0)
    const ft = ((firstTry / total) * 100).toFixed(0)
    console.log(`\n=== ${model} ===`)
    console.log(`valid: ${pass}/${total} (${pct}%)  |  first-try: ${ft}%  |  ${COLLECTIONS.join(",")} x${RUNS}`)
    if (Object.keys(reasons).length)
      console.log("  failure reasons:", JSON.stringify(reasons))
  }
})()

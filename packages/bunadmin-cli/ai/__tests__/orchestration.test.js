// node --test ai/__tests__/orchestration.test.js
const { test } = require("node:test")
const assert = require("node:assert")
const path = require("path")
const os = require("os")
const fs = require("fs")

// Stub ./introspect in the require cache so aiGenerate/aiRefine don't hit network.
const introspectPath = require.resolve("../introspect")
require.cache[introspectPath] = {
  id: introspectPath,
  filename: introspectPath,
  loaded: true,
  exports: {
    introspectPocketbase: async () => ({
      source: "pocketbase",
      collection: "posts",
      fields: [
        { name: "name", type: "text" },
        { name: "status", type: "select", values: ["Draft", "Published"] }
      ]
    })
  }
}

const { aiGenerate } = require("../generate")
const { aiRefine } = require("../refine")

const out = fs.mkdtempSync(path.join(os.tmpdir(), "aigen-"))

test("aiGenerate: valid mock output emits a schema file (1 attempt)", async () => {
  const mock = JSON.stringify({
    columns: [{ field: "name" }, { field: "status", lookup: { Draft: "Draft", Published: "Published" } }]
  })
  const res = await aiGenerate({ url: "http://x", collection: "posts", out, mock })
  assert.equal(res.errors, undefined)
  assert.equal(res.attempts, 1)
  assert.ok(fs.existsSync(res.outPath))
  assert.match(fs.readFileSync(res.outPath, "utf8"), /export default function Posts/)
})

test("aiGenerate: hallucinated field is rejected after retries", async () => {
  const mock = JSON.stringify({ columns: [{ field: "not_a_real_field" }] })
  const res = await aiGenerate({ url: "http://x", collection: "posts", out, mock })
  assert.ok(res.errors)
  assert.equal(res.attempts, 2)
})

test("aiGenerate: missing url/collection errors fast", async () => {
  assert.ok((await aiGenerate({ url: "", collection: "" })).errors)
})

test("aiRefine: deterministic 'make X numeric' path (no LLM)", async () => {
  // keep all real fields (validator requires full coverage); just retype one.
  const res = await aiRefine({
    url: "http://x", collection: "posts",
    columns: [{ field: "name" }, { field: "status" }],
    instruction: "make status numeric", out
  })
  assert.equal(res.mode, "deterministic")
  assert.equal(res.columns.find(c => c.field === "status").type, "numeric")
})

test("aiRefine: LLM path via mock returns updated validated columns", async () => {
  const mock = JSON.stringify({
    columns: [{ field: "name", title: "Full Name" }, { field: "status" }]
  })
  const res = await aiRefine({
    url: "http://x", collection: "posts",
    columns: [{ field: "name" }, { field: "status" }],
    instruction: "rename the name column header to Full Name", out, mock
  })
  assert.equal(res.mode, "llm")
  assert.equal(res.errors, undefined)
})

test("aiRefine: needs columns + instruction", async () => {
  assert.ok((await aiRefine({ url: "u", collection: "c", columns: [], instruction: "x" })).errors)
  assert.ok((await aiRefine({ url: "u", collection: "c", columns: [{ field: "a" }] })).errors)
})

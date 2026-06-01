// node --test ai/__tests__/refine.test.js
const { test } = require("node:test")
const assert = require("node:assert")
const { tryDeterministicRefine, buildRefinePrompt } = require("../refine")

const cols = [
  { title: "Id", field: "id" },
  { title: "Name", field: "name" },
  { title: "Views", field: "views" },
  { title: "Albums", field: "albums" }
]

test("remove <field> drops the column", () => {
  const out = tryDeterministicRefine(cols, "remove albums")
  assert.equal(out.length, 3)
  assert.ok(!out.some(c => c.field === "albums"))
})

test("drop/hide synonyms + 'the' work", () => {
  assert.equal(tryDeterministicRefine(cols, "drop the views").length, 3)
  assert.ok(!tryDeterministicRefine(cols, "hide name").some(c => c.field === "name"))
})

test("make <field> numeric sets type", () => {
  const out = tryDeterministicRefine(cols, "make views numeric")
  assert.equal(out.find(c => c.field === "views").type, "numeric")
  // unrelated columns unchanged
  assert.equal(out.find(c => c.field === "name").type, undefined)
})

test("returns null for unrecognized / no-op instructions", () => {
  assert.equal(tryDeterministicRefine(cols, "remove nonexistent"), null)
  assert.equal(tryDeterministicRefine(cols, "please make it pretty"), null)
})

test("buildRefinePrompt includes current columns + instruction + real fields", () => {
  const p = buildRefinePrompt(
    { collection: "posts", fields: [{ name: "name", type: "text" }] },
    cols,
    "make views numeric"
  )
  assert.ok(p.includes("make views numeric"))
  assert.ok(p.includes("CURRENT columns"))
  assert.ok(p.includes('"field": "albums"') || p.includes("albums"))
})

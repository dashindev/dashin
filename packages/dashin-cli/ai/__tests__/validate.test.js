// Node built-in test runner: node --test ai/__tests__/validate.test.js
const { test } = require("node:test")
const assert = require("node:assert")
const { validateColumns } = require("../validate")

const schema = {
  collection: "posts",
  fields: [
    { name: "name", type: "text" },
    { name: "status", type: "select", values: ["Draft", "Published"] },
    { name: "views", type: "number" }
  ]
}

test("accepts columns that map to real fields", () => {
  const r = validateColumns(
    {
      columns: [
        { field: "id" },
        { field: "name" },
        { field: "status", lookup: { Draft: "Draft", Published: "Published" } },
        { field: "views", type: "numeric" }
      ]
    },
    schema
  )
  assert.equal(r.ok, true)
  assert.equal(r.errors.length, 0)
})

test("rejects a hallucinated field", () => {
  const r = validateColumns({ columns: [{ field: "author_email" }] }, schema)
  assert.equal(r.ok, false)
  assert.ok(r.errors.some(e => e.includes("hallucinated field \"author_email\"")))
})

test("rejects lookup values not in the source enum", () => {
  const r = validateColumns(
    { columns: [{ field: "status", lookup: { Archived: "Archived" } }] },
    schema
  )
  assert.ok(r.errors.some(e => e.includes("unknown values: Archived")))
})

test("flags missing coverage of real fields", () => {
  const r = validateColumns({ columns: [{ field: "name" }] }, schema)
  assert.ok(r.errors.some(e => e.includes('missing column for field "views"')))
})

test("rejects output with no columns array", () => {
  const r = validateColumns({}, schema)
  assert.equal(r.ok, false)
})

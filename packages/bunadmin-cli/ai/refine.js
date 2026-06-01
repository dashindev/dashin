/**
 * `bunadmin ai refine` — conversational/iterative refinement of an already
 * generated admin. Takes the CURRENT columns + a natural-language instruction
 * ("add a status filter", "make views numeric", "remove albums"), asks the LLM
 * for the updated columns, and VALIDATES against the same live schema before
 * re-emitting. Same constrained-contract moat as `ai generate` — the AI edits a
 * validated column set, never freeform code.
 */
const { introspectPocketbase } = require("./introspect")
const { getProvider } = require("./provider")
const { validateColumns } = require("./validate")
const { extractJson, emitSchemaFile } = require("./generate")

function buildRefinePrompt(schema, currentColumns, instruction) {
  return [
    "You are refining an existing bunadmin admin table definition (STRICT JSON).",
    `Collection: "${schema.collection}".`,
    "Real fields (use ONLY these, never invent fields):",
    JSON.stringify(schema.fields, null, 2),
    "",
    "CURRENT columns:",
    JSON.stringify({ columns: currentColumns }, null, 2),
    "",
    `Apply this change: "${instruction}"`,
    "",
    "Return the FULL updated columns array (not a diff), same JSON shape:",
    '{ "columns": [ { "title": string, "field": <real field>, "type"?: "numeric",',
    '  "lookup"?: { <value>: <label> } } ] }',
    "Rules: one column per field; keep unrelated columns unchanged; lookup is a",
    "flat {value:label} object; type:\"numeric\" only for number fields.",
    "Return ONLY JSON, no prose."
  ].join("\n")
}

/**
 * Merge helper: apply common deterministic instructions WITHOUT an LLM, so the
 * refine logic is testable and cheap for simple ops. Returns updated columns or
 * null if the instruction isn't a recognized deterministic op.
 */
function tryDeterministicRefine(columns, instruction) {
  const instr = String(instruction).toLowerCase().trim()
  let m

  // "remove <field>" / "drop <field>" / "hide <field>"
  if ((m = instr.match(/^(remove|drop|hide)\s+(?:the\s+)?(\w+)/))) {
    const field = m[2]
    const next = columns.filter(c => c.field.toLowerCase() !== field)
    return next.length !== columns.length ? next : null
  }
  // "make <field> numeric"
  if ((m = instr.match(/^make\s+(?:the\s+)?(\w+)\s+numeric/))) {
    const field = m[1]
    let hit = false
    const next = columns.map(c => {
      if (c.field.toLowerCase() === field) {
        hit = true
        return { ...c, type: "numeric" }
      }
      return c
    })
    return hit ? next : null
  }
  return null
}

/**
 * @param opts { url, collection, token, columns, instruction, out, mock }
 * @returns { errors?, outPath?, columns?, mode, attempts, providerName }
 */
async function aiRefine(opts) {
  const {
    url,
    collection,
    token,
    columns,
    instruction,
    out = ".",
    mock
  } = opts
  if (!url || !collection) return { errors: "need --url and --collection" }
  if (!Array.isArray(columns) || columns.length === 0)
    return { errors: "need existing --columns (the current generated columns)" }
  if (!instruction) return { errors: "need an instruction, e.g. \"make views numeric\"" }

  const schema = await introspectPocketbase(url, collection, token)

  // Fast path: deterministic ops (still validated below).
  const deterministic = tryDeterministicRefine(columns, instruction)
  if (deterministic) {
    const v = validateColumns({ columns: deterministic }, schema)
    if (v.ok) {
      const outPath = emitSchemaFile(schema, v.columns, out)
      return { outPath, columns: v.columns, mode: "deterministic", attempts: 0 }
    }
    // fall through to LLM if the deterministic result didn't validate
  }

  // LLM path: same validate-and-retry contract as generate.
  const provider = getProvider(
    mock ? { ...process.env, DASHIN_AI_PROVIDER: "mock", __MOCK_RESPONSE: mock } : process.env
  )
  const prompt = buildRefinePrompt(schema, columns, instruction)
  let attempts = 0
  let result
  let lastErrors = []
  while (attempts < 2) {
    attempts++
    const raw = await provider.complete(
      attempts === 1 ? prompt : prompt + "\n\nPrevious output invalid:\n" + lastErrors.join("\n")
    )
    result = validateColumns(extractJson(raw) || {}, schema)
    if (result.ok) break
    lastErrors = result.errors
  }

  if (!result.ok)
    return {
      errors: `refine validation failed after ${attempts} attempt(s):\n - ${result.errors.join("\n - ")}`,
      attempts,
      providerName: provider.name
    }

  const outPath = emitSchemaFile(schema, result.columns, out)
  return { outPath, columns: result.columns, mode: "llm", attempts, providerName: provider.name }
}

module.exports = { aiRefine, buildRefinePrompt, tryDeterministicRefine }

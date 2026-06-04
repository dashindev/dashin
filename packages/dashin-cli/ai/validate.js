/**
 * THE MOAT. Validate LLM output against the introspected ground-truth schema.
 * Generic AI codegen ships freeform React that "might work"; we validate the
 * model's output against a known contract and reject/repair hallucinations.
 * This is why cheap/small models are good enough here.
 *
 * Returns { ok, errors[], columns } — columns is the cleaned, valid subset.
 */
function validateColumns(generated, schema) {
  const errors = []
  const fieldByName = {}
  schema.fields.forEach(f => (fieldByName[f.name] = f))
  // dashin always exposes id
  fieldByName.id = fieldByName.id || { name: "id", type: "text" }

  const cols = Array.isArray(generated && generated.columns)
    ? generated.columns
    : null
  if (!cols) {
    return { ok: false, errors: ["LLM output missing a `columns` array"], columns: [] }
  }

  const valid = []
  cols.forEach(col => {
    const field = col && col.field
    if (!field) {
      errors.push(`column missing \`field\`: ${JSON.stringify(col)}`)
      return
    }
    // HALLUCINATION CHECK: field must exist in the real schema
    if (!fieldByName[field]) {
      errors.push(
        `hallucinated field "${field}" — not in collection "${schema.collection}"`
      )
      return
    }
    // lookup must match the source's enum values, if any
    const src = fieldByName[field]
    if (col.lookup && src.values) {
      const bad = Object.keys(col.lookup).filter(k => !src.values.includes(k))
      if (bad.length)
        errors.push(`column "${field}" lookup has unknown values: ${bad.join(", ")}`)
    }
    valid.push(col)
  })

  // every required real field should be represented (completeness)
  const covered = new Set(valid.map(c => c.field))
  schema.fields.forEach(f => {
    if (!covered.has(f.name)) errors.push(`missing column for field "${f.name}"`)
  })

  return { ok: errors.length === 0, errors, columns: valid }
}

module.exports = { validateColumns }

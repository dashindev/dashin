/**
 * Source introspection — fetch the REAL schema from the backend so the LLM
 * generates against ground truth (not guesses). This is what makes cheap
 * models viable: the model fills a constrained template, it doesn't invent.
 *
 * Returns a normalized schema: { collection, fields: [{ name, type, values? }] }
 */
const http = require("http")
const https = require("https")

function getJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http
    lib
      .get(url, { headers }, res => {
        let data = ""
        res.on("data", c => (data += c))
        res.on("end", () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(e)
          }
        })
      })
      .on("error", reject)
  })
}

/** PocketBase: GET /api/collections -> normalized {collection, fields[]} */
async function introspectPocketbase(baseUrl, collection, token) {
  const res = await getJson(
    `${baseUrl}/api/collections`,
    token ? { Authorization: token } : {}
  )
  const items = res.items || []
  const found = items.find(c => c.name === collection)
  if (!found) {
    const names = items.map(c => c.name).join(", ")
    throw new Error(
      `Collection "${collection}" not found. Available: ${names || "(none)"}`
    )
  }
  const schema = found.schema || found.fields || []
  return {
    source: "pocketbase",
    collection: found.name,
    fields: schema
      .filter(f => !f.system)
      .map(f => ({
        name: f.name,
        type: f.type,
        values: f.options && f.options.values ? f.options.values : undefined
      }))
  }
}

module.exports = { introspectPocketbase }

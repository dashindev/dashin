// `dashin ai generate --url <pb-url> --collection <name> [--token <admin>] [--out <dir>]`
// `dashin ai theme "<description>" [--out <dir>]`
// Resolves the (uncompiled, CommonJS) ai/ modules relative to the built command.
const path = require("path")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { aiGenerate } = require(path.resolve(__dirname, "../../ai/generate"))
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { aiTheme } = require(path.resolve(__dirname, "../../ai/theme"))
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { aiRefine } = require(path.resolve(__dirname, "../../ai/refine"))

export default async function newAi(
  inputs: string[],
  options: { [key: string]: string | boolean } | any
): Promise<{ errors?: string; message?: string }> {
  const sub = inputs[1]

  if (sub === "generate") {
    const res = await aiGenerate({
      source: options.source || "pocketbase",
      url: options.url,
      collection: options.collection,
      token: options.token,
      out: options.out || ".",
      mock: options.mock
    })
    if (res.errors) return { errors: res.errors }
    return {
      message: `[${res.providerName}] generated (valid after ${res.attempts} attempt(s)): ${res.outPath}`
    }
  }

  if (sub === "theme") {
    // description = the free-text after "theme" (inputs[2]) or --desc
    const res = await aiTheme({
      description: inputs[2] || options.desc || options.description,
      out: options.out || ".",
      mock: options.mock
    })
    if (res.errors) return { errors: res.errors }
    return {
      message: `[${res.providerName}] theme (valid after ${res.attempts} attempt(s)) -> ${res.outPath}`
    }
  }

  if (sub === "refine") {
    let columns
    try {
      columns = options.columns ? JSON.parse(options.columns) : undefined
    } catch (e) {
      return { errors: "--columns must be a JSON array of the current columns" }
    }
    const res = await aiRefine({
      url: options.url,
      collection: options.collection,
      token: options.token,
      columns,
      instruction: inputs[2] || options.instruction,
      out: options.out || ".",
      mock: options.mock
    })
    if (res.errors) return { errors: res.errors }
    return {
      message: `[${res.mode}] refined (valid after ${res.attempts} attempt(s)) -> ${res.outPath}`
    }
  }

  return {
    errors: `Unknown ai subcommand "${sub || ""}". Try: dashin ai generate | theme | refine`
  }
}
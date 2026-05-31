// `bunadmin ai generate --url <pb-url> --collection <name> [--token <admin>] [--out <dir>]`
// Resolves the (uncompiled, CommonJS) ai/ modules relative to the built command.
const path = require("path")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { aiGenerate } = require(path.resolve(__dirname, "../../ai/generate"))

export default async function newAi(
  inputs: string[],
  options: { [key: string]: string | boolean } | any
): Promise<{ errors?: string; message?: string }> {
  const sub = inputs[1]
  if (sub !== "generate")
    return { errors: `Unknown ai subcommand "${sub || ""}". Try: bunadmin ai generate` }

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

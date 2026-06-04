/**
 * BYOK provider abstraction. One interface, many backends — frontier (OpenAI/
 * Anthropic via user's own key) OR cheap/self-hosted (Ollama, any OpenAI-
 * compatible base URL). The product never resells tokens; users bring a key
 * or point at a cheap endpoint. Config via env:
 *   DASHIN_AI_PROVIDER = openai | anthropic | ollama | mock
 *   DASHIN_AI_API_KEY, DASHIN_AI_MODEL, DASHIN_AI_BASE_URL
 *
 * complete(prompt) -> raw model text (expected to be JSON).
 */
const https = require("https")
const http = require("http")

function post(url, headers, body) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http
    const data = JSON.stringify(body)
    const u = new URL(url)
    const req = lib.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers }
      },
      res => {
        let out = ""
        res.on("data", c => (out += c))
        res.on("end", () => resolve(JSON.parse(out)))
      }
    )
    req.on("error", reject)
    req.write(data)
    req.end()
  })
}

function getProvider(env = process.env) {
  const provider = env.DASHIN_AI_PROVIDER || "mock"
  const key = env.DASHIN_AI_API_KEY
  const model = env.DASHIN_AI_MODEL

  return {
    name: provider,
    async complete(prompt) {
      switch (provider) {
        case "openai":
        case "ollama": {
          // OpenAI-compatible chat completions (Ollama exposes this too)
          const base =
            env.DASHIN_AI_BASE_URL ||
            (provider === "ollama"
              ? "http://localhost:11434/v1"
              : "https://api.openai.com/v1")
          const payload = {
            model: model || (provider === "ollama" ? "qwen2.5-coder" : "gpt-4o-mini"),
            messages: [{ role: "user", content: prompt }],
            temperature: 0
          }
          // retry on 429 (rate limit), honoring server back-off, up to 3x
          for (let attempt = 0; attempt < 3; attempt++) {
            const res = await post(
              `${base}/chat/completions`,
              key ? { Authorization: `Bearer ${key}` } : {},
              payload
            )
            const content =
              res.choices && res.choices[0] && res.choices[0].message.content
            if (content) return content
            const msg = res.error && res.error.message
            const wait = msg && msg.match(/try again in ([\d.]+)s/)
            if (res.error && /rate limit/i.test(msg || "")) {
              await new Promise(r => setTimeout(r, ((wait && +wait[1]) || 3) * 1000 + 250))
              continue
            }
            return ""
          }
          return ""
        }
        case "anthropic": {
          const res = await post(
            (env.DASHIN_AI_BASE_URL || "https://api.anthropic.com") +
              "/v1/messages",
            { "x-api-key": key, "anthropic-version": "2023-06-01" },
            {
              model: model || "claude-3-5-haiku-latest",
              max_tokens: 2048,
              messages: [{ role: "user", content: prompt }]
            }
          )
          return res.content[0].text
        }
        case "mock":
        default:
          // Spike-only: simulate a model. Honest about hallucination — it
          // emits a plausible-but-WRONG extra column to prove the validator.
          return env.__MOCK_RESPONSE || "{}"
      }
    }
  }
}

module.exports = { getProvider }

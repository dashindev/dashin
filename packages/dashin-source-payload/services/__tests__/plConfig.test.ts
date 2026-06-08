import { describe, it, expect, vi } from "vitest"

vi.mock("@dashin-dev/dashin", () => ({
  ENV: { MAIN_URL: "http://pl.test", AUTH_URL: "http://auth.test" },
  storedToken: async () => "tok"
}))

import { apiBase, apiPath, plHeaders } from "../plConfig"

describe("apiPath", () => {
  it("builds the collection endpoint with the /api segment", () => {
    expect(apiPath("posts")).toBe("/api/posts")
  })
  it("appends the id when provided", () => {
    expect(apiPath("posts", "42")).toBe("/api/posts/42")
  })
})

describe("apiBase", () => {
  it("leaves a bare origin unchanged", () => {
    expect(apiBase("https://x.com")).toBe("https://x.com")
  })
  it("strips a trailing /api (and /api/) so apiPath can't double it", () => {
    expect(apiBase("https://x.com/api")).toBe("https://x.com")
    expect(apiBase("https://x.com/api/")).toBe("https://x.com")
  })
  it("does not strip /api in the middle of the path", () => {
    expect(apiBase("https://x.com/api/v2")).toBe("https://x.com/api/v2")
  })
  it("prefers the explicit prefix, else falls back to MAIN_URL", () => {
    expect(apiBase("https://y.com/api")).toBe("https://y.com")
    expect(apiBase()).toBe("http://pl.test")
  })
})

describe("plHeaders", () => {
  it("sends the stored token as a Bearer header", async () => {
    expect(await plHeaders()).toEqual({ Authorization: "Bearer tok" })
  })
  it("merges extra headers", async () => {
    expect(await plHeaders({ "X-Test": "1" })).toEqual({
      Authorization: "Bearer tok",
      "X-Test": "1"
    })
  })
})

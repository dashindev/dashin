import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
let PATHS_WITHOUT_AUTH: string[] = []
vi.mock("@/utils", () => ({
  ENV: {
    get PATHS_WITHOUT_AUTH() {
      return PATHS_WITHOUT_AUTH
    },
    AUTH_URL: "http://auth.test"
  },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "tok"
}))

import authorization from "../authorization"

describe("authorization", () => {
  beforeEach(() => {
    request.mockReset()
    PATHS_WITHOUT_AUTH = []
    // jsdom default path
    window.history.pushState({}, "", "/blog/post")
  })

  it("bypasses auth for whitelisted paths (no request made)", async () => {
    PATHS_WITHOUT_AUTH = ["/blog"]
    const ok = await authorization({})
    expect(ok).toBe(true)
    expect(request).not.toHaveBeenCalled()
  })

  it("verifies via authResponseKey when the user resolves", async () => {
    request.mockResolvedValue({ id: "u1" })
    expect(await authorization({})).toBe(true)
    // hits the auth endpoint with Bearer token
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/auth/me")
    expect(opts.headers.Authorization).toBe("Bearer tok")
  })

  it("fails when the response lacks the key", async () => {
    request.mockResolvedValue({ error: "nope" })
    expect(await authorization({})).toBe(false)
  })

  it("honors a custom authResponseKey + url", async () => {
    request.mockResolvedValue({ uid: 7 })
    expect(await authorization({ authResponseKey: "uid", authRequestUrl: "/me" })).toBe(true)
    expect(request.mock.calls[0][0]).toBe("/me")
  })
})

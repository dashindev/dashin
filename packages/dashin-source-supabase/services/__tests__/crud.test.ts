import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
vi.mock("@dashin-dev/dashin", () => ({
  EditableCtrl: {},
  ENV: { MAIN_URL: "http://sb.test", AUTH_URL: "http://sb.test", SUPABASE_KEY: "anon" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "sess",
  notice: vi.fn()
}))

import addSer from "../addSer"
import updateSer from "../updateSer"
import deleteSer from "../deleteSer"

const t = (s: string) => s

describe("supabase CRUD services", () => {
  beforeEach(() => request.mockReset())

  it("add POSTs /rest/v1/{table} with apikey", async () => {
    request.mockResolvedValue([{ id: 1 }])
    await addSer({ t, SchemaName: "posts", newData: { name: "a" } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/rest/v1/posts")
    expect(opts.method).toBe("POST")
    expect(opts.headers.apikey).toBe("anon")
  })

  it("update PATCHes with ?id=eq.{id}", async () => {
    request.mockResolvedValue([{ id: 9 }])
    await updateSer({ t, SchemaName: "posts", newData: { name: "b" }, oldData: { id: 9 } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/rest/v1/posts")
    expect(opts.method).toBe("PATCH")
    expect(opts.params.id).toBe("eq.9")
  })

  it("delete DELETEs with ?id=eq.{id}", async () => {
    request.mockResolvedValue([])
    await deleteSer({ t, SchemaName: "posts", oldData: { id: 9 } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(opts.method).toBe("DELETE")
    expect(opts.params.id).toBe("eq.9")
  })
})

import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
vi.mock("@xbuilder/bunadmin", () => ({
  EditableCtrl: {},
  ENV: { MAIN_URL: "http://pl.test", AUTH_URL: "http://pl.test" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "tok",
  notice: vi.fn()
}))

import { addSer, updateSer, deleteSer } from "../crud"

const t = (s: string) => s

describe("payload CRUD services", () => {
  beforeEach(() => request.mockReset())

  it("add POSTs to /api/{collection}", async () => {
    request.mockResolvedValue({ doc: { id: 1 } })
    await addSer({ t, SchemaName: "posts", newData: { name: "a" } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/api/posts")
    expect(opts.method).toBe("POST")
  })

  it("update PATCHes /api/{collection}/{id}", async () => {
    request.mockResolvedValue({ doc: { id: 9 } })
    await updateSer({ t, SchemaName: "posts", newData: { name: "b" }, oldData: { id: 9 } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/api/posts/9")
    expect(opts.method).toBe("PATCH")
  })

  it("delete DELETEs /api/{collection}/{id}", async () => {
    request.mockResolvedValue({})
    await deleteSer({ t, SchemaName: "posts", oldData: { id: 9 } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/api/posts/9")
    expect(opts.method).toBe("DELETE")
  })
})

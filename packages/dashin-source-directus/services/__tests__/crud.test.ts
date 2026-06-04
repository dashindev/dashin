import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
vi.mock("@dashin-dev/dashin", () => ({
  EditableCtrl: {},
  ENV: { MAIN_URL: "http://dx.test", AUTH_URL: "http://dx.test" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "tok",
  notice: vi.fn()
}))

import { addSer, updateSer, deleteSer } from "../crud"

const t = (s: string) => s

describe("directus CRUD services", () => {
  beforeEach(() => request.mockReset())

  it("add POSTs to /items/{collection}", async () => {
    request.mockResolvedValue({ data: { id: 1 } })
    await addSer({ t, SchemaName: "posts", newData: { name: "a" } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/items/posts")
    expect(opts.method).toBe("POST")
    expect(opts.data).toEqual({ name: "a" })
  })

  it("update PATCHes /items/{collection}/{id}", async () => {
    request.mockResolvedValue({ data: { id: 9 } })
    await updateSer({ t, SchemaName: "posts", newData: { name: "b" }, oldData: { id: 9 } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/items/posts/9")
    expect(opts.method).toBe("PATCH")
  })

  it("delete DELETEs /items/{collection}/{id}", async () => {
    request.mockResolvedValue({})
    await deleteSer({ t, SchemaName: "posts", oldData: { id: 9 } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/items/posts/9")
    expect(opts.method).toBe("DELETE")
  })
})

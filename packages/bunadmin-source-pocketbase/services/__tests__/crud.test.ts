import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
vi.mock("@xbuilder/bunadmin", () => ({
  EditableCtrl: {},
  ENV: { AUTH_URL: "http://pb.test" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "tok",
  notice: vi.fn()
}))

import addSer from "../addSer"
import updateSer from "../updateSer"
import deleteSer from "../deleteSer"

const t = (s: string) => s

describe("pocketbase CRUD services", () => {
  beforeEach(() => request.mockReset())

  it("add POSTs to the collection with the new row", async () => {
    request.mockResolvedValue({ id: "1" })
    await addSer({ t, SchemaName: "posts", newData: { name: "a" } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/api/collections/posts/records")
    expect(opts.method).toBe("POST")
    expect(opts.data).toEqual({ name: "a" })
  })

  it("update PATCHes /records/{id}", async () => {
    request.mockResolvedValue({ id: "9" })
    await updateSer({ t, SchemaName: "posts", newData: { name: "b" }, oldData: { id: "9" } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/api/collections/posts/records/9")
    expect(opts.method).toBe("PATCH")
    expect(opts.data).toEqual({ name: "b" })
  })

  it("delete DELETEs /records/{id}", async () => {
    request.mockResolvedValue({})
    await deleteSer({ t, SchemaName: "posts", oldData: { id: "9" } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/api/collections/posts/records/9")
    expect(opts.method).toBe("DELETE")
  })
})

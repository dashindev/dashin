import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
vi.mock("@xbuilder/bunadmin", () => ({
  EditableCtrl: {},
  ENV: { AUTH_URL: "http://aw.test", APPWRITE_PROJECT: "p1", APPWRITE_DATABASE: "db1" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "jwt",
  notice: vi.fn()
}))

import addSer from "../addSer"
import updateSer from "../updateSer"
import deleteSer from "../deleteSer"

const t = (s: string) => s
const base = "/v1/databases/db1/collections/posts/documents"

describe("appwrite CRUD services", () => {
  beforeEach(() => request.mockReset())

  it("add POSTs documents with { documentId, data } + project header", async () => {
    request.mockResolvedValue({ $id: "1" })
    await addSer({ t, SchemaName: "posts", newData: { name: "a" } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe(base)
    expect(opts.method).toBe("POST")
    expect(opts.data).toEqual({ documentId: "unique()", data: { name: "a" } })
    expect(opts.headers["X-Appwrite-Project"]).toBe("p1")
  })

  it("update PATCHes /{ $id } with { data }", async () => {
    request.mockResolvedValue({ $id: "9" })
    await updateSer({ t, SchemaName: "posts", newData: { name: "b" }, oldData: { $id: "9" } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe(`${base}/9`)
    expect(opts.method).toBe("PATCH")
    expect(opts.data).toEqual({ data: { name: "b" } })
  })

  it("delete DELETEs /{ $id }", async () => {
    request.mockResolvedValue({})
    await deleteSer({ t, SchemaName: "posts", oldData: { $id: "9" } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe(`${base}/9`)
    expect(opts.method).toBe("DELETE")
  })
})

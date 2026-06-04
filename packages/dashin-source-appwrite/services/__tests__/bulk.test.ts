import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
vi.mock("@dashin-dev/dashin", () => ({
  ENV: { AUTH_URL: "http://aw.test", APPWRITE_PROJECT: "p1", APPWRITE_DATABASE: "db1" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "jwt",
  notice: vi.fn()
}))

import bulkDeleteSer from "../bulkDeleteSer"
import bulkUpdateSer from "../bulkUpdateSer"

const t = (s: string) => s
const base = "/v1/databases/db1/collections/posts/documents"

describe("appwrite bulk services", () => {
  beforeEach(() => request.mockReset().mockResolvedValue({}))

  it("bulkDelete DELETEs each doc by $id", async () => {
    await bulkDeleteSer({ t, SchemaName: "posts", primaryKey: "$id", data: [{ $id: "1" }, { $id: "2" }] } as any)
    expect(request).toHaveBeenCalledTimes(2)
    expect(request.mock.calls[1][0]).toBe(`${base}/2`)
    expect(request.mock.calls[0][1].method).toBe("DELETE")
  })

  it("bulkUpdate PATCHes each change", async () => {
    await bulkUpdateSer({ t, SchemaName: "posts", changes: { a: { oldData: { $id: "9" }, newData: { n: 1 } } } } as any)
    expect(request.mock.calls[0][0]).toBe(`${base}/9`)
    expect(request.mock.calls[0][1].method).toBe("PATCH")
  })
})

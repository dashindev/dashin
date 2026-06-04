import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
vi.mock("@dashin-dev/dashin", () => ({
  ENV: { AUTH_URL: "http://pb.test" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "tok",
  notice: vi.fn()
}))

import bulkDeleteSer from "../bulkDeleteSer"
import bulkUpdateSer from "../bulkUpdateSer"

const t = (s: string) => s

describe("pocketbase bulk services", () => {
  beforeEach(() => request.mockReset().mockResolvedValue({}))

  it("bulkDelete DELETEs each row by id", async () => {
    await bulkDeleteSer({ t, SchemaName: "posts", data: [{ id: "1" }, { id: "2" }] } as any)
    expect(request).toHaveBeenCalledTimes(2)
    expect(request.mock.calls[0][0]).toBe("/api/collections/posts/records/1")
    expect(request.mock.calls[0][1].method).toBe("DELETE")
  })

  it("bulkUpdate PATCHes each change by id", async () => {
    await bulkUpdateSer({
      t, SchemaName: "posts",
      changes: { a: { oldData: { id: "9" }, newData: { name: "x" } } }
    } as any)
    expect(request.mock.calls[0][0]).toBe("/api/collections/posts/records/9")
    expect(request.mock.calls[0][1].method).toBe("PATCH")
  })
})

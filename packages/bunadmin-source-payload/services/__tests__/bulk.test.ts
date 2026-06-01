import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
vi.mock("@xbuilder/bunadmin", () => ({
  ENV: { MAIN_URL: "http://pl.test", AUTH_URL: "http://pl.test" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "tok",
  notice: vi.fn()
}))

import { bulkDeleteSer, bulkUpdateSer } from "../bulk"

const t = (s: string) => s

describe("payload bulk services", () => {
  beforeEach(() => request.mockReset().mockResolvedValue({}))

  it("bulkDelete DELETEs /api/{c}/{id} per row", async () => {
    await bulkDeleteSer({ t, SchemaName: "posts", data: [{ id: 1 }, { id: 2 }] } as any)
    expect(request).toHaveBeenCalledTimes(2)
    expect(request.mock.calls[1][0]).toBe("/api/posts/2")
    expect(request.mock.calls[0][1].method).toBe("DELETE")
  })

  it("bulkUpdate PATCHes /api/{c}/{id} per change", async () => {
    await bulkUpdateSer({ t, SchemaName: "posts", changes: { a: { oldData: { id: 9 }, newData: { n: 1 } } } } as any)
    expect(request.mock.calls[0][0]).toBe("/api/posts/9")
    expect(request.mock.calls[0][1].method).toBe("PATCH")
  })
})

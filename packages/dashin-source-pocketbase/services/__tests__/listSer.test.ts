import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the dashin runtime deps the service imports.
const request = vi.fn()
vi.mock("@dashin-dev/dashin", () => ({
  ENV: { AUTH_URL: "http://pb.test" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "tok"
}))

import listSer from "../listSer"

const query = {
  search: "",
  filters: [{ column: { field: "status" }, operator: "=", value: "Published" }],
  orderBy: { field: "views" },
  orderDirection: "desc",
  page: 1,
  pageSize: 10
}

describe("pocketbase listSer", () => {
  beforeEach(() => request.mockReset())

  it("builds the request (path, page+1, filter, sort, token) and parses items/totalItems", async () => {
    request.mockResolvedValue({ items: [{ id: "1", name: "a" }], totalItems: 42 })
    const res = await listSer({ tableQuery: query as any, path: "posts" })

    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/api/collections/posts/records")
    expect(opts.params.page).toBe(2) // 0-based page 1 -> PB page 2
    expect(opts.params.perPage).toBe(10)
    expect(opts.params.sort).toBe("-views")
    expect(opts.params.filter).toBe("status='Published'")
    expect(opts.headers.Authorization).toBe("tok")
    expect(res).toEqual({ data: [{ id: "1", name: "a" }], totalCount: 42, errors: undefined })
  })

  it("returns empty + error on a 4xx body", async () => {
    request.mockResolvedValue({ code: 400, message: "bad" })
    const res = await listSer({ tableQuery: { ...query, filters: [] } as any, path: "posts" })
    expect(res.data).toEqual([])
    expect(res.errors).toBeTruthy()
  })
})

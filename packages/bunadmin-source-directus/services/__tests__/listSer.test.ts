import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
vi.mock("@xbuilder/bunadmin", () => ({
  ENV: { MAIN_URL: "http://dx.test", AUTH_URL: "http://dx.test" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "tok"
}))

import listSer from "../listSer"

const query = {
  search: "hi",
  filters: [{ column: { field: "status" }, operator: "=", value: "Published" }],
  orderBy: { field: "views" },
  orderDirection: "desc",
  page: 0,
  pageSize: 20
}

describe("directus listSer", () => {
  beforeEach(() => request.mockReset())

  it("hits /items/{collection} with filter[..] + meta=filter_count, parses data/meta", async () => {
    request.mockResolvedValue({ data: [{ id: 1 }], meta: { filter_count: 5 } })
    const res = await listSer({ tableQuery: query as any, path: "posts" })

    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/items/posts")
    expect(opts.params["filter[status][_eq]"]).toBe("Published")
    expect(opts.params.search).toBe("hi")
    expect(opts.params.meta).toBe("filter_count")
    expect(opts.headers.Authorization).toContain("Bearer")
    expect(res).toEqual({ data: [{ id: 1 }], totalCount: 5, errors: undefined })
  })
})

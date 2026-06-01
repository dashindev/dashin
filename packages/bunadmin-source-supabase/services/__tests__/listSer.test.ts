import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
vi.mock("@xbuilder/bunadmin", () => ({
  ENV: { MAIN_URL: "http://sb.test", AUTH_URL: "http://sb.test", SUPABASE_KEY: "anon" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "sess"
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

describe("supabase listSer", () => {
  beforeEach(() => request.mockReset())

  it("hits /rest/v1/{table} with PostgREST params + apikey/bearer, parses array rows", async () => {
    request.mockResolvedValue([{ id: 1 }, { id: 2 }])
    const res = await listSer({ tableQuery: query as any, path: "posts" })

    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/rest/v1/posts")
    expect(opts.params.status).toBe("eq.Published")
    expect(opts.params.order).toBe("views.desc")
    expect(opts.params.limit).toBe(10)
    expect(opts.params.offset).toBe(10)
    expect(opts.headers.apikey).toBe("anon")
    expect(opts.headers.Authorization).toContain("Bearer")
    expect(res.data).toEqual([{ id: 1 }, { id: 2 }])
    expect(res.totalCount).toBe(2)
  })
})

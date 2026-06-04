import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
vi.mock("@dashin-dev/dashin", () => ({
  ENV: { MAIN_URL: "http://pl.test", AUTH_URL: "http://pl.test" },
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

describe("payload listSer", () => {
  beforeEach(() => request.mockReset())

  it("hits /api/{collection} with where[..] + 1-based page, parses docs/totalDocs", async () => {
    request.mockResolvedValue({ docs: [{ id: 1 }], totalDocs: 9 })
    const res = await listSer({ tableQuery: query as any, path: "posts" })

    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/api/posts")
    expect(opts.params["where[status][equals]"]).toBe("Published")
    expect(opts.params.sort).toBe("-views")
    expect(opts.params.page).toBe(2) // 0-based 1 -> Payload 2
    expect(opts.headers.Authorization).toContain("Bearer")
    expect(res).toEqual({ data: [{ id: 1 }], totalCount: 9, errors: undefined })
  })
})

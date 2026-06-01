import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
vi.mock("@xbuilder/bunadmin", () => ({
  ENV: { AUTH_URL: "http://aw.test", APPWRITE_PROJECT: "proj1", APPWRITE_DATABASE: "db1" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "jwt"
}))

import listSer from "../listSer"

const query = {
  search: "",
  filters: [{ column: { field: "status" }, operator: "=", value: "Published" }],
  orderBy: { field: "views" },
  orderDirection: "desc",
  page: 0,
  pageSize: 20
}

describe("appwrite listSer", () => {
  beforeEach(() => request.mockReset())

  it("hits the documents endpoint with queries[] + project/JWT headers, parses documents/total", async () => {
    request.mockResolvedValue({ documents: [{ $id: "1" }], total: 7 })
    const res = await listSer({ tableQuery: query as any, path: "posts" })

    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/v1/databases/db1/collections/posts/documents")
    expect(Array.isArray(opts.params["queries[]"])).toBe(true)
    expect(opts.params["queries[]"].some((q: string) => q.includes('"method":"equal"'))).toBe(true)
    expect(opts.headers["X-Appwrite-Project"]).toBe("proj1")
    expect(opts.headers["X-Appwrite-JWT"]).toBe("jwt")
    expect(res).toEqual({ data: [{ $id: "1" }], totalCount: 7, errors: undefined })
  })
})

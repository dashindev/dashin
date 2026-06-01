import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the libSQL client so listSer is tested without a network.
const execute = vi.fn()
vi.mock("../client", () => ({ execute: (...a: any[]) => execute(...a) }))
// listSer also imports nothing else from @dashin-dev/dashin directly, but sql.ts does not.

import listSer from "../listSer"

const query = {
  search: "",
  filters: [{ column: { field: "status" }, operator: "=", value: "Published" }],
  orderBy: { field: "views" },
  orderDirection: "desc",
  page: 0,
  pageSize: 20
}

describe("turso listSer", () => {
  beforeEach(() => execute.mockReset())

  it("runs COUNT then SELECT, returns rows + COUNT total", async () => {
    execute
      .mockResolvedValueOnce({ rows: [{ c: 3 }], affectedRows: 0 }) // count
      .mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }, { id: 3 }], affectedRows: 0 }) // select
    const res = await listSer({ tableQuery: query as any, path: "posts" })

    // first call = COUNT stmt, second = SELECT stmt
    expect(execute.mock.calls[0][0].sql).toContain("COUNT(*)")
    expect(execute.mock.calls[1][0].sql).toContain("SELECT * FROM")
    expect(execute.mock.calls[1][0].sql).toContain("LIMIT ? OFFSET ?")
    expect(res.data.length).toBe(3)
    expect(res.totalCount).toBe(3)
  })

  it("surfaces an execute error", async () => {
    execute.mockResolvedValue({ rows: [], affectedRows: 0, error: { message: "boom" } })
    const res = await listSer({ tableQuery: { ...query, filters: [] } as any, path: "posts" })
    expect(res.errors).toBeTruthy()
    expect(res.totalCount).toBe(0)
  })
})

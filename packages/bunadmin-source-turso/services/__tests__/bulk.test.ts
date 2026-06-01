import { describe, it, expect, vi, beforeEach } from "vitest"

const execute = vi.fn()
vi.mock("../client", () => ({ execute: (...a: any[]) => execute(...a) }))
vi.mock("@xbuilder/bunadmin", () => ({ notice: vi.fn() }))

import { bulkDeleteSer, bulkUpdateSer } from "../bulk"

const t = (s: string) => s

describe("turso bulk services", () => {
  beforeEach(() => execute.mockReset().mockResolvedValue({ rows: [], affectedRows: 1 }))

  it("bulkDelete issues one DELETE per row", async () => {
    await bulkDeleteSer({ t, SchemaName: "posts", data: [{ id: 1 }, { id: 2 }] } as any)
    expect(execute).toHaveBeenCalledTimes(2)
    expect(execute.mock.calls[0][0].sql).toContain('DELETE FROM "posts"')
    expect(execute.mock.calls[1][0].args).toEqual([2])
  })

  it("bulkUpdate issues one UPDATE per change", async () => {
    await bulkUpdateSer({
      t, SchemaName: "posts",
      changes: { a: { oldData: { id: 1 }, newData: { name: "x" } } }
    } as any)
    expect(execute.mock.calls[0][0].sql).toContain('UPDATE "posts"')
    expect(execute.mock.calls[0][0].args).toEqual(["x", 1])
  })
})

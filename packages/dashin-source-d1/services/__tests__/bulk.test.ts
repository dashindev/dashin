import { describe, it, expect, vi, beforeEach } from "vitest"

const execute = vi.fn()
const notice = vi.fn()
vi.mock("../client", () => ({ execute: (...a: any[]) => execute(...a) }))
vi.mock("@dashin-dev/dashin", () => ({ notice: (...a: any[]) => notice(...a) }))

import { bulkDeleteSer, bulkUpdateSer } from "../bulk"

const t = (s: string) => s
const captureError = async (promise: Promise<any>) => {
  try {
    await promise
  } catch (error) {
    return error as any
  }
  throw new Error("Expected promise to reject")
}

describe("d1 bulk services", () => {
  beforeEach(() => {
    execute.mockReset().mockResolvedValue({ rows: [], affectedRows: 1 })
    notice.mockReset()
  })

  it("bulkDelete issues one DELETE per row on all-success", async () => {
    const result = await bulkDeleteSer({ t, SchemaName: "posts", data: [{ id: 1 }, { id: 2 }] } as any)
    expect(result).toHaveLength(2)
    expect(execute).toHaveBeenCalledTimes(2)
    expect(execute.mock.calls[0][0].sql).toContain('DELETE FROM "posts"')
    expect(execute.mock.calls[1][0].args).toEqual([2])
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "success" }))
  })

  it("bulkDelete rejects on partial failure and reports count", async () => {
    execute
      .mockResolvedValueOnce({ rows: [], affectedRows: 1 })
      .mockResolvedValueOnce({ rows: [], affectedRows: 0, error: "Row locked" })

    const error = await captureError(
      bulkDeleteSer({ t, SchemaName: "posts", data: [{ id: 1 }, { id: 2 }] } as any)
    )

    expect(error.message).toContain("1 of 2 bulk delete operations failed")
    expect(error).toMatchObject({ okCount: 1, failCount: 1 })
    expect(error.resList).toHaveLength(2)
    expect(error.resList[1]).toMatchObject({ error: "Row locked" })
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "warning" }))
  })

  it("bulkDelete rejects on all-failure", async () => {
    execute
      .mockResolvedValueOnce({ rows: [], affectedRows: 0, error: "Database offline" })
      .mockResolvedValueOnce({ rows: [], affectedRows: 0, error: "Database offline" })

    const error = await captureError(
      bulkDeleteSer({ t, SchemaName: "posts", data: [{ id: 1 }, { id: 2 }] } as any)
    )

    expect(error.message).toContain("All 2 bulk delete operations failed")
    expect(error).toMatchObject({ okCount: 0, failCount: 2 })
    expect(error.resList).toHaveLength(2)
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "error" }))
  })

  it("bulkDelete records a transport throw and continues the remaining rows", async () => {
    execute
      .mockRejectedValueOnce(new Error("Network unavailable"))
      .mockResolvedValueOnce({ rows: [], affectedRows: 1 })

    const error = await captureError(
      bulkDeleteSer({ t, SchemaName: "posts", data: [{ id: 1 }, { id: 2 }] } as any)
    )

    expect(execute).toHaveBeenCalledTimes(2)
    expect(error).toMatchObject({ okCount: 1, failCount: 1 })
    expect(error.resList).toHaveLength(2)
    expect(error.resList[0]).toMatchObject({ error: "Network unavailable", item: { id: 1 } })
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "warning" }))
  })

  it("bulkUpdate issues one UPDATE per change on all-success", async () => {
    const result = await bulkUpdateSer({
      t, SchemaName: "posts",
      changes: { a: { oldData: { id: 1 }, newData: { name: "x" } } }
    } as any)
    expect(result).toHaveLength(1)
    expect(execute.mock.calls[0][0].sql).toContain('UPDATE "posts"')
    expect(execute.mock.calls[0][0].args).toEqual(["x", 1])
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "success" }))
  })

  it("bulkUpdate rejects on partial failure", async () => {
    execute
      .mockResolvedValueOnce({ rows: [], affectedRows: 1 })
      .mockResolvedValueOnce({ rows: [], affectedRows: 0, error: "Unique violation" })

    const error = await captureError(
      bulkUpdateSer({
        t, SchemaName: "posts",
        changes: {
          a: { oldData: { id: 1 }, newData: { name: "x" } },
          b: { oldData: { id: 2 }, newData: { name: "duplicate" } }
        }
      } as any)
    )

    expect(error.message).toContain("1 of 2 bulk update operations failed")
    expect(error).toMatchObject({ okCount: 1, failCount: 1 })
    expect(error.resList).toHaveLength(2)
    expect(error.resList[1]).toMatchObject({ error: "Unique violation" })
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "warning" }))
  })

  it("bulkUpdate rejects on all-failure with an error notice", async () => {
    execute
      .mockResolvedValueOnce({ rows: [], affectedRows: 0, error: "Read only" })
      .mockResolvedValueOnce({ rows: [], affectedRows: 0, error: "Read only" })

    const error = await captureError(bulkUpdateSer({
      t, SchemaName: "posts",
      changes: {
        a: { oldData: { id: 1 }, newData: { name: "x" } },
        b: { oldData: { id: 2 }, newData: { name: "y" } }
      }
    } as any))

    expect(error.message).toContain("All 2 bulk update operations failed")
    expect(error).toMatchObject({ okCount: 0, failCount: 2 })
    expect(error.resList).toHaveLength(2)
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "error" }))
  })

  it("bulkUpdate records a transport throw and continues the remaining changes", async () => {
    execute
      .mockRejectedValueOnce(new Error("Connection reset"))
      .mockResolvedValueOnce({ rows: [], affectedRows: 1 })

    const error = await captureError(bulkUpdateSer({
      t, SchemaName: "posts",
      changes: {
        a: { oldData: { id: 1 }, newData: { name: "x" } },
        b: { oldData: { id: 2 }, newData: { name: "y" } }
      }
    } as any))

    expect(execute).toHaveBeenCalledTimes(2)
    expect(error).toMatchObject({ okCount: 1, failCount: 1 })
    expect(error.resList).toHaveLength(2)
    expect(error.resList[0]).toMatchObject({
      error: "Connection reset",
      oldData: { id: 1 },
      newData: { name: "x" }
    })
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "warning" }))
  })
})

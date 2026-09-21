import { describe, it, expect, vi, beforeEach } from "vitest"

const execute = vi.fn()
const notice = vi.fn()
vi.mock("../client", () => ({ execute: (...a: any[]) => execute(...a) }))
vi.mock("@dashin-dev/dashin", () => ({
  EditableCtrl: {},
  notice: (...a: any[]) => notice(...a)
}))

import { addSer, updateSer, deleteSer } from "../crud"

const t = (s: string) => s

describe("d1 CRUD services", () => {
  beforeEach(() => {
    execute.mockReset().mockResolvedValue({ rows: [], affectedRows: 1 })
    notice.mockReset()
  })

  it("add builds INSERT", async () => {
    await addSer({ t, SchemaName: "posts", newData: { name: "a", views: 3 } } as any)
    const stmt = execute.mock.calls[0][0]
    expect(stmt.sql).toBe('INSERT INTO "posts" ("name", "views") VALUES (?, ?)')
    expect(stmt.args).toEqual(["a", 3])
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "success" }))
  })

  it("add throws and notifies warning when execute returns error", async () => {
    execute.mockResolvedValueOnce({ rows: [], affectedRows: 0, error: "UNIQUE constraint failed: posts.name" })

    await expect(
      addSer({ t, SchemaName: "posts", newData: { name: "duplicate" } } as any)
    ).rejects.toThrow("UNIQUE constraint failed: posts.name")

    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "warning" }))
    // Success notice must NEVER be called on error
    const successCalls = notice.mock.calls.filter((c: any[]) => c[0]?.severity === "success")
    expect(successCalls).toHaveLength(0)
  })

  it("update builds UPDATE ... WHERE id=?", async () => {
    await updateSer({ t, SchemaName: "posts", newData: { name: "b" }, oldData: { id: 9 } } as any)
    const stmt = execute.mock.calls[0][0]
    expect(stmt.sql).toBe('UPDATE "posts" SET "name" = ? WHERE "id" = ?')
    expect(stmt.args).toEqual(["b", 9])
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "success" }))
  })

  it("update throws and notifies warning when execute returns error", async () => {
    execute.mockResolvedValueOnce({ rows: [], affectedRows: 0, error: "table is full" })

    await expect(
      updateSer({ t, SchemaName: "posts", newData: { name: "b" }, oldData: { id: 9 } } as any)
    ).rejects.toThrow("table is full")

    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "warning" }))
    const successCalls = notice.mock.calls.filter((c: any[]) => c[0]?.severity === "success")
    expect(successCalls).toHaveLength(0)
  })

  it("delete builds DELETE ... WHERE id=?", async () => {
    await deleteSer({ t, SchemaName: "posts", oldData: { id: 9 } } as any)
    const stmt = execute.mock.calls[0][0]
    expect(stmt.sql).toBe('DELETE FROM "posts" WHERE "id" = ?')
    expect(stmt.args).toEqual([9])
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "success" }))
  })

  it("delete throws and notifies warning when execute returns error", async () => {
    execute.mockResolvedValueOnce({ rows: [], affectedRows: 0, error: "Foreign key constraint failed" })

    await expect(
      deleteSer({ t, SchemaName: "posts", oldData: { id: 9 } } as any)
    ).rejects.toThrow("Foreign key constraint failed")

    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "warning" }))
    const successCalls = notice.mock.calls.filter((c: any[]) => c[0]?.severity === "success")
    expect(successCalls).toHaveLength(0)
  })
})

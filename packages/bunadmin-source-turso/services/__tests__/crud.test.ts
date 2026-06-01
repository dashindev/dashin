import { describe, it, expect, vi, beforeEach } from "vitest"

const execute = vi.fn()
vi.mock("../client", () => ({ execute: (...a: any[]) => execute(...a) }))
vi.mock("@dashin-dev/dashin", () => ({ EditableCtrl: {}, notice: vi.fn() }))

import { addSer, updateSer, deleteSer } from "../crud"

const t = (s: string) => s

describe("turso CRUD services", () => {
  beforeEach(() => execute.mockReset().mockResolvedValue({ rows: [], affectedRows: 1 }))

  it("add builds INSERT", async () => {
    await addSer({ t, SchemaName: "posts", newData: { name: "a", views: 3 } } as any)
    const stmt = execute.mock.calls[0][0]
    expect(stmt.sql).toBe('INSERT INTO "posts" ("name", "views") VALUES (?, ?)')
    expect(stmt.args).toEqual(["a", 3])
  })

  it("update builds UPDATE ... WHERE id=?", async () => {
    await updateSer({ t, SchemaName: "posts", newData: { name: "b" }, oldData: { id: 9 } } as any)
    const stmt = execute.mock.calls[0][0]
    expect(stmt.sql).toBe('UPDATE "posts" SET "name" = ? WHERE "id" = ?')
    expect(stmt.args).toEqual(["b", 9])
  })

  it("delete builds DELETE ... WHERE id=?", async () => {
    await deleteSer({ t, SchemaName: "posts", oldData: { id: 9 } } as any)
    const stmt = execute.mock.calls[0][0]
    expect(stmt.sql).toBe('DELETE FROM "posts" WHERE "id" = ?')
    expect(stmt.args).toEqual([9])
  })
})

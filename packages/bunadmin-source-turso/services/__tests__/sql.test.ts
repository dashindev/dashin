import { describe, it, expect } from "vitest"
import {
  ident,
  buildWhere,
  buildSelect,
  buildCount,
  buildInsert,
  buildUpdate,
  buildDelete
} from "../sql"

const f = (field: string, operator: string, value: any) =>
  ({ column: { field }, operator, value } as any)

describe("ident (injection guard)", () => {
  it("quotes valid identifiers", () => {
    expect(ident("status")).toBe('"status"')
  })
  it("rejects unsafe identifiers", () => {
    expect(() => ident("a; DROP TABLE users")).toThrow()
    expect(() => ident('a" OR 1=1')).toThrow()
  })
})

describe("buildWhere", () => {
  it("binds values as params, never interpolates", () => {
    const { clause, args } = buildWhere([f("status", "=", "Published")])
    expect(clause).toBe(' WHERE "status" = ?')
    expect(args).toEqual(["Published"])
  })
  it("maps contains -> LIKE %v% and not-contains -> NOT LIKE", () => {
    expect(buildWhere([f("name", "_cs=", "ab")]).args).toEqual(["%ab%"])
    expect(buildWhere([f("name", "_ncs=", "ab")]).clause).toContain("NOT LIKE")
  })
  it("appends search on the search field", () => {
    const { clause, args } = buildWhere([], "hi", "name")
    expect(clause).toBe(' WHERE "name" LIKE ?')
    expect(args).toEqual(["%hi%"])
  })
  it("skips empty values", () => {
    expect(buildWhere([f("a", "=", "")]).clause).toBe("")
  })
})

describe("buildSelect / buildCount", () => {
  const q = {
    search: "",
    filters: [f("status", "=", "Published")],
    orderBy: { field: "views" },
    orderDirection: "desc",
    page: 2,
    pageSize: 10
  }
  it("select adds ORDER BY + LIMIT/OFFSET as params", () => {
    const s = buildSelect("posts", q)
    expect(s.sql).toBe(
      'SELECT * FROM "posts" WHERE "status" = ? ORDER BY "views" DESC LIMIT ? OFFSET ?'
    )
    expect(s.args).toEqual(["Published", 10, 20])
  })
  it("count uses same filters, no limit", () => {
    const c = buildCount("posts", q)
    expect(c.sql).toBe('SELECT COUNT(*) AS c FROM "posts" WHERE "status" = ?')
    expect(c.args).toEqual(["Published"])
  })
})

describe("insert / update / delete", () => {
  it("insert binds all columns", () => {
    const s = buildInsert("posts", { name: "x", views: 3 })
    expect(s.sql).toBe('INSERT INTO "posts" ("name", "views") VALUES (?, ?)')
    expect(s.args).toEqual(["x", 3])
  })
  it("update excludes pk from SET, binds pk last", () => {
    const s = buildUpdate("posts", { id: 9, name: "y" }, "id", 9)
    expect(s.sql).toBe('UPDATE "posts" SET "name" = ? WHERE "id" = ?')
    expect(s.args).toEqual(["y", 9])
  })
  it("delete by pk", () => {
    const s = buildDelete("posts", "id", 9)
    expect(s.sql).toBe('DELETE FROM "posts" WHERE "id" = ?')
    expect(s.args).toEqual([9])
  })
})

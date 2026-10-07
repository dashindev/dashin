import { describe, it, expect, vi } from "vitest"

const prefix = process.env.DASHIN_D1_TEST_URL || ""
if (!prefix || new URL(prefix).hostname !== "127.0.0.1") throw new Error("Run via d1-local-smoke.mjs; a dedicated loopback gateway is required")
// Only authentication/notification boundaries are substituted. Controllers,
// SQL, execute, request middleware, fetch, HTTP and SQLite are real.
vi.mock("@dashin-dev/dashin", async () => ({
  ...(await import("../../packages/dashin/src/utils/scripts/bulkMutation")),
  request: (await import("../../packages/dashin/src/utils/scripts/request")).default,
  ENV: { MAIN_URL: process.env.DASHIN_D1_TEST_URL }, storedToken: async () => "",
  notice: async () => {}
}))
import dataCtrl from "../../packages/dashin-source-d1/controllers/dataCtrl"
import { bulkUpdateSer } from "../../packages/dashin-source-d1/services/bulk"
import { execute } from "../../packages/dashin-source-d1/services/client"

const query = { page: 0, pageSize: 2, filters: [], search: "" } as any
describe("D1 adapter through real HTTP + local workerd/SQLite", () => {
  it("loads COUNT and SELECT with consistent pagination", async () => {
    const result = await dataCtrl({ path: "categories", prefix, tableQuery: query })
    expect(result.data).toHaveLength(2); expect(result.totalCount).toBe(8)
  })
  it("resolves a genuine empty filtered result", async () => {
    const result = await dataCtrl({ path: "categories", prefix, tableQuery: { ...query, search: "synthetic-not-present" } })
    expect(result).toEqual({ page: 0, data: [], totalCount: 0 })
  })
  it("rejects the gateway guard at COUNT, not an empty list", async () => {
    await expect(dataCtrl({ path: "not_allowed_fixture", prefix, tableQuery: query })).rejects.toThrow(/table/i)
  })
  it("rejects a real SELECT SQL error after a valid COUNT", async () => {
    // SQLite's double-quoted missing names can be string literals, not errors.
    // A fractional LIMIT is a deterministic SQL error after valid COUNT.
    await expect(dataCtrl({ path: "categories", prefix, tableQuery: { ...query, pageSize: 1.5 } })).rejects.toThrow(/datatype mismatch/i)
  })
  it("propagates an already-aborted signal to the real network boundary", async () => {
    const controller = new AbortController(); controller.abort()
    await expect(dataCtrl({ path: "categories", prefix, tableQuery: { ...query, signal: controller.signal } })).rejects.toThrow()
  })
  it("preserves partial bulk failure and retries only the failed nonstandard ID", async () => {
    const changes = {
      0: { oldData: { slug: "electronics" }, newData: { name: "Synthetic updated" } },
      1: { oldData: { slug: "books" }, newData: { missing_fixture_column: "reject me" } }
    }
    let failure: any
    try { await bulkUpdateSer({ t: (value: string) => value, SchemaName: "categories", primaryKey: "slug", changes } as any) } catch (error) { failure = error }
    expect(failure).toMatchObject({ okCount: 1, failCount: 1, outcomes: [{ id: "electronics", outcome: "succeeded" }, { id: "books", outcome: "failed" }] })
    const after = await execute({ sql: 'SELECT * FROM "categories" WHERE "slug" = ? LIMIT 1', args: ["electronics"] }, prefix)
    expect(after.rows[0].name).toBe("Synthetic updated")
    const retry = await bulkUpdateSer({ t: (value: string) => value, SchemaName: "categories", primaryKey: "slug", changes: { 1: { oldData: { slug: failure.outcomes[1].id }, newData: { name: "Synthetic retry" } } } } as any)
    expect(retry).toHaveLength(1)
    const retried = await execute({ sql: 'SELECT * FROM "categories" WHERE "slug" = ? LIMIT 1', args: ["books"] }, prefix)
    expect(retried.rows[0].name).toBe("Synthetic retry")
  })
})

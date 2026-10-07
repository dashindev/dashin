import { beforeAll, describe, it, expect, vi } from "vitest"
const prefix = process.env.DASHIN_PAYLOAD_TEST_URL || ""
if (!prefix || new URL(prefix).hostname !== "127.0.0.1") throw new Error("Run via payload3-local-smoke.mjs; a dedicated loopback backend is required")
vi.mock("@dashin-dev/dashin", async () => ({
  ...(await import("../../packages/dashin/src/utils/scripts/bulkMutation")),
  request: (await import("../../packages/dashin/src/utils/scripts/request")).default,
  ENV: { MAIN_URL: process.env.DASHIN_PAYLOAD_TEST_URL }, storedToken: async () => "", notice: async () => {}
}))
import dataCtrl from "../../packages/dashin-source-payload/controllers/dataCtrl"
import { bulkUpdateSer } from "../../packages/dashin-source-payload/services/bulk"
const query = { page: 0, pageSize: 2, filters: [], search: "" } as any
const docs: any[] = []
const getHealth = async () => (await fetch(`${prefix}/fixture/health`)).json()
beforeAll(async () => {
  expect((await getHealth()).runId).toBe(process.env.DASHIN_PAYLOAD_RUN_ID)
  for (const sku of ["product-1", "product-2", "product-3"]) {
    const response = await fetch(`${prefix}/api/products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sku, name: sku }) })
    expect(response.status).toBe(201); docs.push((await response.json()).doc)
  }
})
describe("Payload 3 real REST + SQLite adapter integration", () => {
  it("loads pagination and totalDocs through the real controller chain", async () => {
    const result = await dataCtrl({ path: "products", prefix, tableQuery: query })
    expect(result.data).toHaveLength(2); expect(result.totalCount).toBe(3)
  })
  it("resolves a genuine empty filtered result", async () => {
    await expect(dataCtrl({ path: "products", prefix, tableQuery: { ...query, search: "not-present-synthetic" } })).resolves.toEqual({ page: 0, data: [], totalCount: 0 })
  })
  it("rejects a real Payload hook refusal without masking it as empty", async () => {
    await expect(dataCtrl({ path: "restricted-products", prefix, tableQuery: query })).rejects.toThrow(/Synthetic query refusal/)
  })
  it("cancels an in-flight GET after the real backend receives it", async () => {
    const previous = (await getHealth()).productsRequests
    const controller = new AbortController()
    const result = dataCtrl({ path: "products", prefix, tableQuery: { ...query, pageSize: 17, signal: controller.signal } })
    const assertion = expect(result).rejects.toThrow()
    await vi.waitFor(async () => expect((await getHealth()).productsRequests).toBeGreaterThan(previous))
    controller.abort(); await assertion
    await expect(dataCtrl({ path: "products", prefix, tableQuery: query })).resolves.toMatchObject({ totalCount: 3 })
  })
  it("retains partial failure, conservatively labels HTTP failure unknown, and retries only its ID", async () => {
    let failure: any
    try { await bulkUpdateSer({ t: (value: string) => value, SchemaName: "products", primaryKey: "id", changes: {
      0: { oldData: docs[0], newData: { name: "Synthetic updated" } },
      1: { oldData: docs[1], newData: { name: "reject-write" } }
    } } as any) } catch (error) { failure = error }
    expect(failure).toMatchObject({ okCount: 1, failCount: 1, outcomes: [{ id: docs[0].id, outcome: "succeeded" }, { id: docs[1].id, outcome: "unknown" }] })
    expect(failure.resList[1].cause.data.errors).toBeTruthy()
    expect((await (await fetch(`${prefix}/api/products/${docs[0].id}`)).json()).name).toBe("Synthetic updated")
    expect((await (await fetch(`${prefix}/api/products/${docs[1].id}`)).json()).name).toBe("product-2")
    const retry = await bulkUpdateSer({ t: (value: string) => value, SchemaName: "products", changes: {
      1: { oldData: { id: failure.outcomes[1].id }, newData: { name: "Synthetic retry" } }
    } } as any)
    expect(retry).toHaveLength(1)
    expect((await (await fetch(`${prefix}/api/products/${docs[1].id}`)).json()).name).toBe("Synthetic retry")
  })
})

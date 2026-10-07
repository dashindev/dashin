import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn(), notice = vi.fn()
vi.mock("@dashin-dev/dashin", () => ({
  ENV: { MAIN_URL: "http://payload.test" }, storedToken: async () => "token",
  request: (...args: any[]) => request(...args), notice: (...args: any[]) => notice(...args)
}))
import dataCtrl from "../dataCtrl"

const query = { page: 0, pageSize: 10, search: "", filters: [] } as any
describe("Payload real query controller chain", () => {
  beforeEach(() => { request.mockReset(); notice.mockReset() })
  it("resolves genuine empty results and forwards the signal to GET", async () => {
    const signal = new AbortController().signal
    request.mockResolvedValue({ docs: [], totalDocs: 0 })
    await expect(dataCtrl({ path: "products", tableQuery: { ...query, signal } })).resolves.toEqual({ page: 0, data: [], totalCount: 0 })
    expect(request).toHaveBeenCalledWith("/api/products", expect.objectContaining({ method: "GET", signal }))
  })
  it.each([{ errors: [{ message: "Query denied" }] }, { success: false, message: "Query denied" }, { ok: false, error: "Query denied" }])("rejects a business error instead of resolving an empty list: %j", async response => {
    request.mockResolvedValue(response)
    await expect(dataCtrl({ path: "products", tableQuery: query })).rejects.toThrow("Query denied")
    expect(notice).not.toHaveBeenCalled()
  })
  it("propagates cancellation through the real controller/list service chain", async () => {
    const controller = new AbortController()
    let started!: () => void
    const running = new Promise<void>(resolve => { started = resolve })
    request.mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true })
      started()
    }))
    const result = dataCtrl({ path: "products", tableQuery: { ...query, signal: controller.signal } })
    const assertion = expect(result).rejects.toBeInstanceOf(DOMException)
    await running; controller.abort(); await assertion
    expect(notice).not.toHaveBeenCalled()
  })
  it("passes Query to custom services, preserves empty errors, and rejects explicit failures", async () => {
    const signal = new AbortController().signal
    const listService = vi.fn().mockResolvedValue({ data: [], totalCount: 0, errors: [] })
    await expect(dataCtrl({ listService, tableQuery: { ...query, signal } })).resolves.toMatchObject({ data: [], totalCount: 0 })
    expect(listService).toHaveBeenCalledWith(expect.objectContaining({ signal }))
    listService.mockResolvedValue({ errors: [{ message: "Custom failed" }] })
    await expect(dataCtrl({ listService, tableQuery: query })).rejects.toThrow("Custom failed")
    expect(notice).not.toHaveBeenCalled()
  })
  it("rejects missing query configuration", async () => {
    await expect(dataCtrl({ tableQuery: query })).rejects.toThrow("path required")
  })
})

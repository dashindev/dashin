import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn(), notice = vi.fn()
vi.mock("@dashin-dev/dashin", () => ({
  ENV: { MAIN_URL: "http://d1.test" }, storedToken: async () => "token",
  request: (...args: any[]) => request(...args), notice: (...args: any[]) => notice(...args)
}))
import dataCtrl from "../dataCtrl"

const query = { page: 0, pageSize: 10, search: "", filters: [] } as any
describe("D1 real query controller chain", () => {
  beforeEach(() => { request.mockReset(); notice.mockReset() })
  it("resolves genuine empty results and forwards the same signal to COUNT and SELECT", async () => {
    const signal = new AbortController().signal
    request.mockResolvedValueOnce({ rows: [{ c: 0 }] }).mockResolvedValueOnce({ rows: [] })
    await expect(dataCtrl({ path: "products", tableQuery: { ...query, signal } })).resolves.toEqual({ page: 0, data: [], totalCount: 0 })
    expect(request).toHaveBeenCalledTimes(2)
    for (const [url, options] of request.mock.calls) {
      expect(url).toBe("/query"); expect(options).toMatchObject({ method: "POST", signal })
    }
    expect(request.mock.calls[0][1].data.sql).toContain("COUNT(*)")
    expect(request.mock.calls[1][1].data.sql).toContain("SELECT *")
  })
  it("rejects COUNT business errors and never issues SELECT", async () => {
    request.mockResolvedValue({ error: "COUNT denied" })
    await expect(dataCtrl({ path: "products", tableQuery: query })).rejects.toThrow("COUNT denied")
    expect(request).toHaveBeenCalledTimes(1); expect(notice).not.toHaveBeenCalled()
  })
  it("rejects SELECT business errors instead of returning an empty list", async () => {
    request.mockResolvedValueOnce({ rows: [{ c: 2 }] }).mockResolvedValueOnce({ error: { message: "SELECT denied" } })
    await expect(dataCtrl({ path: "products", tableQuery: query })).rejects.toThrow("SELECT denied")
    expect(notice).not.toHaveBeenCalled()
  })
  it.each([0, 1])("propagates cancellation of request %s through execute", async index => {
    const controller = new AbortController()
    let started!: () => void
    const running = new Promise<void>(resolve => { started = resolve })
    if (index) request.mockResolvedValueOnce({ rows: [{ c: 2 }] })
    request.mockImplementation((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true }); started()
    }))
    const result = dataCtrl({ path: "products", tableQuery: { ...query, signal: controller.signal } })
    const assertion = expect(result).rejects.toBeInstanceOf(DOMException)
    await running; controller.abort(); await assertion
    expect(request).toHaveBeenCalledTimes(index + 1); expect(notice).not.toHaveBeenCalled()
  })
  it("passes Query to custom services and rejects their error envelope", async () => {
    const listService = vi.fn().mockResolvedValue({ data: [], totalCount: 0, errors: [] })
    await expect(dataCtrl({ listService, tableQuery: query })).resolves.toMatchObject({ data: [], totalCount: 0 })
    expect(listService).toHaveBeenCalledWith(query)
    listService.mockResolvedValue({ errors: [{ message: "Custom denied" }] })
    await expect(dataCtrl({ listService, tableQuery: query })).rejects.toThrow("Custom denied")
    expect(notice).not.toHaveBeenCalled()
  })
  it("rejects missing query configuration", async () => {
    await expect(dataCtrl({ tableQuery: query })).rejects.toThrow("path required")
  })
})

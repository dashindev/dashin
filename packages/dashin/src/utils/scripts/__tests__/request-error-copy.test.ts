import { afterEach, describe, expect, it, vi } from "vitest"

afterEach(() => {
  vi.doUnmock("../../config")
  vi.resetModules()
  vi.restoreAllMocks()
})

describe.each(["en", "zh"])("conservative HTTP error copy (%s)", language => {
  async function loadRequest() {
    vi.resetModules()
    vi.doMock("../../config", () => ({ ENV: { I18N_CODE: language } }))
    vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})
    return import("../request")
  }

  const uncertain = () => language === "zh"
    ? "仅凭响应状态无法确认数据是否已写入"
    : "The response status alone does not confirm whether data was written"

  it.each([400, 404])("does not infer no write from HTTP %s", async status => {
    const { errorHandler, RequestError } = await loadRequest()
    const response = { status, url: "http://example.test/mutation" }
    let caught: any
    try { errorHandler({ response, data: {} }) } catch (error) { caught = error }
    expect(caught).toBeInstanceOf(RequestError)
    expect(caught).toMatchObject({ status, url: response.url, data: {} })
    expect(caught.response).toBe(response)
    expect(caught.description).toContain(uncertain())
    expect(caught.message).toBe(caught.description)
  })

  it.each([400, 404])("keeps business message and body for HTTP %s", async status => {
    const { errorHandler } = await loadRequest()
    const data = { errors: [{ message: "Explicit adapter rejection" }], fixture: true }
    let caught: any
    try { errorHandler({ response: { status, url: "http://example.test/mutation" }, data }) } catch (error) { caught = error }
    expect(caught).toMatchObject({ status, message: "Explicit adapter rejection" })
    expect(caught.data).toBe(data)
    expect(caught.description).toContain(uncertain())
  })

  it.each([400, 404])("keeps legacy resolved metadata for HTTP %s", async status => {
    const { errorHandler } = await loadRequest()
    const data = { message: "Fixture refusal" }
    const response = { status, url: "http://example.test/mutation" }
    const result = errorHandler({ response, data, request: { options: { legacyResolveError: true } } })
    expect(result).toMatchObject({ status, data })
    expect(result.response).toBe(response as any)
    expect(result.error).toContain(uncertain())
  })
})

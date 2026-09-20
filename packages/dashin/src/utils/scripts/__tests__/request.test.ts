import { describe, it, expect, vi, beforeEach } from "vitest"
import request, { errorHandler, RequestError } from "../request"

describe("Strict Mutation Contract: request & errorHandler", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("resolves on HTTP 201", async () => {
    const mockData = { id: "123", name: "Package A" }
    vi.spyOn(global, "fetch").mockImplementationOnce(async () => ({
      status: 201,
      statusText: "Created",
      url: "http://example.com/api/packages",
      headers: new Headers({ "content-type": "application/json" }),
      clone: function () { return this },
      text: async () => JSON.stringify(mockData),
      json: async () => mockData
    } as any))

    const res = await request("http://example.com/api/packages", { method: "POST", data: { name: "Package A" } })
    expect(res).toEqual(mockData)
  })

  it("rejects on HTTP 400 with RequestError and preserves business response body and status", async () => {
    const errorBody = {
      errors: [
        {
          message: "Package code already exists",
          data: { errors: [{ message: "Duplicate code" }] }
        }
      ]
    }
    vi.spyOn(global, "fetch").mockImplementationOnce(async () => ({
      status: 400,
      statusText: "Bad Request",
      url: "http://example.com/api/packages",
      headers: new Headers({ "content-type": "application/json" }),
      clone: function () { return this },
      text: async () => JSON.stringify(errorBody),
      json: async () => errorBody
    } as any))

    let caughtError: any
    try {
      await request("http://example.com/api/packages", { method: "POST", data: { code: "PKG-01" } })
    } catch (e) {
      caughtError = e
    }

    expect(caughtError).toBeInstanceOf(RequestError)
    expect(caughtError.status).toBe(400)
    expect(caughtError.data).toEqual(errorBody)
    expect(caughtError.message).toBe("Duplicate code")
  })

  it("rejects on HTTP 409 Conflict and 422 Unprocessable Entity preserving status and body", async () => {
    const conflictBody = { message: "Conflict occurred" }
    vi.spyOn(global, "fetch").mockImplementationOnce(async () => ({
      status: 409,
      statusText: "Conflict",
      url: "http://example.com/api/packages/1",
      headers: new Headers({ "content-type": "application/json" }),
      clone: function () { return this },
      text: async () => JSON.stringify(conflictBody),
      json: async () => conflictBody
    } as any))

    await expect(request("http://example.com/api/packages/1")).rejects.toMatchObject({
      status: 409,
      data: conflictBody
    })

    const unprocessableBody = { errors: [{ message: "Invalid payload format" }] }
    vi.spyOn(global, "fetch").mockImplementationOnce(async () => ({
      status: 422,
      statusText: "Unprocessable Entity",
      url: "http://example.com/api/packages",
      headers: new Headers({ "content-type": "application/json" }),
      clone: function () { return this },
      text: async () => JSON.stringify(unprocessableBody),
      json: async () => unprocessableBody
    } as any))

    await expect(request("http://example.com/api/packages")).rejects.toMatchObject({
      status: 422,
      data: unprocessableBody,
      message: "Invalid payload format"
    })
  })

  it("does NOT reject normal business document payloads containing 'errors' or 'ok: false' when checkBusinessErrors is not enabled", async () => {
    const documentData = {
      id: "doc-1",
      title: "Error Log Report",
      ok: false, // Legitimate boolean field in document!
      errors: ["Warning in line 5"], // Legitimate array of notes in document!
      success: false
    }
    vi.spyOn(global, "fetch").mockImplementationOnce(async () => ({
      status: 200,
      statusText: "OK",
      url: "http://example.com/api/documents/doc-1",
      headers: new Headers({ "content-type": "application/json" }),
      clone: function () { return this },
      text: async () => JSON.stringify(documentData),
      json: async () => documentData
    } as any))

    // Default request without checkBusinessErrors MUST NOT reject normal document data!
    const res = await request("http://example.com/api/documents/doc-1")
    expect(res).toEqual(documentData)
  })

  it("rejects when checkBusinessErrors: true and HTTP 200 contains errors array", async () => {
    const payload200Error = {
      errors: [
        {
          message: "The following field is invalid: code",
          data: { errors: [{ message: "Code must be unique" }] }
        }
      ]
    }
    vi.spyOn(global, "fetch").mockImplementationOnce(async () => ({
      status: 200,
      statusText: "OK",
      url: "http://example.com/api/packages",
      headers: new Headers({ "content-type": "application/json" }),
      clone: function () { return this },
      text: async () => JSON.stringify(payload200Error),
      json: async () => payload200Error
    } as any))

    let caught: any
    try {
      await request("http://example.com/api/packages", { checkBusinessErrors: true } as any)
    } catch (e) {
      caught = e
    }

    expect(caught).toBeInstanceOf(RequestError)
    expect(caught.status).toBe(200)
    expect(caught.data).toEqual(payload200Error)
    expect(caught.message).toBe("Code must be unique")
  })

  it("rejects when checkBusinessErrors: true and HTTP 200 contains success: false", async () => {
    const failurePayload = { success: false, error: "Validation failed on gateway" }
    vi.spyOn(global, "fetch").mockImplementationOnce(async () => ({
      status: 200,
      statusText: "OK",
      url: "http://example.com/api/packages",
      headers: new Headers({ "content-type": "application/json" }),
      clone: function () { return this },
      text: async () => JSON.stringify(failurePayload),
      json: async () => failurePayload
    } as any))

    await expect(request("http://example.com/api/packages", { checkBusinessErrors: true } as any)).rejects.toMatchObject({
      status: 200,
      data: failurePayload,
      message: "Validation failed on gateway"
    })
  })

  it("rejects when checkBusinessErrors: true and HTTP 200 contains ok: false", async () => {
    const failurePayload = { ok: false, message: "Database write rejected" }
    vi.spyOn(global, "fetch").mockImplementationOnce(async () => ({
      status: 200,
      statusText: "OK",
      url: "http://example.com/api/packages",
      headers: new Headers({ "content-type": "application/json" }),
      clone: function () { return this },
      text: async () => JSON.stringify(failurePayload),
      json: async () => failurePayload
    } as any))

    await expect(request("http://example.com/api/packages", { checkBusinessErrors: true } as any)).rejects.toMatchObject({
      status: 200,
      data: failurePayload,
      message: "Database write rejected"
    })
  })

  it("supports custom checkBusinessErrors discriminator function", async () => {
    const customPayload = { status: "REJECTED", reason: "Invalid license" }
    vi.spyOn(global, "fetch").mockImplementationOnce(async () => ({
      status: 200,
      statusText: "OK",
      url: "http://example.com/api/license",
      headers: new Headers({ "content-type": "application/json" }),
      clone: function () { return this },
      text: async () => JSON.stringify(customPayload),
      json: async () => customPayload
    } as any))

    await expect(
      request("http://example.com/api/license", {
        checkBusinessErrors: (data: any) => (data.status === "REJECTED" ? data.reason : undefined)
      } as any)
    ).rejects.toMatchObject({
      status: 200,
      message: "Invalid license"
    })
  })

  it("treats custom discriminator true as a detected business error", async () => {
    const payload = { message: "Rejected by policy" }
    vi.spyOn(global, "fetch").mockImplementationOnce(async () => ({
      status: 200,
      statusText: "OK",
      url: "http://example.com/api/policy",
      headers: new Headers({ "content-type": "application/json" }),
      clone: function () { return this },
      text: async () => JSON.stringify(payload),
      json: async () => payload
    } as any))

    await expect(request("http://example.com/api/policy", {
      checkBusinessErrors: () => true
    } as any)).rejects.toMatchObject({ message: "Rejected by policy" })
  })

  it("treats custom discriminator false as no business error", async () => {
    const payload = { message: "ordinary document message" }
    vi.spyOn(global, "fetch").mockImplementationOnce(async () => ({
      status: 200,
      statusText: "OK",
      url: "http://example.com/api/document",
      headers: new Headers({ "content-type": "application/json" }),
      clone: function () { return this },
      text: async () => JSON.stringify(payload),
      json: async () => payload
    } as any))

    await expect(request("http://example.com/api/document", {
      checkBusinessErrors: () => false
    } as any)).resolves.toEqual(payload)
  })

  it.each([undefined, null])(
    "treats custom discriminator empty result %s as no business error",
    async emptyResult => {
      const payload = { value: "ok" }
      vi.spyOn(global, "fetch").mockImplementationOnce(async () => ({
        status: 200,
        statusText: "OK",
        url: "http://example.com/api/document",
        headers: new Headers({ "content-type": "application/json" }),
        clone: function () { return this },
        text: async () => JSON.stringify(payload),
        json: async () => payload
      } as any))

      await expect(request("http://example.com/api/document", {
        checkBusinessErrors: () => emptyResult
      } as any)).resolves.toEqual(payload)
    }
  )

  it("supports getResponse: true with checkBusinessErrors: true, unwrapping data and preserving response", async () => {
    const errorBody = { success: false, message: "Operation not allowed" }
    const fakeResponse = {
      status: 200,
      statusText: "OK",
      url: "http://example.com/api/protected",
      headers: new Headers({ "content-type": "application/json" }),
      clone: function () { return this },
      text: async () => JSON.stringify(errorBody),
      json: async () => errorBody
    }
    vi.spyOn(global, "fetch").mockImplementationOnce(async () => fakeResponse as any)

    let caught: any
    try {
      await request("http://example.com/api/protected", {
        getResponse: true,
        checkBusinessErrors: true
      } as any)
    } catch (e) {
      caught = e
    }

    expect(caught).toBeInstanceOf(RequestError)
    expect(caught.status).toBe(200)
    expect(caught.message).toBe("Operation not allowed")
    expect(caught.data).toEqual(errorBody)
    expect(caught.response).toBe(fakeResponse)
    expect(caught.url).toBe(fakeResponse.url)
  })

  it("normalizes timeout errors to RequestError with status 504 and readable URL message", async () => {
    const timeoutErr: any = new Error("timeout of 6000ms exceeded")
    timeoutErr.type = "Timeout"
    timeoutErr.name = "RequestError" // umi-request's internal error name
    timeoutErr.request = { url: "http://example.com/api/slow-endpoint" }

    let caught: any
    try {
      errorHandler(timeoutErr)
    } catch (e) {
      caught = e
    }

    expect(caught).toBeInstanceOf(RequestError)
    expect(caught.status).toBe(504)
    expect(caught.url).toBe("http://example.com/api/slow-endpoint")
    expect(caught.message).toContain("http://example.com/api/slow-endpoint")
  })

  it("rejects with readable error on network failure and preserves URL", async () => {
    const networkErr: any = new TypeError("Failed to fetch")
    networkErr.request = { url: "http://example.com/api/unreachable" }

    let caught: any
    try {
      errorHandler(networkErr)
    } catch (e) {
      caught = e
    }

    expect(caught).toBeInstanceOf(RequestError)
    expect(caught.url).toBe("http://example.com/api/unreachable")
    expect(caught.message).toMatch(/Failed to fetch|网络异常/)
  })

  it("supports legacyResolveError option for backward compatibility", async () => {
    const errorBody = { message: "Server error" }
    vi.spyOn(global, "fetch").mockImplementationOnce(async () => ({
      status: 500,
      statusText: "Internal Server Error",
      url: "http://example.com/api/packages",
      headers: new Headers({ "content-type": "application/json" }),
      clone: function () { return this },
      text: async () => JSON.stringify(errorBody),
      json: async () => errorBody
    } as any))

    const res = await request("http://example.com/api/packages", { legacyResolveError: true } as any)
    expect(res).toBeDefined()
    expect((res as any).error).toBeDefined()
  })
})

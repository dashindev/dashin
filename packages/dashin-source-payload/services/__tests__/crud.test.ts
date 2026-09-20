import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
const notice = vi.fn()
vi.mock("@dashin-dev/dashin", () => ({
  EditableCtrl: {},
  ENV: { MAIN_URL: "http://pl.test", AUTH_URL: "http://pl.test" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "tok",
  notice: (...a: any[]) => notice(...a)
}))

import { addSer, updateSer, deleteSer } from "../crud"

const t = (s: string) => s

describe("payload CRUD services - strict mutation contract", () => {
  beforeEach(() => {
    request.mockReset()
    notice.mockReset()
  })

  it("add POSTs to /api/{collection} and notices success on valid response", async () => {
    request.mockResolvedValue({ doc: { id: 1 } })
    const res = await addSer({ t, SchemaName: "posts", newData: { name: "a" } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/api/posts")
    expect(opts.method).toBe("POST")
    expect(res).toEqual({ doc: { id: 1 } })
    expect(notice).toHaveBeenCalledTimes(1)
    expect(notice).toHaveBeenCalledWith({ title: "Created", severity: "success" })
  })

  it("update PATCHes /api/{collection}/{id} and notices success on valid response", async () => {
    request.mockResolvedValue({ doc: { id: 9 } })
    const res = await updateSer({ t, SchemaName: "posts", newData: { name: "b" }, oldData: { id: 9 } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/api/posts/9")
    expect(opts.method).toBe("PATCH")
    expect(res).toEqual({ doc: { id: 9 } })
    expect(notice).toHaveBeenCalledTimes(1)
    expect(notice).toHaveBeenCalledWith({ title: "Changes Saved", severity: "success" })
  })

  it("delete DELETEs /api/{collection}/{id} and notices success on valid response", async () => {
    request.mockResolvedValue({ id: 9 })
    const res = await deleteSer({ t, SchemaName: "posts", oldData: { id: 9 } } as any)
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/api/posts/9")
    expect(opts.method).toBe("DELETE")
    expect(notice).toHaveBeenCalledTimes(1)
    expect(notice).toHaveBeenCalledWith({ title: "Deleted", severity: "success" })
  })

  it("addSer rejects when request rejects; success notice is called 0 times", async () => {
    const error = new Error("Duplicate package code")
    request.mockRejectedValue(error)

    await expect(addSer({ t, SchemaName: "posts", newData: { code: "PKG-01" } } as any)).rejects.toThrow("Duplicate package code")
    // Success notice must never be called!
    expect(notice).not.toHaveBeenCalledWith(expect.objectContaining({ severity: "success" }))
    expect(notice).toHaveBeenCalledTimes(1)
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ title: "Create Failed", severity: "warning" }))
  })

  it("updateSer rejects when response has errors array; success notice is called 0 times", async () => {
    request.mockResolvedValue({
      errors: [
        {
          message: "The following field is invalid: code",
          data: { errors: [{ message: "Code must be unique" }] }
        }
      ]
    })

    await expect(updateSer({ t, SchemaName: "posts", newData: { code: "PKG-01" }, oldData: { id: 1 } } as any)).rejects.toThrow("Code must be unique")
    expect(notice).not.toHaveBeenCalledWith(expect.objectContaining({ severity: "success" }))
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ title: "Save Failed", severity: "warning", content: "Code must be unique" }))
  })

  it("deleteSer rejects when response has success: false or ok: false; success notice is called 0 times", async () => {
    request.mockResolvedValue({ success: false, error: "Cannot delete record with active dependencies" })

    await expect(deleteSer({ t, SchemaName: "posts", oldData: { id: 1 } } as any)).rejects.toThrow("Cannot delete record with active dependencies")
    expect(notice).not.toHaveBeenCalledWith(expect.objectContaining({ severity: "success" }))
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ title: "Delete Failed", severity: "warning" }))
  })

  it("deleteSer succeeds when response is empty / undefined (HTTP 204 No Content)", async () => {
    request.mockResolvedValue(undefined)
    const res = await deleteSer({ t, SchemaName: "posts", oldData: { id: 9 } } as any)
    expect(res).toBeUndefined()
    expect(notice).toHaveBeenCalledWith({ title: "Deleted", severity: "success" })
  })
})

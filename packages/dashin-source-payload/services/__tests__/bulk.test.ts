import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
const notice = vi.fn()
vi.mock("@dashin-dev/dashin", () => ({
  ENV: { MAIN_URL: "http://pl.test", AUTH_URL: "http://pl.test" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "tok",
  notice: (...a: any[]) => notice(...a)
}))

import { bulkDeleteSer, bulkUpdateSer } from "../bulk"

const t = (s: string) => s
const captureError = async (promise: Promise<any>) => {
  try {
    await promise
  } catch (error) {
    return error as any
  }
  throw new Error("Expected promise to reject")
}

describe("payload bulk services - strict mutation contract", () => {
  beforeEach(() => {
    request.mockReset()
    notice.mockReset()
  })

  it("bulkDelete all-success: notices success and returns resList", async () => {
    request.mockResolvedValue({ id: 1 })
    const res = await bulkDeleteSer({ t, SchemaName: "posts", data: [{ id: 1 }, { id: 2 }] } as any)
    expect(request).toHaveBeenCalledTimes(2)
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({
      severity: "success",
      content: expect.stringContaining("2 success")
    }))
    expect(res).toHaveLength(2)
  })

  it("bulkDelete partial-failure: notices warning with error summary and rejects with Error", async () => {
    request
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ errors: [{ message: "Cannot delete item 2" }] })

    const error = await captureError(
      bulkDeleteSer({ t, SchemaName: "posts", data: [{ id: 1 }, { id: 2 }] } as any)
    )

    expect(error.message).toMatch(/1 of 2 bulk delete operations failed/)
    expect(error).toMatchObject({ okCount: 1, failCount: 1 })
    expect(error.resList).toHaveLength(2)
    expect(error.resList[1]).toMatchObject({ error: "Cannot delete item 2", item: { id: 2 } })
    expect(request).toHaveBeenCalledTimes(2)
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({
      severity: "warning",
      content: expect.stringContaining("1 success, 1 failure. (Cannot delete item 2)")
    }))
  })

  it("bulkDelete all-failure: notices error and rejects with Error", async () => {
    request
      .mockRejectedValueOnce(new Error("Item 1 locked"))
      .mockRejectedValueOnce(new Error("Item 2 locked"))

    const error = await captureError(
      bulkDeleteSer({ t, SchemaName: "posts", data: [{ id: 1 }, { id: 2 }] } as any)
    )

    expect(error.message).toMatch(/All 2 bulk delete operations failed/)
    expect(error).toMatchObject({ okCount: 0, failCount: 2 })
    expect(error.resList).toHaveLength(2)
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({
      severity: "error",
      content: expect.stringContaining("2 failure")
    }))
  })

  it("bulkDelete records a transport throw and continues remaining rows", async () => {
    request
      .mockRejectedValueOnce(new Error("Connection reset"))
      .mockResolvedValueOnce({ id: 2 })

    const error = await captureError(
      bulkDeleteSer({ t, SchemaName: "posts", data: [{ id: 1 }, { id: 2 }] } as any)
    )

    expect(request).toHaveBeenCalledTimes(2)
    expect(error).toMatchObject({ okCount: 1, failCount: 1 })
    expect(error.resList).toHaveLength(2)
    expect(error.resList[0]).toMatchObject({ error: "Connection reset", item: { id: 1 } })
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "warning" }))
  })

  it("bulkUpdate all-success: notices success and returns resList", async () => {
    request.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce({ id: 2 })

    const result = await bulkUpdateSer({
      t,
      SchemaName: "posts",
      changes: {
        a: { oldData: { id: 1 }, newData: { title: "One" } },
        b: { oldData: { id: 2 }, newData: { title: "Two" } }
      }
    } as any)

    expect(request).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(2)
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({
      severity: "success",
      content: expect.stringContaining("2 success")
    }))
  })

  it("bulkUpdate partial-failure: notices warning and rejects with Error", async () => {
    request
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ errors: [{ message: "Title is required" }] })

    const error = await captureError(
      bulkUpdateSer({
        t,
        SchemaName: "posts",
        changes: {
          a: { oldData: { id: 1 }, newData: { title: "OK" } },
          b: { oldData: { id: 2 }, newData: { title: "" } }
        }
      } as any)
    )

    expect(error.message).toMatch(/1 of 2 bulk update operations failed/)
    expect(error).toMatchObject({ okCount: 1, failCount: 1 })
    expect(error.resList).toHaveLength(2)
    expect(error.resList[1]).toMatchObject({
      error: "Title is required",
      oldData: { id: 2 },
      newData: { title: "" }
    })
    expect(request).toHaveBeenCalledTimes(2)
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({
      severity: "warning",
      content: expect.stringContaining("1 success, 1 failure")
    }))
  })

  it("bulkUpdate all-failure: notices error and rejects with full counts", async () => {
    request
      .mockResolvedValueOnce({ errors: [{ message: "Row 1 locked" }] })
      .mockResolvedValueOnce({ errors: [{ message: "Row 2 locked" }] })

    const error = await captureError(bulkUpdateSer({
      t,
      SchemaName: "posts",
      changes: {
        a: { oldData: { id: 1 }, newData: { title: "One" } },
        b: { oldData: { id: 2 }, newData: { title: "Two" } }
      }
    } as any))

    expect(error.message).toMatch(/All 2 bulk update operations failed/)
    expect(error).toMatchObject({ okCount: 0, failCount: 2 })
    expect(error.resList).toHaveLength(2)
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "error" }))
  })

  it("bulkUpdate records a transport throw and continues remaining changes", async () => {
    request
      .mockRejectedValueOnce(new Error("Network unavailable"))
      .mockResolvedValueOnce({ id: 2 })

    const error = await captureError(bulkUpdateSer({
      t,
      SchemaName: "posts",
      changes: {
        a: { oldData: { id: 1 }, newData: { title: "One" } },
        b: { oldData: { id: 2 }, newData: { title: "Two" } }
      }
    } as any))

    expect(request).toHaveBeenCalledTimes(2)
    expect(error).toMatchObject({ okCount: 1, failCount: 1 })
    expect(error.resList).toHaveLength(2)
    expect(error.resList[0]).toMatchObject({
      error: "Network unavailable",
      oldData: { id: 1 },
      newData: { title: "One" }
    })
    expect(notice).toHaveBeenCalledWith(expect.objectContaining({ severity: "warning" }))
  })
})

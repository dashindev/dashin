import { describe, it, expect, vi } from "vitest"

vi.mock("@/core", () => ({ notice: vi.fn(async () => {}) }))
vi.mock("@/utils/routes", () => ({ CoreGroupName: "core" }))

import { editableController } from "../editableController"

describe("editableController", () => {
  it("returns onRowAdd, onRowUpdate, onRowDelete handlers", () => {
    const editable = editableController()
    expect(editable.onRowAdd).toBeTypeOf("function")
    expect(editable.onRowUpdate).toBeTypeOf("function")
    expect(editable.onRowDelete).toBeTypeOf("function")
  })

  it("onRowAdd resolves for non-core group", async () => {
    const editable = editableController()
    await expect(editable.onRowAdd!({ group: "custom" })).resolves.toBe("")
  })

  it("onRowUpdate resolves for non-core group", async () => {
    const editable = editableController()
    await expect(editable.onRowUpdate!({ group: "custom" }, {})).resolves.toBe(
      ""
    )
  })

  it("onRowAdd resolves (with notice) for core group", async () => {
    const { notice } = await import("@/core")
    const editable = editableController()
    await expect(editable.onRowAdd!({ group: "core" })).resolves.toBe("")
    expect(notice).toHaveBeenCalled()
  })

  it("onRowDelete resolves", async () => {
    const editable = editableController()
    await expect(editable.onRowDelete!({} as any)).resolves.toBe("")
  })
})

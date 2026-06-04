import { describe, it, expect } from "vitest"
import columnsController from "../columnsController"

describe("columnsController", () => {
  const t = (k: string) => `t:${k}`

  it("translates column title via t()", () => {
    const columns = [{ field: "name", title: "Name" }]
    const result = columnsController({ t, columns })
    expect(result[0].title).toBe("t:Name")
  })

  it("sets render fn for id-containing field that stringifies r.id", () => {
    const columns = [{ field: "user_id", title: "ID" }]
    const result = columnsController({ t, columns })
    expect(result[0].render).toBeTypeOf("function")
    expect(result[0].render!({ id: 123 } as any)).toBe("123")
  })

  it("does not set render for non-id fields", () => {
    const columns = [{ field: "name", title: "Name" }]
    const result = columnsController({ t, columns })
    expect(result[0].render).toBeUndefined()
  })
})

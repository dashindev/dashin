import { describe, it, expect, vi } from "vitest"

const request = vi.fn()
vi.mock("@dashin-dev/dashin", () => ({
  request: (...a: any[]) => request(...a),
  ENV: { MAIN_URL: "http://pl.test", AUTH_URL: "http://pl.test" },
  storedToken: async () => "tok"
}))
vi.mock("../controllers/editableCtrl", () => ({
  default: ({ SchemaName }: any) => ({ __schema: SchemaName, onRowUpdate: async () => ({}) })
}))
vi.mock("../controllers/dataCtrl", () => ({
  default: vi.fn(async () => ({ page: 0, data: [], totalCount: 0 }))
}))

import { payloadCrud, payloadCollection } from "../bindings"

const t = (s: string) => s

describe("payloadCrud", () => {
  it("returns a data() fn + a schema-bound editable", () => {
    const { data, editable } = payloadCrud("posts", { t })
    expect(typeof data).toBe("function")
    expect((editable as any).__schema).toBe("posts")
  })
})

describe("payloadCollection", () => {
  it("passes meta/columns through and fetches /api/{slug}/{id}?depth", async () => {
    request.mockResolvedValue({ id: 5, name: "x" })
    const meta = { label: "Post", title: (r: any) => r.name }
    const entry = payloadCollection("posts", {
      meta: meta as any,
      columns: [{ title: "Name", field: "name" }] as any,
      t,
      depth: 2
    })
    expect(entry.meta).toBe(meta)
    expect(entry.columns).toHaveLength(1)
    const rec = await entry.fetch!(5)
    expect(rec).toEqual({ id: 5, name: "x" })
    const [url, opts] = request.mock.calls[0]
    expect(url).toBe("/api/posts/5")
    expect(opts.method).toBe("GET")
    expect(opts.params).toEqual({ depth: 2 })
    expect((entry.editable as any).__schema).toBe("posts")
  })
})

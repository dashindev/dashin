import { describe, it, expect, vi, beforeEach } from "vitest"

const request = vi.fn()
vi.mock("@dashin-dev/dashin", () => ({
  ENV: { MAIN_URL: "http://sb.test", AUTH_URL: "http://sb.test", SUPABASE_KEY: "anon" },
  request: (...a: any[]) => request(...a),
  storedToken: async () => "sess",
  notice: vi.fn()
}))

import bulkDeleteSer from "../bulkDeleteSer"
import bulkUpdateSer from "../bulkUpdateSer"

const t = (s: string) => s

describe("supabase bulk services", () => {
  beforeEach(() => request.mockReset().mockResolvedValue([]))

  it("bulkDelete DELETEs each row via ?id=eq.", async () => {
    await bulkDeleteSer({ t, SchemaName: "posts", data: [{ id: 1 }, { id: 2 }] } as any)
    expect(request).toHaveBeenCalledTimes(2)
    expect(request.mock.calls[0][1].method).toBe("DELETE")
    expect(request.mock.calls[1][1].params.id).toBe("eq.2")
  })

  it("bulkUpdate PATCHes each change via ?id=eq.", async () => {
    await bulkUpdateSer({ t, SchemaName: "posts", changes: { a: { oldData: { id: 9 }, newData: { n: 1 } } } } as any)
    expect(request.mock.calls[0][1].method).toBe("PATCH")
    expect(request.mock.calls[0][1].params.id).toBe("eq.9")
  })
})

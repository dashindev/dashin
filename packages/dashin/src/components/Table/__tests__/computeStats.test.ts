import { describe, it, expect, vi } from "vitest"
import { computeStats } from "../computeStats"

const postsCols = [
  { field: "id", title: "Id" },
  { field: "title", title: "Title" },
  { field: "status", title: "Status", lookup: { draft: "Draft", published: "Published" } },
  { field: "views", title: "Views" }
] as any[]

/** Mock the table's data() fetcher: total = 3, published = 2, draft = 1. */
function mockFetch() {
  return vi.fn(async (q: any) => {
    const f = (q.filters || [])[0]
    if (!f) return { totalCount: 3 }
    return { totalCount: f.value === "published" ? 2 : 1 }
  })
}

describe("computeStats", () => {
  it("returns just a Total card when there is no enum column", async () => {
    const fetch = vi.fn(async () => ({ totalCount: 7 }))
    const stats = await computeStats(
      [{ field: "id", title: "Id" }, { field: "title", title: "Title" }] as any,
      fetch,
      "Items"
    )
    expect(stats).toHaveLength(1)
    expect(stats![0]).toMatchObject({ label: "Total Items", value: 7 })
    expect(fetch).toHaveBeenCalledTimes(1) // only the unfiltered total
  })

  it("builds Total + per-status cards with real counts and a distribution", async () => {
    const fetch = mockFetch()
    const stats = await computeStats(postsCols, fetch, "Posts (Cloudflare D1)")
    expect(stats).not.toBeNull()

    const total = stats![0]
    expect(total).toMatchObject({ label: "Total Posts", value: 3, delta: "by Status" })
    // distribution: one segment per non-empty status, in lookup order
    expect(total.dist!.map(d => d.value)).toEqual([1, 2]) // draft=1, published=2
    expect(total.dist!.map(d => d.label)).toEqual(["Draft", "Published"])

    const labels = stats!.slice(1).map(s => s.label)
    expect(labels).toEqual(["Draft", "Published"])
    const published = stats!.find(s => s.label === "Published")!
    expect(published.value).toBe(2)
    expect(published.delta).toBe("66.7% of total")
  })

  it("returns null if the fetcher throws", async () => {
    const fetch = vi.fn(async () => {
      throw new Error("network")
    })
    expect(await computeStats(postsCols, fetch, "Posts")).toBeNull()
  })
})

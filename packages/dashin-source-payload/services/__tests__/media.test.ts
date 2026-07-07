import { describe, it, expect, vi } from "vitest"

vi.mock("@dashin-dev/dashin", () => ({
  ENV: { MAIN_URL: "http://pl.test", AUTH_URL: "http://auth.test" },
  storedToken: async () => "tok"
}))

import { mediaUrl, photoThumb, photoLarge } from "../media"

describe("mediaUrl", () => {
  it("prefixes a relative path with the API origin", () => {
    expect(mediaUrl("/api/media/file/x.webp")).toBe("http://pl.test/api/media/file/x.webp")
  })
  it("passes absolute URLs through unchanged", () => {
    expect(mediaUrl("https://cdn.example/x.png")).toBe("https://cdn.example/x.png")
  })
  it("returns null for empty input", () => {
    expect(mediaUrl(null)).toBeNull()
    expect(mediaUrl("")).toBeNull()
  })
})

describe("photoThumb / photoLarge", () => {
  const photo = {
    url: "/api/media/file/orig.jpg",
    sizes: { thumbnail: { url: "/api/media/file/t.webp" }, card: { url: "/api/media/file/c.webp" } }
  }
  it("thumb prefers the thumbnail size", () => {
    expect(photoThumb(photo)).toBe("http://pl.test/api/media/file/t.webp")
  })
  it("large prefers the card size", () => {
    expect(photoLarge(photo)).toBe("http://pl.test/api/media/file/c.webp")
  })
  it("falls back to the original when there are no sizes", () => {
    expect(photoThumb({ url: "/api/media/file/o.jpg" })).toBe("http://pl.test/api/media/file/o.jpg")
  })
  it("returns null for a non-object (e.g. an unexpanded id)", () => {
    expect(photoThumb(5)).toBeNull()
    expect(photoLarge(null)).toBeNull()
  })
})

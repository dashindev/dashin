import { describe, it, expect, vi } from "vitest"

// The eager glob in pluginRegistry pulls in bunadmin-auth-local → @dashin-dev/dashin
// → src/index.tsx which calls ReactDOM.createRoot and renders <App>.
// Mock react-dom/client to prevent the side-effect.
vi.mock("react-dom/client", () => ({
  default: { createRoot: () => ({ render: vi.fn() }) },
  createRoot: () => ({ render: vi.fn() })
}))

// Provide #root element in case any code checks for it
if (!document.getElementById("root")) {
  const el = document.createElement("div")
  el.id = "root"
  document.body.appendChild(el)
}

import {
  getDynamicIndex,
  getPluginsDataJson,
  importPlugin,
  hasPlugin
} from "../pluginRegistry"

describe("pluginRegistry", () => {
  it("exports getDynamicIndex as a function", () => {
    expect(typeof getDynamicIndex).toBe("function")
  })

  it("exports getPluginsDataJson as a function", () => {
    expect(typeof getPluginsDataJson).toBe("function")
  })

  it("exports importPlugin as a function", () => {
    expect(typeof importPlugin).toBe("function")
  })

  it("exports hasPlugin as a function", () => {
    expect(typeof hasPlugin).toBe("function")
  })

  it("getDynamicIndex returns an object without throwing", () => {
    const result = getDynamicIndex()
    expect(result).toEqual(expect.any(Object))
  })

  it("getPluginsDataJson returns an array without throwing", () => {
    const result = getPluginsDataJson()
    expect(Array.isArray(result)).toBe(true)
  })

  it("hasPlugin returns false for a non-existent plugin", () => {
    expect(hasPlugin("non-existent-plugin")).toBe(false)
  })

  it("importPlugin rejects for a non-existent plugin", async () => {
    await expect(importPlugin("non-existent-plugin")).rejects.toThrow(
      "plugin module not found"
    )
  })
})

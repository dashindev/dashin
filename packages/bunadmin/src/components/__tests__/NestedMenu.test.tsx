import React from "react"
import { describe, it, expect, vi, beforeAll } from "vitest"
import { render } from "@testing-library/react"

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any
})

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k })
}))

vi.mock("@/router", () => ({
  useRouter: () => ({
    query: { group: "", name: "" },
    route: "/",
    push: vi.fn()
  })
}))

vi.mock("@/utils", () => ({
  SETTING_NAMES: { role: "role" },
  specialPluginSlug: (s: string) => s
}))

vi.mock("@/utils/database", () => ({
  BA_DB: {
    settings: {
      where: () => ({
        equals: () => ({ first: () => Promise.resolve({ value: "admin" }) })
      })
    }
  }
}))

vi.mock("@/utils/routes", () => ({
  DynamicRoute: "/[group]/[name]",
  DynamicDocRoute: "/docs/[category]/[slug]"
}))

import NestedList from "../NestedMenu"

const menuData: any[] = [
  {
    id: "1",
    name: "dashboard",
    label: "Dashboard",
    slug: "/home/dashboard",
    parent: "",
    rank: "10",
    icon: "",
    icon_type: "",
    role: ""
  },
  {
    id: "2",
    name: "admin-only",
    label: "Admin Only",
    slug: "/admin/settings",
    parent: "",
    rank: "5",
    icon: "",
    icon_type: "",
    role: "admin"
  },
  {
    id: "3",
    name: "editor-only",
    label: "Editor Only",
    slug: "/editor/posts",
    parent: "",
    rank: "3",
    icon: "",
    icon_type: "",
    role: "editor"
  }
]

describe("NestedList", () => {
  it("renders without throwing", () => {
    expect(() => render(<NestedList data={[]} />)).not.toThrow()
  })

  it("renders null for empty data", () => {
    const { container } = render(<NestedList data={[]} />)
    expect(container.innerHTML).toBe("")
  })

  it("renders menu items", () => {
    const { getByText } = render(<NestedList data={menuData} />)
    expect(getByText("Dashboard")).toBeTruthy()
  })

  // isAllowedRole is tested indirectly through component rendering.
  // The role filtering happens after useEffect sets currentRole from DB.
  // Since the initial currentRole is "" (before useEffect runs), items with
  // a non-empty role are filtered out on first synchronous render.
  // Only items with role="" (no restriction) render initially.
  it("filters out role-restricted items when currentRole is empty", () => {
    const { getByText, queryByText } = render(<NestedList data={menuData} />)
    expect(getByText("Dashboard")).toBeTruthy()
    // role="admin" and role="editor" items are filtered out with empty currentRole
    expect(queryByText("Admin Only")).toBeNull()
    expect(queryByText("Editor Only")).toBeNull()
  })
})

/**
 * isAllowedRole logic (extracted from source for documentation):
 *
 * The function is defined INSIDE the NestedList component and is NOT exported.
 * It checks if any of the user's comma-separated roles match any of the
 * item's comma-separated allowed roles. Returns true if match found,
 * false if allowedRole is set but doesn't match, and false (fallthrough)
 * if allowedRole is empty (which means the item renders for everyone).
 *
 * To properly unit-test isAllowedRole in isolation, it would need to be
 * extracted to a separate exported utility. As-is, we can only test it
 * indirectly through component rendering behavior.
 */

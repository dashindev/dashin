import { it, expect } from "vitest"
import { lockDialogScroll, isTopDialog } from "../dialogFocus"

it("restores prior body overflow after out-of-order nested closes", () => {
  document.body.style.overflow = "auto"
  const unlockParent = lockDialogScroll(), unlockChild = lockDialogScroll()
  unlockParent()
  expect(document.body.style.overflow).toBe("hidden")
  unlockChild()
  expect(document.body.style.overflow).toBe("auto")
  document.body.style.overflow = ""
})

it("only the highest modal owns keys when submitting has moved focus to body", () => {
  const parent = document.createElement("aside"), child = document.createElement("aside")
  for (const element of [parent, child]) { element.setAttribute("role", "dialog"); element.setAttribute("aria-modal", "true"); document.body.append(element) }
  parent.style.zIndex = "1300"; child.style.zIndex = "1500"
  expect(isTopDialog(parent)).toBe(false)
  expect(isTopDialog(child)).toBe(true)
  child.remove()
  expect(isTopDialog(parent)).toBe(true)
  parent.remove()
})

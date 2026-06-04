import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import Button from "../ui/Button"

describe("Button", () => {
  it("defaults to type=button and primary variant", () => {
    render(<Button>Go</Button>)
    const btn = screen.getByRole("button", { name: "Go" })
    expect(btn).toHaveAttribute("type", "button")
    expect(btn.className).toContain("bg-primary")
  })

  it("applies the requested variant + custom className", () => {
    render(
      <Button variant="danger" className="extra">
        Del
      </Button>
    )
    const btn = screen.getByRole("button", { name: "Del" })
    expect(btn.className).toContain("text-danger")
    expect(btn.className).toContain("extra")
  })

  it("fires onClick", () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Hit</Button>)
    fireEvent.click(screen.getByRole("button", { name: "Hit" }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

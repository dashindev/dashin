import React from "react"
import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import EvaIcon from "../EvaIcon"

describe("EvaIcon (lucide adapter)", () => {
  it("renders a mapped icon as an svg", () => {
    const { container } = render(<EvaIcon name="settings-outline" />)
    expect(container.querySelector("svg")).toBeTruthy()
  })
  it("renders a fallback svg for unknown names (no crash)", () => {
    const { container } = render(<EvaIcon name="totally-unknown-icon" />)
    expect(container.querySelector("svg")).toBeTruthy()
  })
  it("maps named sizes to pixel dimensions", () => {
    const { container } = render(<EvaIcon name="search" size="medium" />)
    const svg = container.querySelector("svg")
    expect(svg?.getAttribute("width")).toBe("20")
  })
})

import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import StatBand from "../regions/StatBand"
import SidebarFooter from "../regions/SidebarFooter"

describe("StatBand", () => {
  it("renders stat cards with values and delta", () => {
    render(
      <StatBand
        stats={[{ label: "Total Posts", value: "1,245", delta: "+12.5%", trend: "up" }]}
      />
    )
    expect(screen.getByText("Total Posts")).toBeTruthy()
    expect(screen.getByText("1,245")).toBeTruthy()
    expect(screen.getByText("+12.5%")).toBeTruthy()
  })
  it("renders nothing for empty stats", () => {
    const { container } = render(<StatBand stats={[]} />)
    expect(container.firstChild).toBeNull()
  })
  it("renders a sparkline svg when spark data is provided", () => {
    const { container } = render(
      <StatBand stats={[{ label: "Published", value: 45, spark: [1, 4, 2, 6, 5], trend: "up" }]} />
    )
    expect(container.querySelector("svg")).toBeTruthy()
  })
})

describe("SidebarFooter", () => {
  it("variant=none renders nothing", () => {
    const { container } = render(<SidebarFooter variant="none" />)
    expect(container.firstChild).toBeNull()
  })
  it("variant=upgrade renders the card + CTA", () => {
    render(
      <SidebarFooter
        variant="upgrade"
        upgrade={{ title: "BunAdmin Pro", description: "Unlock more", cta: "Upgrade Now" }}
      />
    )
    expect(screen.getByText("BunAdmin Pro")).toBeTruthy()
    expect(screen.getByText("Upgrade Now")).toBeTruthy()
  })
  it("variant=stats renders the overview list", () => {
    render(
      <SidebarFooter
        variant="stats"
        statsTitle="System Overview"
        stats={[{ label: "Published", value: 862 }]}
      />
    )
    expect(screen.getByText("System Overview")).toBeTruthy()
    expect(screen.getByText("Published")).toBeTruthy()
    expect(screen.getByText("862")).toBeTruthy()
  })
})

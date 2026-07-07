import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

// Deterministic i18n: t() echoes the key; language is English.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "en" } })
}))

import DatePicker from "../ui/DatePicker"

describe("DatePicker", () => {
  it("shows the placeholder when empty and opens a calendar of days", () => {
    render(<DatePicker value={null} onChange={() => {}} placeholder="Pick a date" />)
    const trigger = screen.getByRole("button", { name: /Pick a date/ })
    fireEvent.click(trigger)
    expect(screen.getByRole("button", { name: "15" })).toBeInTheDocument()
  })

  it("falls back to the translated 'Select date' label with no placeholder", () => {
    render(<DatePicker value={null} onChange={() => {}} />)
    expect(screen.getByRole("button", { name: /Select date/ })).toBeInTheDocument()
  })

  it("renders a selected value and emits YYYY-MM-DD when a day is picked", () => {
    const onChange = vi.fn()
    render(<DatePicker value="2026-03-10" onChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: /2026/ }))
    fireEvent.click(screen.getByRole("button", { name: "20" }))
    expect(onChange).toHaveBeenCalledWith("2026-03-20")
  })

  it("emits null when Clear is clicked", () => {
    const onChange = vi.fn()
    render(<DatePicker value="2026-03-10" onChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: /2026/ }))
    fireEvent.click(screen.getByText("Clear"))
    expect(onChange).toHaveBeenCalledWith(null)
  })
})

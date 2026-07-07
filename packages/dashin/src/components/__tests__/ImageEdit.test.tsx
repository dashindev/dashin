import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ImageEdit from "../ui/ImageEdit"

const pick = (input: HTMLInputElement, file: File) => fireEvent.change(input, { target: { files: [file] } })

describe("ImageEdit", () => {
  it("uploads a picked file and stores the mapped value + preview", async () => {
    const onChange = vi.fn()
    const upload = vi.fn().mockResolvedValue({ id: 7, url: "/u/7.png" })
    const { container } = render(
      <ImageEdit value={null} onChange={onChange} upload={upload} toValue={r => r.id} resultUrl={r => r.url} />
    )
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(["x"], "a.png", { type: "image/png" })
    pick(input, file)
    await waitFor(() => expect(upload).toHaveBeenCalledWith(file))
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(7))
    await waitFor(() => expect(container.querySelector("img")).toHaveAttribute("src", "/u/7.png"))
  })

  it("shows an existing preview and clears on Remove", () => {
    const onChange = vi.fn()
    const { container } = render(
      <ImageEdit value={{ id: 1 }} onChange={onChange} upload={vi.fn()} previewUrl={() => "/existing.png"} />
    )
    expect(container.querySelector("img")).toHaveAttribute("src", "/existing.png")
    fireEvent.click(screen.getByText("Remove"))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it("surfaces an upload error", async () => {
    const upload = vi.fn().mockRejectedValue(new Error("boom"))
    const { container } = render(<ImageEdit value={null} onChange={() => {}} upload={upload} />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    pick(input, new File(["x"], "a.png"))
    await waitFor(() => expect(screen.getByText("boom")).toBeInTheDocument())
  })
})

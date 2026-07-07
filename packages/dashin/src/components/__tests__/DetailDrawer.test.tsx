import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import DetailDrawer from "../DetailDrawer"

const columns: any[] = [
  { title: "Name", field: "name" },
  { title: "Contract", field: "client", renderDetail: (r: any) => <span>card:{r.client}</span> }
]

describe("DetailDrawer enhancements", () => {
  it("mode='edit' opens straight into the edit form", () => {
    render(
      <DetailDrawer
        row={{ name: "A", client: "X" } as any}
        columns={columns}
        mode="edit"
        editable={{ onRowUpdate: async () => {} } as any}
        onClose={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
    expect(screen.getByDisplayValue("A")).toBeInTheDocument()
  })

  it("shows an error banner when the save fails and keeps the drawer open", async () => {
    const onClose = vi.fn()
    const onRowUpdate = vi
      .fn()
      .mockRejectedValue({ errors: [{ data: { errors: [{ message: "Value must be unique" }] } }] })
    render(
      <DetailDrawer
        row={{ name: "A" } as any}
        columns={columns}
        mode="edit"
        editable={{ onRowUpdate } as any}
        onClose={onClose}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(screen.getByText("Value must be unique")).toBeInTheDocument())
    expect(onClose).not.toHaveBeenCalled()
  })

  it("renderDetail overrides the plain cell in view mode", () => {
    render(
      <DetailDrawer row={{ name: "A", client: "42" } as any} columns={columns} mode="view" onClose={() => {}} />
    )
    expect(screen.getByText("card:42")).toBeInTheDocument()
  })

  it("view mode still shows the Edit button (no regression)", () => {
    render(
      <DetailDrawer
        row={{ name: "A" } as any}
        columns={columns}
        mode="view"
        editable={{ onRowUpdate: async () => {} } as any}
        onClose={() => {}}
      />
    )
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument()
  })
})

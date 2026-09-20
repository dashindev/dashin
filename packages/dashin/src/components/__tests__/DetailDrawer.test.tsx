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

  it("shows an error banner with role='alert' and aria-live='assertive' when save fails and keeps drawer open", async () => {
    const onClose = vi.fn()
    const onSaved = vi.fn()
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
        onSaved={onSaved}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => {
      const alert = screen.getByRole("alert")
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveAttribute("aria-live", "assertive")
      expect(alert).toHaveTextContent("Value must be unique")
    })
    expect(onClose).not.toHaveBeenCalled()
    expect(onSaved).not.toHaveBeenCalled()
  })

  it("shows an error banner with role='alert' and aria-live='assertive' when create fails and keeps drawer open", async () => {
    const onClose = vi.fn()
    const onSaved = vi.fn()
    const onRowAdd = vi
      .fn()
      .mockRejectedValue(new Error("Code already exists"))
    render(
      <DetailDrawer
        row={null}
        columns={columns}
        mode="create"
        editable={{ onRowAdd } as any}
        onClose={onClose}
        onSaved={onSaved}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Create" }))
    await waitFor(() => {
      const alert = screen.getByRole("alert")
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveAttribute("aria-live", "assertive")
      expect(alert).toHaveTextContent("Code already exists")
    })
    expect(onClose).not.toHaveBeenCalled()
    expect(onSaved).not.toHaveBeenCalled()
    expect(screen.getByRole("heading", { name: "New" })).toBeInTheDocument()
  })

  it("clears error banner when a field is edited", async () => {
    const onRowUpdate = vi
      .fn()
      .mockRejectedValue({ message: "Network error" })
    render(
      <DetailDrawer
        row={{ name: "A" } as any}
        columns={columns}
        mode="edit"
        editable={{ onRowUpdate } as any}
        onClose={() => {}}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument())

    // Edit the input field
    const input = screen.getByDisplayValue("A")
    fireEvent.change(input, { target: { value: "A modified" } })

    // Error banner should be gone
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("shows an error banner when delete fails and keeps drawer open", async () => {
    const onClose = vi.fn()
    const onSaved = vi.fn()
    const onRowDelete = vi
      .fn()
      .mockRejectedValue(new Error("Cannot delete referenced record"))
    render(
      <DetailDrawer
        row={{ name: "A" } as any}
        columns={columns}
        mode="edit"
        editable={{ onRowDelete, onRowUpdate: async () => {} } as any}
        onClose={onClose}
        onSaved={onSaved}
      />
    )

    // Click delete
    fireEvent.click(screen.getByRole("button", { name: "Delete" }))
    // Click confirm delete
    fireEvent.click(screen.getByTitle("Confirm delete"))

    await waitFor(() => {
      const alert = screen.getByRole("alert")
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent("Cannot delete referenced record")
    })
    expect(onClose).not.toHaveBeenCalled()
    expect(onSaved).not.toHaveBeenCalled()
  })

  it("client-side validation: blocks save on empty required string and empty array", async () => {
    const onRowAdd = vi.fn()
    const colsWithRequired = [
      { title: "Code", field: "code", required: true },
      { title: "Tags", field: "tags", required: "Tags are mandatory" }
    ]

    const { rerender } = render(
      <DetailDrawer
        row={null}
        columns={colsWithRequired}
        mode="create"
        editable={{ onRowAdd } as any}
        onClose={() => {}}
      />
    )

    // Draft is empty -> code is empty
    fireEvent.click(screen.getByRole("button", { name: "Create" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Code is required")
    expect(onRowAdd).not.toHaveBeenCalled()

    // Fill code, leave tags empty
    const codeInput = screen.getAllByRole("textbox")[0]
    fireEvent.change(codeInput, { target: { value: "PROD-1" } })
    fireEvent.click(screen.getByRole("button", { name: "Create" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Tags are mandatory")
    expect(onRowAdd).not.toHaveBeenCalled()
  })

  it("client-side validation: numeric 0 is valid and passes required check", async () => {
    const onRowUpdate = vi.fn().mockResolvedValue({})
    const onClose = vi.fn()
    const onSaved = vi.fn()
    const numericCols = [
      { title: "Price", field: "price", type: "numeric" as const, required: true }
    ]

    render(
      <DetailDrawer
        row={{ price: 100 } as any}
        columns={numericCols}
        mode="edit"
        editable={{ onRowUpdate } as any}
        onClose={onClose}
        onSaved={onSaved}
      />
    )

    const numInput = screen.getByDisplayValue("100")
    fireEvent.change(numInput, { target: { value: "0" } })
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(onRowUpdate).toHaveBeenCalledWith(expect.objectContaining({ price: 0 }), expect.anything()))
  })

  it("client-side validation: cleared numeric input is preserved as empty string and blocked by required", async () => {
    const onRowUpdate = vi.fn().mockResolvedValue({})
    const onClose = vi.fn()
    const onSaved = vi.fn()
    const numericCols = [
      { title: "Price", field: "price", type: "numeric" as const, required: true }
    ]

    render(
      <DetailDrawer
        row={{ price: 100 } as any}
        columns={numericCols}
        mode="edit"
        editable={{ onRowUpdate } as any}
        onClose={onClose}
        onSaved={onSaved}
      />
    )

    const numInput = screen.getByDisplayValue("100")
    fireEvent.change(numInput, { target: { value: "" } })
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Price is required")
    expect(onRowUpdate).not.toHaveBeenCalled()
  })

  it("client-side validation: custom validate function returning error message or false", async () => {
    const onRowAdd = vi.fn()
    const validateCols = [
      {
        title: "SKU",
        field: "sku",
        validate: (val: any) => {
          if (!val?.startsWith("SKU-")) return "SKU must start with SKU-"
          return true
        }
      },
      {
        title: "Score",
        field: "score",
        validate: (val: any) => val >= 10 // returns boolean
      }
    ]

    render(
      <DetailDrawer
        row={null}
        columns={validateCols}
        mode="create"
        editable={{ onRowAdd } as any}
        onClose={() => {}}
      />
    )

    const inputs = screen.getAllByRole("textbox")
    fireEvent.change(inputs[0], { target: { value: "BAD-1" } })
    fireEvent.click(screen.getByRole("button", { name: "Create" }))
    expect(screen.getByRole("alert")).toHaveTextContent("SKU must start with SKU-")
    expect(onRowAdd).not.toHaveBeenCalled()

    // Fix SKU, trigger score validation failure
    fireEvent.change(inputs[0], { target: { value: "SKU-99" } })
    fireEvent.change(inputs[1], { target: { value: "5" } })
    fireEvent.click(screen.getByRole("button", { name: "Create" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Score is invalid")
    expect(onRowAdd).not.toHaveBeenCalled()
  })

  it("allows retry after fixing error and closes drawer on success", async () => {
    const onClose = vi.fn()
    const onSaved = vi.fn()
    const onRowUpdate = vi
      .fn()
      .mockRejectedValueOnce(new Error("Duplicate entry"))
      .mockResolvedValueOnce({ ok: true })

    render(
      <DetailDrawer
        row={{ name: "A" } as any}
        columns={columns}
        mode="edit"
        editable={{ onRowUpdate } as any}
        onClose={onClose}
        onSaved={onSaved}
      />
    )

    // First attempt fails
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Duplicate entry"))
    expect(onClose).not.toHaveBeenCalled()

    // User fixes name
    const input = screen.getByDisplayValue("A")
    fireEvent.change(input, { target: { value: "A-unique" } })
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()

    // Second attempt succeeds
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
      expect(onSaved).toHaveBeenCalled()
    })
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

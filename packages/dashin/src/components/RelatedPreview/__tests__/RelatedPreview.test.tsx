import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { RelatedPreviewProvider, RelatedCard } from ".."

const clientRec = { id: 5, name: "Alice", contracts: { docs: [{ id: 1, number: "C-1" }] } }
const contractRec = { id: 1, number: "C-1", client: { id: 5, name: "Alice" } }

function makeRegistry(overrides: any = {}) {
  return {
    clients: {
      meta: {
        label: "Client",
        title: (r: any) => r.name,
        subtitle: (r: any) => `#${r.id}`,
        relations: [{ label: "Contracts", slug: "contracts", list: true, value: (r: any) => r.contracts }]
      },
      fetch: async () => clientRec,
      columns: [{ title: "Name", field: "name" }],
      editable: { onRowUpdate: vi.fn().mockResolvedValue({}) }
    },
    contracts: {
      meta: {
        label: "Contract",
        title: (r: any) => r.number,
        relations: [{ label: "Client", slug: "clients", value: (r: any) => r.client }]
      },
      fetch: async () => contractRec,
      columns: [{ title: "Number", field: "number" }],
      editable: { onRowUpdate: vi.fn().mockResolvedValue({}), ...(overrides.contractsEditable || {}) }
    }
  }
}

describe("RelatedPreview", () => {
  it("a lazy related card shows an error and resolves after retry", async () => {
    const registry = makeRegistry()
    registry.contracts.fetch = vi.fn().mockRejectedValueOnce(new Error("Relation offline")).mockResolvedValue(contractRec)
    render(<RelatedPreviewProvider collections={registry as any}><RelatedCard slug="contracts" value={1} /></RelatedPreviewProvider>)
    expect(await screen.findByRole("alert")).toHaveTextContent("Relation offline")
    fireEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(await screen.findByRole("button", { name: "C-1" })).toBeInTheDocument()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })
  it("shows failed fetch persistently and retries without losing the parent frame", async () => {
    const registry = makeRegistry()
    registry.contracts.fetch = vi.fn().mockRejectedValueOnce(new Error("Catalog unavailable")).mockResolvedValue(contractRec)
    render(<RelatedPreviewProvider collections={registry as any}><RelatedCard slug="contracts" value={contractRec} /></RelatedPreviewProvider>)
    fireEvent.click(screen.getByText("C-1"))
    expect(await screen.findByRole("alert")).toHaveTextContent("Catalog unavailable")
    fireEvent.click(screen.getByRole("button", { name: "Retry" }))
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument())
    expect(screen.getAllByRole("dialog")).toHaveLength(1)
  })
  it("clicking a card opens a preview with its summary + relations", async () => {
    render(
      <RelatedPreviewProvider collections={makeRegistry() as any}>
        <RelatedCard slug="contracts" value={contractRec} />
      </RelatedPreviewProvider>
    )
    fireEvent.click(screen.getByText("C-1")) // the card
    expect(await screen.findByText("Back")).toBeInTheDocument() // preview frame opened
    expect(screen.getByText("Client")).toBeInTheDocument() // relation section label
    expect(screen.getByText("Alice")).toBeInTheDocument() // related card inside the preview
  })

  it("drills into a relation (opens a second, deeper frame)", async () => {
    render(
      <RelatedPreviewProvider collections={makeRegistry() as any}>
        <RelatedCard slug="contracts" value={contractRec} />
      </RelatedPreviewProvider>
    )
    fireEvent.click(screen.getByText("C-1"))
    fireEvent.click(await screen.findByText("Alice"))
    // the client frame shows the client's own "Contracts" relation — unique to frame 2
    expect(await screen.findByText("Contracts")).toBeInTheDocument()
  })

  it("Edit opens the nested drawer; Save calls editable + onChanged", async () => {
    const onChanged = vi.fn()
    const onRowUpdate = vi.fn().mockResolvedValue({})
    render(
      <RelatedPreviewProvider collections={makeRegistry({ contractsEditable: { onRowUpdate } }) as any} onChanged={onChanged}>
        <RelatedCard slug="contracts" value={contractRec} />
      </RelatedPreviewProvider>
    )
    fireEvent.click(screen.getByText("C-1"))
    fireEvent.click(await screen.findByRole("button", { name: "Edit" }))
    fireEvent.click(await screen.findByRole("button", { name: "Save" }))
    await waitFor(() => expect(onRowUpdate).toHaveBeenCalled())
    await waitFor(() => expect(onChanged).toHaveBeenCalled())
  })

  it("respects the depth cap (deeper clicks are no-ops)", async () => {
    render(
      <RelatedPreviewProvider collections={makeRegistry() as any} cap={1}>
        <RelatedCard slug="contracts" value={contractRec} />
      </RelatedPreviewProvider>
    )
    fireEvent.click(screen.getByText("C-1")) // frame 1 (cap reached)
    fireEvent.click(await screen.findByText("Alice")) // would be frame 2 → blocked
    expect(screen.queryByText("Contracts")).toBeNull()
  })

  it("nested Edit: when save fails, DetailDrawer stays open with error banner and onChanged is not called", async () => {
    const onChanged = vi.fn()
    const onRowUpdate = vi.fn().mockRejectedValue(new Error("Nested update rejected by server"))
    render(
      <RelatedPreviewProvider collections={makeRegistry({ contractsEditable: { onRowUpdate } }) as any} onChanged={onChanged}>
        <RelatedCard slug="contracts" value={contractRec} />
      </RelatedPreviewProvider>
    )
    fireEvent.click(screen.getByText("C-1"))
    fireEvent.click(await screen.findByRole("button", { name: "Edit" }))
    fireEvent.click(await screen.findByRole("button", { name: "Save" }))
    await waitFor(() => {
      const alert = screen.getByRole("alert")
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent("Nested update rejected by server")
    })
    expect(onChanged).not.toHaveBeenCalled()
    // DetailDrawer remains visible with Save button
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
  })
})

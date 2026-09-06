/**
 * @vitest-environment jsdom
 */
import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { DynamicAtomoProvider, useAtomoModel } from "../src/components/DynamicAtomoProvider"
import DynamicAtomoEntity from "../src/components/DynamicAtomoEntity"
import { AtomoSchemaMeta } from "../src/types"

vi.mock("@dashin-dev/dashin", () => ({
  CrudTable: ({ title, columns }: any) => (
    <div data-testid="mock-crud-table">
      <h1>{title}</h1>
      <ul>
        {columns.map((c: any) => (
          <li key={c.field} data-testid={`col-${c.field}`}>
            {c.title} ({c.type}) {c.hidden ? "[hidden]" : "[visible]"}
          </li>
        ))}
      </ul>
    </div>
  ),
  CubeSpinner: () => <div data-testid="cube-spinner">Loading...</div>,
  notice: vi.fn(),
  storedToken: vi.fn().mockResolvedValue("token"),
  ENV: { MAIN_URL: "http://test.atomo" },
  EvaIcon: () => <span>icon</span>,
}))

const mockSchema: AtomoSchemaMeta = {
  models: {
    contacts: {
      tableName: "contacts",
      primaryKey: "id",
      fields: {
        id: { name: "id", type: "id", attributes: ["primary"] },
        name: { name: "name", type: "string", attributes: ["required"] },
        email: { name: "email", type: "email" },
        companyId: { name: "companyId", type: "relation" },
      },
      ui: {
        listView: ["name", "email"],
      },
    },
  },
}

const TestConsumer: React.FC<{ model: string }> = ({ model }) => {
  const { modelMeta, columns, loading } = useAtomoModel(model)
  if (loading) return <div>Loading...</div>
  return (
    <div>
      <span data-testid="model-name">{modelMeta?.tableName}</span>
      <span data-testid="col-count">{columns.length}</span>
    </div>
  )
}

describe("DynamicAtomoProvider and DynamicAtomoEntity", () => {
  it("provides schema and maps model columns to consumer hooks", () => {
    render(
      <DynamicAtomoProvider initialSchema={mockSchema}>
        <TestConsumer model="contacts" />
      </DynamicAtomoProvider>
    )

    expect(screen.getByTestId("model-name").textContent).toBe("contacts")
    expect(screen.getByTestId("col-count").textContent).toBe("4")
  })

  it("renders DynamicAtomoEntity using CrudTable", () => {
    render(
      <DynamicAtomoProvider initialSchema={mockSchema}>
        <DynamicAtomoEntity model="contacts" />
      </DynamicAtomoProvider>
    )

    expect(screen.getByTestId("mock-crud-table")).toBeTruthy()
    expect(screen.getByText("Contacts")).toBeTruthy()

    // listView fields should be visible
    expect(screen.getByTestId("col-name").textContent).toContain("[visible]")
    expect(screen.getByTestId("col-email").textContent).toContain("[visible]")

    // id should be hidden
    expect(screen.getByTestId("col-id").textContent).toContain("[hidden]")
  })

  it("shows not-found UI when model does not exist in schema", () => {
    render(
      <DynamicAtomoProvider initialSchema={mockSchema}>
        <DynamicAtomoEntity model="non_existent" />
      </DynamicAtomoProvider>
    )

    expect(screen.getByText("Model Not Found")).toBeTruthy()
    expect(screen.getByText(/Model 'non_existent' is not defined/)).toBeTruthy()
  })
})

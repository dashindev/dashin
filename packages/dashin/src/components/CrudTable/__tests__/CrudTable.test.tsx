import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: "en" } })
}))

// Light stand-ins for the heavy children (Table pulls in router/redux). We only
// assert CrudTable's own contribution: the view/create/edit state machine, the
// appended per-row action column, and how it wires onRowClick/onAdd.
vi.mock("../../Table", () => ({
  __esModule: true,
  default: ({ columns, data, onRowClick, onAdd }: any) => (
    <div>
      <button onClick={() => onAdd && onAdd()} disabled={!onAdd}>
        __add
      </button>
      {(Array.isArray(data) ? data : []).map((row: any, i: number) => (
        <div key={i} data-testid="row" onClick={e => onRowClick && onRowClick(e, row)}>
          {columns.map((c: any, j: number) => (
            <span key={j}>{c.render ? c.render(row) : row[c.field]}</span>
          ))}
        </div>
      ))}
    </div>
  ),
  TableHead: ({ title }: any) => <h1>{title}</h1>
}))
vi.mock("../../DetailDrawer", () => ({
  __esModule: true,
  default: ({ row, mode }: any) =>
    row || mode === "create" ? <div data-testid="drawer">drawer:{mode}</div> : null
}))

import CrudTable from ".."

const columns: any[] = [{ title: "Name", field: "name" }]
const data = [{ id: 1, name: "Alice" }]

describe("CrudTable", () => {
  it("opens the drawer in view on row click", () => {
    render(<CrudTable title="People" columns={columns} data={data as any} editable={{ onRowUpdate: async () => {} } as any} />)
    expect(screen.getByText("Alice")).toBeInTheDocument()
    fireEvent.click(screen.getByTestId("row"))
    expect(screen.getByTestId("drawer")).toHaveTextContent("drawer:view")
  })

  it("per-row Edit opens the drawer straight into edit mode", () => {
    render(<CrudTable title="People" columns={columns} data={data as any} editable={{ onRowUpdate: async () => {} } as any} />)
    fireEvent.click(screen.getByRole("button", { name: "Edit" }))
    expect(screen.getByTestId("drawer")).toHaveTextContent("drawer:edit")
  })

  it("Add opens the drawer in create mode", () => {
    render(<CrudTable title="People" columns={columns} data={data as any} editable={{ onRowAdd: async () => {} } as any} />)
    fireEvent.click(screen.getByRole("button", { name: "__add" }))
    expect(screen.getByTestId("drawer")).toHaveTextContent("drawer:create")
  })

  it("is read-only (no action column, Add disabled) when no editable is given", () => {
    render(<CrudTable title="People" columns={columns} data={data as any} />)
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull()
    expect(screen.getByRole("button", { name: "__add" })).toBeDisabled()
  })
})

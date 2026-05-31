import React from "react"
import { render, screen, fireEvent, within } from "@testing-library/react"
import Table from "../index"
import { Column } from "../models/material-table-shim"

// --- mocks: isolate Table from router / i18n / env ---
jest.mock("@/router", () => ({
  useRouter: () => ({ query: { group: "g", name: "n" }, push: jest.fn() })
}))
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k })
}))
jest.mock("@/utils", () => ({ ENV: { SITE_NAME: "Test" }, DynamicRoute: "/d" }))

interface Row {
  id: number
  name: string
  qty: number
  team: string
}

const columns: Column<Row>[] = [
  { title: "Id", field: "id", type: "numeric" },
  { title: "Name", field: "name" },
  { title: "Qty", field: "qty", type: "numeric" },
  { title: "Team", field: "team", defaultGroupOrder: 0 }
]

const data: Row[] = [
  { id: 1, name: "alpha", qty: 5, team: "A" },
  { id: 2, name: "beta", qty: 10, team: "B" },
  { id: 3, name: "gamma", qty: 15, team: "A" }
]

const baseOptions = { pageSize: 2, filtering: true }

describe("Table", () => {
  it("renders rows and the empty message", () => {
    render(<Table<Row> columns={columns} data={[]} options={baseOptions} />)
    expect(screen.getByText("emptyDataSourceMessage")).toBeInTheDocument()
  })

  it("paginates local data by pageSize", () => {
    render(<Table<Row> columns={columns} data={data} options={baseOptions} />)
    // page 1 shows 2 of 3
    expect(screen.getByText("alpha")).toBeInTheDocument()
    expect(screen.getByText("beta")).toBeInTheDocument()
    expect(screen.queryByText("gamma")).not.toBeInTheDocument()
    expect(screen.getByText("1-2 of 3")).toBeInTheDocument()
  })

  it("filters local data with the default contains operator", () => {
    render(<Table<Row> columns={columns} data={data} options={baseOptions} />)
    // the Name column free-text filter input (text type)
    const nameFilter = screen
      .getAllByRole("textbox")
      .find(el => (el as HTMLInputElement).type === "text")!
    fireEvent.change(nameFilter, { target: { value: "alpha" } })
    expect(screen.getByText("alpha")).toBeInTheDocument()
    expect(screen.queryByText("beta")).not.toBeInTheDocument()
  })

  it("invokes onRowDelete callback", () => {
    const onRowDelete = jest.fn().mockResolvedValue(undefined)
    render(
      <Table<Row>
        columns={columns}
        data={data}
        options={baseOptions}
        editable={{ onRowDelete }}
      />
    )
    fireEvent.click(screen.getAllByTitle("deleteTooltip")[0])
    expect(onRowDelete).toHaveBeenCalledWith(data[0])
  })

  it("calls remote query function with page/pageSize", () => {
    const query = jest
      .fn()
      .mockResolvedValue({ data: [], totalCount: 0, page: 0 })
    render(<Table<Row> columns={columns} data={query} options={baseOptions} />)
    expect(query).toHaveBeenCalled()
    const arg = query.mock.calls[0][0]
    expect(arg.page).toBe(0)
    expect(arg.pageSize).toBe(2)
  })

  it("groups rows by defaultGroupOrder column when grouping enabled", () => {
    render(
      <Table<Row>
        columns={columns}
        data={data}
        options={{ pageSize: 10, grouping: true }}
      />
    )
    // group headers render the team value and a count, e.g. "▾ A (2)"
    expect(screen.getAllByText("A").length).toBeGreaterThan(0)
    expect(screen.getByText(/\(2\)/)).toBeInTheDocument()
    expect(screen.getByText(/\(1\)/)).toBeInTheDocument()
  })
})

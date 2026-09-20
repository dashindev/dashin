import React from "react"
import { render, screen, fireEvent, within, cleanup, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, afterEach } from "vitest"
import Table from "../index"
import { Column } from "../models/material-table-shim"

// --- mocks: isolate Table from router / i18n / env ---
vi.mock("@/router", () => ({
  useRouter: () => ({ query: { group: "g", name: "n" }, push: vi.fn() })
}))
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k })
}))
vi.mock("@/utils", () => ({ ENV: { SITE_NAME: "Test" }, DynamicRoute: "/d" }))

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
  afterEach(() => {
    cleanup()
    sessionStorage.clear()
  })

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
    const onRowDelete = vi.fn().mockResolvedValue(undefined)
    render(
      <Table<Row>
        columns={columns}
        data={data}
        options={baseOptions}
        editable={{ onRowDelete }}
      />
    )
    fireEvent.click(screen.getAllByTitle("deleteTooltip")[0])
    fireEvent.click(screen.getAllByTitle("deleteTooltip")[0])
    expect(onRowDelete).toHaveBeenCalledWith(data[0])
  })

  it("calls remote query function with page/pageSize", () => {
    const query = vi
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

  it("inline edit save failure shows role='alert' error banner and keeps edit mode", async () => {
    const onRowUpdate = vi.fn().mockRejectedValue(new Error("Server update rejected"))
    render(
      <Table<Row>
        columns={columns}
        data={data}
        options={baseOptions}
        editable={{ onRowUpdate }}
      />
    )

    // Click edit on first row
    fireEvent.click(screen.getAllByTitle("editTooltip")[0])
    expect(screen.getByTitle("saveTooltip")).toBeInTheDocument()

    // Click save
    fireEvent.click(screen.getByTitle("saveTooltip"))

    // Error banner must appear with role="alert"
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Server update rejected")
    // Save button must remain visible (editing not cancelled)
    expect(screen.getByTitle("saveTooltip")).toBeInTheDocument()
  })

  it("inline delete failure shows role='alert' error banner", async () => {
    const onRowDelete = vi.fn().mockRejectedValue(new Error("Record is in use"))
    render(
      <Table<Row>
        columns={columns}
        data={data}
        options={baseOptions}
        editable={{ onRowDelete }}
      />
    )

    // Click delete -> confirm
    fireEvent.click(screen.getAllByTitle("deleteTooltip")[0])
    fireEvent.click(screen.getAllByTitle("deleteTooltip")[0])

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Record is in use")
  })

  it("inline edit blocks save on required column failure", async () => {
    const onRowUpdate = vi.fn()
    const colsWithReq: Column<Row>[] = [
      { title: "Name", field: "name", required: true },
      { title: "Qty", field: "qty", type: "numeric", required: true }
    ]

    render(
      <Table<Row>
        columns={colsWithReq}
        data={data}
        options={baseOptions}
        editable={{ onRowUpdate }}
      />
    )

    fireEvent.click(screen.getAllByTitle("editTooltip")[0])
    const nameInput = screen.getByDisplayValue("alpha")
    fireEvent.change(nameInput, { target: { value: "" } })

    fireEvent.click(screen.getByTitle("saveTooltip"))
    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("Name is required")
    expect(onRowUpdate).not.toHaveBeenCalled()
  })

  it("inline edit allows numeric 0", async () => {
    const onRowUpdate = vi.fn().mockResolvedValue({})
    const colsWithReq: Column<Row>[] = [
      { title: "Qty", field: "qty", type: "numeric", required: true }
    ]

    render(
      <Table<Row>
        columns={colsWithReq}
        data={data}
        options={baseOptions}
        editable={{ onRowUpdate }}
      />
    )

    fireEvent.click(screen.getAllByTitle("editTooltip")[0])
    const qtyInput = screen.getByDisplayValue("5")

    // Set to 0 -> should succeed
    fireEvent.change(qtyInput, { target: { value: "0" } })
    fireEvent.click(screen.getByTitle("saveTooltip"))
    expect(onRowUpdate).toHaveBeenCalledWith(expect.objectContaining({ qty: 0 }), expect.anything())
  })

  it("inline edit blocks cleared numeric string with required error", async () => {
    const onRowUpdate = vi.fn().mockResolvedValue({})
    const colsWithReq: Column<Row>[] = [
      { title: "Qty", field: "qty", type: "numeric", required: true }
    ]

    render(
      <Table<Row>
        columns={colsWithReq}
        data={data}
        options={baseOptions}
        editable={{ onRowUpdate }}
      />
    )

    fireEvent.click(screen.getAllByTitle("editTooltip")[0])
    const qtyInput = screen.getByDisplayValue("5")
    fireEvent.change(qtyInput, { target: { value: "" } })
    fireEvent.click(screen.getByTitle("saveTooltip"))
    expect(screen.getByRole("alert")).toHaveTextContent("Qty is required")
    expect(onRowUpdate).not.toHaveBeenCalled()
  })

  it("awaits a successful custom bulk action before clearing selection", async () => {
    let resolveAction: (() => void) | undefined
    const onClick = vi.fn(() => new Promise<void>(resolve => { resolveAction = resolve }))
    render(
      <Table<Row>
        columns={columns}
        data={data}
        options={{ ...baseOptions, selection: true }}
        actions={[{ icon: "bulk", tooltip: "custom bulk", onClick }]}
      />
    )

    const rowCheckbox = screen.getAllByRole("checkbox")[1] as HTMLInputElement
    fireEvent.click(rowCheckbox)
    fireEvent.click(screen.getByTitle("custom bulk"))
    expect(rowCheckbox.checked).toBe(true)

    resolveAction?.()
    await waitFor(() => expect(rowCheckbox.checked).toBe(false))
    expect(onClick).toHaveBeenCalledWith(expect.anything(), [data[0]])
  })

  it("keeps selection and shows an alert when a custom bulk action rejects", async () => {
    const onClick = vi.fn().mockRejectedValue(new Error("Bulk write rejected"))
    render(
      <Table<Row>
        columns={columns}
        data={data}
        options={{ ...baseOptions, selection: true }}
        actions={[{ icon: "bulk", tooltip: "custom bulk", onClick }]}
      />
    )

    const rowCheckbox = screen.getAllByRole("checkbox")[1] as HTMLInputElement
    fireEvent.click(rowCheckbox)
    fireEvent.click(screen.getByTitle("custom bulk"))

    expect(await screen.findByRole("alert")).toHaveTextContent("Bulk write rejected")
    expect(rowCheckbox.checked).toBe(true)
  })

  it("keeps only failed rows selected after a mappable partial bulk failure", async () => {
    const partial = Object.assign(new Error("1 of 2 failed"), {
      resList: [{ ok: true }, { error: "Row locked" }],
      failCount: 1
    })
    const onClick = vi.fn()
      .mockRejectedValueOnce(partial)
      .mockResolvedValueOnce(undefined)
    render(
      <Table<Row>
        columns={columns}
        data={data}
        options={{ ...baseOptions, selection: true }}
        actions={[{ icon: "bulk", tooltip: "custom bulk", onClick }]}
      />
    )

    let checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[]
    fireEvent.click(checkboxes[1])
    fireEvent.click(checkboxes[2])
    fireEvent.click(screen.getByTitle("custom bulk"))

    await screen.findByRole("alert")
    checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[]
    expect(checkboxes[1].checked).toBe(false)
    expect(checkboxes[2].checked).toBe(true)

    fireEvent.click(screen.getByTitle("custom bulk"))
    await waitFor(() => expect(checkboxes[2].checked).toBe(false))
    expect(onClick.mock.calls[1][1]).toEqual([data[1]])
  })

  it("keeps failed rows selected when built-in bulk delete rejects", async () => {
    const onRowDelete = vi.fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Delete row 2 failed"))
    render(
      <Table<Row>
        columns={columns}
        data={data}
        options={{ ...baseOptions, selection: true }}
        editable={{ onRowDelete }}
      />
    )

    let checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[]
    fireEvent.click(checkboxes[1])
    fireEvent.click(checkboxes[2])
    fireEvent.click(await screen.findByText("deleteTooltip"))

    expect(await screen.findByRole("alert")).toHaveTextContent("Delete row 2 failed")
    checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[]
    expect(checkboxes[1].checked).toBe(false)
    expect(checkboxes[2].checked).toBe(true)
    expect(onRowDelete).toHaveBeenCalledTimes(2)
  })

  it("keeps selection when built-in bulk update rejects", async () => {
    const onBulkUpdate = vi.fn().mockRejectedValue(new Error("Bulk update rejected"))
    render(
      <Table<Row>
        columns={columns}
        data={data}
        options={{ ...baseOptions, selection: true }}
        editable={{ onBulkUpdate }}
      />
    )

    const rowCheckbox = screen.getAllByRole("checkbox")[1] as HTMLInputElement
    fireEvent.click(rowCheckbox)
    fireEvent.click(screen.getByText("editTooltip"))

    expect(await screen.findByRole("alert")).toHaveTextContent("Bulk update rejected")
    expect(rowCheckbox.checked).toBe(true)
  })
})

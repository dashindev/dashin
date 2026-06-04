import { MaterialTableProps } from "./material-table-shim"

export const TableDefaultProps: MaterialTableProps<any> = {
  // default placeholder
  columns: [],
  data: [],
  // style
  style: { boxShadow: "none" },
  // localization
  localization: {
    pagination: {
      labelDisplayedRows: "{from}-{to} of {count}"
    },
    toolbar: {
      nRowsSelected: "{0} row(s) selected"
    },
    header: {
      actions: "Actions"
    },
    body: {
      emptyDataSourceMessage: "No records to display",
      filterRow: {
        filterTooltip: "Filter"
      }
    }
  },
  // options
  options: {
    addRowPosition: "first",
    draggable: false,
    selection: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50, 100]
  }
  // Bulk delete is handled natively by the Table's selection toolbar
  // (wires to editable.onRowDelete) — no placeholder action needed.
}

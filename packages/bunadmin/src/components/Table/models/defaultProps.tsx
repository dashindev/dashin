import { MaterialTableProps } from "./material-table-shim"
import EvaIcon from "react-eva-icons"
import React from "react"

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
  },
  // actions
  actions: [
    {
      tooltip: "Remove All Selected Users",
      icon: () => <EvaIcon name="trash-2-outline" size="large" fill="gray" />,
      onClick: (_evt, _data) => alert("Bulk delete rows not supported yet.")
    }
  ]
}

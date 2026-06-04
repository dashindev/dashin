import React from "react"
import { Column } from "@/components/Table/models/material-table-shim"
import Type from "./types"

export const columns = (): Column<Type>[] => [
  {
    title: "Avatar",
    field: "avatar",
    render: rowData => (
      <img
        style={{ width: 36, height: 36, borderRadius: "50%" }}
        src={rowData.avatar}
      />
    )
  },
  { title: "Id", field: "id" },
  { title: "First Name", field: "first_name" },
  { title: "Last Name", field: "last_name" }
]

export default columns

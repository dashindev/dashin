import { Column } from "@/components/Table/models/material-table-shim"
import Type from "./types"

export const columns = (): Column<Type>[] => [
  {
    title: "ID",
    field: "id",
    type: "numeric",
    width: 100,
    defaultSort: "desc"
  },
  {
    title: "Name",
    field: "name"
  },
  {
    title: "Content",
    field: "content"
  }
]

export default columns

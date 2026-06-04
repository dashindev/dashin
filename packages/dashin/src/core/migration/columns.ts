import { Column } from "@/components/Table/models/material-table-shim"
import { Type } from "./types"

export const Columns = ({ t }: any): Column<Type>[] => [
  { title: t("Name"), field: "name" },
  { title: t("Count"), field: "count" },
  { title: t("Key"), field: "primKey" }
]

import { Column } from "@/components/Table/models/material-table-shim"
import { Type } from "./types"

export const Columns = ({ t }: any): Column<Type>[] => [
  { title: t("Id"), field: "id", editable: "onAdd", grouping: false },
  { title: t("Team"), field: "team", defaultGroupOrder: 0 },
  { title: t("Group"), field: "group", defaultGroupOrder: 1 },
  { title: t("Name"), field: "name", grouping: false },
  { title: t("Label"), field: "label", grouping: false },
  {
    title: t("Customized"),
    field: "customized",
    lookup: { true: "True", false: "False" }
  },
  {
    title: t("Columns"),
    field: "columns",
    grouping: false,
    render: r => (r && r.columns ? "..." : "EMPTY")
  }
]

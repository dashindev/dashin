import { Column } from "@/components/Table/models/material-table-shim"
import { Type } from "./types"

export const Columns = ({ t }: any): Column<Type>[] => [
  { title: t("Id"), field: "id", editable: "onAdd" },
  { title: t("Name"), field: "name" },
  { title: t("Label"), field: "label" },
  { title: t("Slug"), field: "slug" },
  {
    title: t("Icon"),
    field: "icon",
    render: r => (r && r.icon ? r.icon : null)
  },
  {
    title: t("Icon Type"),
    field: "icon_type",
    lookup: { eva: "Eva Icon", material: "Material Icon", url: "Url Address" }
  },
  {
    title: t("Parent"),
    field: "parent",
    initialEditValue: "",
    defaultGroupOrder: 0
  },
  {
    title: t("Parent"),
    field: "parent",
    initialEditValue: ""
  },
  { title: t("Rank"), field: "rank", type: "numeric", initialEditValue: "0" }
]

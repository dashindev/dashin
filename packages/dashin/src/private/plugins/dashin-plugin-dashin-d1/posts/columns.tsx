import { TFunction } from "i18next"
import { Column } from "@/components/Table/models/material-table-shim"
import Type from "./types"

export const columns = ({ t }: { t: TFunction }): Column<Type>[] => [
  { title: t("Id"), field: "id", editable: "never", width: 90 },
  { title: t("Title"), field: "title" },
  {
    title: t("Status"),
    field: "status",
    lookup: { draft: t("Draft"), published: t("Published") }
  },
  { title: t("Views"), field: "views", type: "numeric" }
]

export default columns

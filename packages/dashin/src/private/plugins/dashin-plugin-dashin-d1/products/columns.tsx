import { TFunction } from "i18next"
import { Column } from "@/components/Table/models/material-table-shim"
import Type from "./types"

export const columns = ({ t }: { t: TFunction }): Column<Type>[] => [
  { title: t("Id"), field: "id", editable: "never", width: 90 },
  { title: t("Name"), field: "name" },
  { title: t("Price"), field: "price", type: "numeric" },
  {
    title: t("In stock"),
    field: "in_stock",
    lookup: { 1: t("In stock"), 0: t("Out of stock") }
  }
]

export default columns

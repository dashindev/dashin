import { TFunction } from "i18next"
import { Column } from "@/components/Table/models/material-table-shim"
import Type from "./types"
import { CATEGORY_LOOKUP, PRODUCT_STATUS_LOOKUP, money } from "../lookups"

export const columns = ({ t }: { t: TFunction }): Column<Type>[] => [
  { title: t("Id"), field: "id", editable: "never", width: 80 },
  { title: t("Name"), field: "name" },
  { title: t("Category"), field: "category_id", lookup: CATEGORY_LOOKUP },
  {
    title: t("Price"),
    field: "price",
    type: "numeric",
    render: (row: Type) => money(row.price)
  },
  { title: t("Stock"), field: "stock", type: "numeric" },
  { title: t("Status"), field: "status", lookup: PRODUCT_STATUS_LOOKUP }
]

export default columns

import React from "react"
import { TFunction } from "i18next"
import { Column } from "@/components/Table/models/material-table-shim"
import { RelatedCard } from "@/components/RelatedPreview"
import Type from "./types"
import { CUSTOMER_LOOKUP, ORDER_STATUS_LOOKUP, money } from "../lookups"

export const columns = ({ t }: { t: TFunction }): Column<Type>[] => [
  { title: t("Id"), field: "id", editable: "never", width: 80 },
  {
    title: t("Customer"),
    field: "customer_id",
    lookup: CUSTOMER_LOOKUP,
    renderDetail: (row: Type) => <RelatedCard slug="customers" value={row.customer_id} />
  },
  {
    title: t("Total"),
    field: "total",
    type: "numeric",
    render: (row: Type) => money(row.total)
  },
  { title: t("Status"), field: "status", lookup: ORDER_STATUS_LOOKUP },
  { title: t("Date"), field: "created_at", editable: "never", width: 130 }
]

export default columns

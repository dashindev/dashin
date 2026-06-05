import { TFunction } from "i18next"
import { Column } from "@/components/Table/models/material-table-shim"
import Type from "./types"

export const columns = ({ t }: { t: TFunction }): Column<Type>[] => [
  { title: t("Id"), field: "id", editable: "never", width: 80 },
  { title: t("Name"), field: "name" },
  { title: t("Email"), field: "email" },
  { title: t("Country"), field: "country", width: 110 },
  { title: t("Joined"), field: "created_at", editable: "never", width: 130 }
]

export default columns

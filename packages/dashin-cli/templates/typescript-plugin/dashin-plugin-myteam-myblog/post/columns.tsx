import { Column } from "@dashin-dev/dashin"
import Type from "./types"
import { TFunction } from 'i18next';

export default function Columns({ t }: { t: TFunction }): Column<Type>[] {
  return [
    {
      title: "ID",
      field: "id",
      type: "numeric",
      width: 100,
      defaultSort: "desc"
    },
    {
      title: t("Name"),
      field: "name"
    },
    {
      title: "Content",
      field: "content"
    }
  ]
}

import { Column } from "material-table"
import Type from "./types"
import { TFunction } from 'i18next';
import { RefObject } from "react";

export default function Columns({ t }: { t: TFunction; tableRef: RefObject<any> }): Column<Type>[] {
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

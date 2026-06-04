import React from "react"
import { Column } from "@/components/Table/models/material-table-shim"
import Type from "./types"
import { SchemaName } from "./plugin"
import { ListSelector, PluginColumns } from "@dashin-dev/dashin"
import { dataCtrl } from "@dashin-dev/source-strapi"

const columns = ({ t }: PluginColumns): Column<Type>[] => [
  {
    title: t("Id"),
    field: "id",
    editable: "never",
    width: 80,
    defaultSort: "desc"
  },
  { title: t("Name"), field: "name", width: 150 },
  {
    title: t("Parent"),
    field: "parent_category",
    initialEditValue: "",
    grouping: false,
    width: 200,
    render: r => r.parent_category && r.parent_category.name,
    editComponent: props => (
      <ListSelector
        width={150}
        columnDef={props.columnDef}
        editProps={props}
        optionField={"name"}
        querySer={tableQuery =>
          dataCtrl({
            t,
            tableQuery: { ...tableQuery, search: "true" },
            path: SchemaName,
            searchField: "parent_category.id",
            searchSuffix: "_null"
          })
        }
      />
    )
  },
  {
    title: t("Updated At"),
    field: "updated_at",
    editable: "never",
    width: 135,
    type: "datetime",
    filtering: false
  }
]

export default columns

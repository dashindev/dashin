import React from "react"
import { Column } from "@/components/Table/models/material-table-shim"
import Type from "./types"
import {
  PluginColumns,
  MultipleSelector,
  ListSelector
} from "@dashin-dev/dashin"

import { ENUM_STATUS } from "./plugin"
import { FileUploader } from "@dashin-dev/upload-strapi"
import { dataCtrl } from "@dashin-dev/source-strapi"
import { SchemaName } from "../category/plugin"
import { RichTextEditor } from "@dashin-dev/rich-text-editor"

export default ({ t }: PluginColumns): Column<Type>[] => [
  {
    title: t("Id"),
    field: "id",
    editable: "never",
    type: "numeric",
    width: 80,
    defaultSort: "desc"
  },
  {
    title: t("Status"),
    field: "status",
    width: 135,
    lookup: ENUM_STATUS(t),
    render: data =>
      data && data.status ? (
        <span className="inline-block rounded-full bg-primary px-2 py-0.5 text-xs text-white">{ENUM_STATUS(t)[data.status]}</span>
      ) : (
        <span className="inline-block rounded-full bg-primary px-2 py-0.5 text-xs text-white">{ENUM_STATUS(t)["Draft"]}</span>
      ),
    filterComponent: props => (
      <MultipleSelector {...props} valueToLowerCase={false} />
    )
  },
  { title: t("Name"), field: "name", width: 115 },
  {
    title: t("Albums"),
    field: "albums",
    filtering: false,
    width: 300,
    editComponent: editProps => (
      <FileUploader
        t={t}
        viewMode={false}
        noDrawer={true}
        editProps={editProps}
        data={editProps.rowData.albums}
      />
    ),
    render: (rowData: Type) =>
      rowData && <FileUploader data={rowData.albums} t={t} noDrawer={true} />
  },
  {
    title: t("Category"),
    field: "category",
    initialEditValue: "",
    grouping: false,
    width: 200,
    render: r => r.category && r.category.name,
    editComponent: props => (
      <ListSelector
        width={150}
        columnDef={props.columnDef}
        editProps={props}
        optionField={"name"}
        querySer={tableQuery =>
          dataCtrl({
            t,
            tableQuery,
            path: SchemaName,
            searchField: "name"
          })
        }
      />
    )
  },
  {
    title: t("content"),
    field: "content",
    editComponent: props => <RichTextEditor editProps={props} />,
    render: data => <RichTextEditor previewValue={data.content} />
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

import React from "react"
import { Column } from "material-table"
import Type from "./types"
import {
  PluginColumns,
  MultipleSelector,
  ListSelector
} from "@xbuilder/bunadmin"
import { Chip } from "@material-ui/core"
import { ENUM_STATUS } from "./plugin"
import { FileUploader } from "@xbuilder/bunadmin-upload-strapi"
import { dataCtrl } from "@xbuilder/bunadmin-source-strapi"
import { SchemaName } from "../category/plugin"
import { RichTextEditor } from "@xbuilder/bunadmin-rich-text-editor"

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
        <Chip label={ENUM_STATUS(t)[data.status]} color="primary" />
      ) : (
        <Chip label={ENUM_STATUS(t)["Draft"]} color="primary" />
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

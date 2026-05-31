import { Column } from "@xbuilder/bunadmin"
import Type from "./types"
import React from "react"

import { BunadminFile, ENV } from "@xbuilder/bunadmin"

const prefix = ENV.UPLOAD_URL

export default ({ t }: any) =>
  [
    {
      title: t("Id"),
      field: "id",
      type: "numeric",
      editable: "never",
      width: 100
    },
    {
      title: t("Preview"),
      field: "file_name",
      width: 180,
      filtering: false,
      editable: false,
      render: rowData => (
        <BunadminFile
          width={80}
          viewMode={true}
          prefix={prefix}
          file={rowData}
        />
      )
    },
    { title: t("Name"), field: "name", width: 115 },
    { title: t("Size"), field: "size", width: 100, editable: false },
    { title: t("Type"), field: "mime", width: 115, editable: false },
    {
      title: t("User"),
      field: "created_by.username",
      width: 100,
      editable: false,
      render: r => r.created_by?.username
    },
    {
      title: t("File URL"),
      field: "url",
      width: 115,
      editable: false,
      render: r => (
        <button title={r.url} className="text-primary hover:underline">Show</button>
      )
    },
    {
      title: t("Created At"),
      field: "created_at",
      editable: "never",
      grouping: false,
      defaultSort: "desc",
      filtering: false,
      render: r => r && new Date(r.created_at).toLocaleString()
    },
    {
      title: t("Updated At"),
      field: "updated_at",
      editable: "never",
      grouping: false,
      filtering: false,
      render: r => (r ? new Date(r.updated_at).toLocaleString() : "")
    }
  ] as Column<Type>[]

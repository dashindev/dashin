import { Column } from "material-table"
import Type from "./types"
import { TFunction } from "i18next"
import React from "react"
import { SingleSelector } from "@bunred/bunadmin"

export default ({ t, roleLookup }: { t: TFunction; roleLookup: object }) =>
  [
    {
      title: t("Id"),
      field: "id",
      editable: "never",
      width: 135,
      type: "numeric"
    },
    { title: t("Username"), field: "username", width: 125 },
    { title: t("Email"), field: "email", width: 135 },
    {
      title: t("Password"),
      field: "password",
      width: 100,
      filtering: false,
      render: () => "******"
    },
    {
      title: t("Role"),
      field: "role",
      width: 125,
      lookup: roleLookup,
      render: r => {
        const role = r.role && r.role.name
        return role && t(role)
      },
      editComponent: editProps => (
        <SingleSelector columnDef={editProps.columnDef} editProps={editProps} />
      ),
      filterComponent: filterProps => {
        return (
          <SingleSelector
            columnDef={filterProps.columnDef}
            filterProps={{ ...filterProps, onFilterField: "role.id" }}
          />
        )
      }
    },
    {
      title: t("Blocked"),
      field: "blocked",
      type: "boolean",
      width: 100
    },
    {
      title: t("Confirmed"),
      field: "confirmed",
      type: "boolean",
      width: 100
    },
    {
      title: t("Created At"),
      field: "created_at",
      editable: "never",
      filtering: false,
      defaultSort: "desc",
      width: 135,
      render: r => r && new Date(r.created_at).toLocaleString()
    },
    {
      title: t("Updated At"),
      field: "updated_at",
      editable: "never",
      filtering: false,
      width: 135,
      render: r => (r ? new Date(r.updated_at).toLocaleString() : "")
    }
  ] as Column<Type>[]

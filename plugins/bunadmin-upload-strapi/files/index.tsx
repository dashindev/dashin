import React from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps
} from "@xbuilder/bunadmin"
import { Query } from "@xbuilder/bunadmin"

import { SchemaLabel, SchemaColumns } from "./plugin"
import editableCtrl from "./controllers/editableCtrl"
import { useTranslation } from "react-i18next"
import { dataCtrl } from "@xbuilder/bunadmin-source-strapi"
import { SchemaName } from "./plugin"
import Type from "./types"

const theme = { bunadmin: { iconColor: "#8f9bb3" } }

export default function media() {
  const { t } = useTranslation("table")

  return (
    <>
      <TableHead title={t(SchemaLabel)} />
      <Table
        title={t(SchemaLabel)}
        columns={SchemaColumns({ t })}
        editable={editableCtrl()}
        style={DefaultProps.style}
        icons={tableIcons({ theme })}
        options={{
          ...DefaultProps.options,
          selection: false,
          filtering: true
        }}
        data={async (tableQuery: Query<Type>) =>
          await dataCtrl({
            t,
            tableQuery,
            path: `upload/${SchemaName}`
          })
        }
      />
    </>
  )
}

import React from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps
} from "@xbuilder/bunadmin"
import { Query } from "material-table"
import { useTheme } from "@material-ui/core/styles"

import { SchemaLabel, SchemaColumns } from "./plugin"
import editableCtrl from "./controllers/editableCtrl"
import { useTranslation } from "react-i18next"
import { dataCtrl } from "bunadmin-source-strapi"
import { SchemaName } from "./plugin"
import Type from "./types"

export default function media() {
  const { t } = useTranslation("table")
  const theme = useTheme()

  return (
    <>
      <TableHead title={t(SchemaLabel)} />
      <Table
        title={t(SchemaLabel)}
        columns={SchemaColumns({ t })}
        editable={editableCtrl()}
        // style
        style={DefaultProps.style}
        // icons
        icons={tableIcons({ theme })}
        // options
        options={{
          ...DefaultProps.options,
          selection: false,
          filtering: true
        }}
        // data
        data={async (tableQuery: Query<Type>) =>
          await dataCtrl({
            t,
            tableQuery,
            path: `upload/${SchemaName}`,
            fixCount: true
          })
        }
      />
    </>
  )
}

import React, { createRef } from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps
} from "@xbuilder/bunadmin"
import { useTheme } from "@material-ui/core/styles"

import { SchemaLabel, SchemaColumns, SchemaName } from "./plugin"
import { useTranslation } from "@xbuilder/bunadmin"
import {
  bulkDeleteCtrl,
  dataCtrl,
  editableCtrl
} from "@xbuilder/bunadmin-source-strapi"
import Type from "./types"

export default function Post() {
  const { t } = useTranslation("table")
  const theme = useTheme()
  const tableRef = createRef()

  return (
    <>
      <TableHead title={t(SchemaLabel)} />
      <Table<Type>
        tableRef={tableRef}
        title={t(SchemaLabel)}
        columns={SchemaColumns({ t, tableRef })}
        style={DefaultProps.style}
        icons={tableIcons({ theme })}
        options={{
          ...DefaultProps.options,
          filtering: true
        }}
        data={async (tableQuery: any) =>
          await dataCtrl({
            t,
            tableQuery,
            path: SchemaName,
            searchField: "name"
          })
        }
        editable={editableCtrl({ t, SchemaName })}
        actions={[bulkDeleteCtrl({ SchemaName, t, tableRef })]}
      />
    </>
  )
}

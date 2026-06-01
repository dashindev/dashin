import React, { createRef } from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps
} from "@dashin-dev/dashin"

import { SchemaLabel, SchemaColumns, SchemaName } from "./plugin"
import { useTranslation } from "@dashin-dev/dashin"
import {
  bulkDeleteCtrl,
  dataCtrl,
  editableCtrl
} from "@dashin-dev/source-strapi"
import Type from "./types"

const theme = { bunadmin: { iconColor: "#8f9bb3" } }

export default function Post() {
  const { t } = useTranslation("table")
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

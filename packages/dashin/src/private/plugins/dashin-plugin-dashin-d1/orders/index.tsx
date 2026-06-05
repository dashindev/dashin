import React, { createRef } from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps,
  useTranslation
} from "@dashin-dev/dashin"
import { bulkDeleteCtrl, dataCtrl, editableCtrl } from "@dashin-dev/source-d1"

import { SchemaLabel, SchemaColumns, SchemaName } from "./plugin"
import Type from "./types"

const theme = { dashin: { iconColor: "#8f9bb3" } }

export default function Orders() {
  const { t } = useTranslation("table")
  const tableRef = createRef()

  return (
    <>
      <TableHead title={t(SchemaLabel)} />
      <Table<Type>
        tableRef={tableRef}
        title={t(SchemaLabel)}
        columns={SchemaColumns({ t })}
        style={DefaultProps.style}
        icons={tableIcons({ theme })}
        options={{ ...DefaultProps.options, filtering: true }}
        data={async (tableQuery: any) =>
          await dataCtrl({ t, tableQuery, path: SchemaName, searchField: "status" })
        }
        editable={editableCtrl({ t, SchemaName })}
        actions={[bulkDeleteCtrl({ SchemaName, t, tableRef })]}
      />
    </>
  )
}

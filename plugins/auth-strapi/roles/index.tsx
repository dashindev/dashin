import React, { createRef } from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps
} from "@dashin-dev/dashin"

import { SchemaLabel, SchemaColumns } from "./plugin"
import editableCtrl from "./controllers/editableCtrl"
import { useTranslation } from "@dashin-dev/dashin"
import { dataCtrl } from "@dashin-dev/source-strapi"
import listSer from "./services/listSer"

const theme = { bunadmin: { iconColor: "#8f9bb3" } }

export default function() {
  const { t } = useTranslation("table")
  const tableRef = createRef()

  return (
    <>
      <TableHead title={t(SchemaLabel)} />
      <Table
        tableRef={tableRef}
        title={t(SchemaLabel)}
        columns={SchemaColumns({ t })}
        editable={editableCtrl({})}
        style={DefaultProps.style}
        icons={tableIcons({ theme })}
        options={{
          ...DefaultProps.options,
          filtering: false,
          selection: false,
          sorting: false,
          search: false
        }}
        data={async tableQuery =>
          await dataCtrl({
            t,
            tableQuery,
            listService: () => listSer(tableQuery)
          })
        }
      />
    </>
  )
}

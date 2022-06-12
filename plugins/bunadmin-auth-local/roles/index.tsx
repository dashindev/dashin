import React, { createRef } from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps
} from "@bunred/bunadmin"
import { useTheme } from "@material-ui/core/styles"

import { SchemaLabel, SchemaColumns } from "./plugin"
import editableCtrl from "./controllers/editableCtrl"
import { useTranslation } from "@bunred/bunadmin"
import { dataCtrl } from "bunadmin-source-strapi"
import listSer from "./services/listSer"

export default function() {
  const { t } = useTranslation("table")
  const theme = useTheme()
  const tableRef = createRef()

  return (
    <>
      <TableHead title={t(SchemaLabel)} />
      <Table
        tableRef={tableRef}
        title={t(SchemaLabel)}
        columns={SchemaColumns({ t })}
        editable={editableCtrl({})}
        // style
        style={DefaultProps.style}
        // icons
        icons={tableIcons({ theme })}
        // options
        options={{
          ...DefaultProps.options,
          filtering: false,
          selection: false,
          sorting: false,
          search: false
        }}
        // data
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

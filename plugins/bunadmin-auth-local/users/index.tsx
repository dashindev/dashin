import React, { createRef, useEffect, useState } from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps,
  notice
} from "@bunred/bunadmin"
import { useTheme } from "@material-ui/core/styles"

import { SchemaLabel, SchemaColumns, SchemaName } from "./plugin"
import editableCtrl from "./controllers/editableCtrl"
import { useTranslation } from "@bunred/bunadmin"
import { dataCtrl } from "bunadmin-source-strapi"
import listSer from "../roles/services/listSer"
import { IRole } from "../utils/types"

export default function<RowData extends object>() {
  const { t } = useTranslation("table")
  const theme = useTheme()
  const tableRef = createRef()
  const [roleLookup, setRoleLookup] = useState({})

  useEffect(() => {
    ;(async () => {
      const { data, errors } = await listSer<RowData>()
      if (errors) {
        await notice({
          title: t("Request Failed"),
          severity: "error",
          content: JSON.stringify(errors)
        })
        return
      } else {
        let obj: any = {}
        data.map((item: IRole) => {
          obj[item.id] = item.name
        })
        setRoleLookup(obj)
      }
    })()
  }, [])

  return (
    <>
      <TableHead title={t(SchemaLabel)} />
      <Table
        tableRef={tableRef}
        title={t(SchemaLabel)}
        columns={SchemaColumns({ t, roleLookup })}
        editable={editableCtrl({})}
        // style
        style={DefaultProps.style}
        // icons
        icons={tableIcons({ theme })}
        // options
        options={{
          ...DefaultProps.options,
          filtering: true
        }}
        // data
        data={async tableQuery =>
          await dataCtrl({
            t,
            tableQuery,
            path: SchemaName,
            searchField: "username",
            skipCount: true
          })
        }
      />
    </>
  )
}

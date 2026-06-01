import React, { createRef, useEffect, useState } from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps,
  notice
} from "@dashin-dev/dashin"

import { SchemaLabel, SchemaColumns, SchemaName } from "./plugin"
import editableCtrl from "./controllers/editableCtrl"
import { useTranslation } from "@dashin-dev/dashin"
import { dataCtrl } from "@dashin-dev/source-strapi"
import listSer from "../roles/services/listSer"
import { IRole } from "../utils/types"

const theme = { bunadmin: { iconColor: "#8f9bb3" } }

export default function<RowData extends object>() {
  const { t } = useTranslation("table")
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
        style={DefaultProps.style}
        icons={tableIcons({ theme })}
        options={{
          ...DefaultProps.options,
          filtering: true
        }}
        data={async tableQuery => {
          const data = await dataCtrl({
            t,
            tableQuery,
            path: SchemaName,
            searchField: "username"
          })
          return {
            ...data,
            page: 0,
            totalCount: data.data.length
          }
        }}
      />
    </>
  )
}

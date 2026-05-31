import React, { createRef } from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps
} from "@xbuilder/bunadmin"

import { SchemaLabel, SchemaColumns } from "./plugin"
import dataCtrl from "./controllers/dataCtrl"
import { useTranslation } from "react-i18next"

const theme = { bunadmin: { iconColor: "#8f9bb3" } }

export default function list() {
  const { t } = useTranslation("table")
  const tableRef = createRef()

  return (
    <>
      <TableHead title={t(SchemaLabel)} />
      <Table
        tableRef={tableRef}
        title={t(SchemaLabel)}
        columns={SchemaColumns({ t })}
        style={DefaultProps.style}
        icons={tableIcons({ theme })}
        options={{
          ...DefaultProps.options,
          filtering: true
        }}
        data={async query => await dataCtrl(query)}
      />
    </>
  )
}

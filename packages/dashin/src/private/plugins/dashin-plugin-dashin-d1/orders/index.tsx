import React, { createRef, useCallback, useMemo, useState } from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps,
  DetailDrawer,
  useTranslation
} from "@dashin-dev/dashin"
import { bulkDeleteCtrl, dataCtrl, editableCtrl } from "@dashin-dev/source-d1"

import { SchemaLabel, SchemaColumns, SchemaName } from "./plugin"
import Type from "./types"

const theme = { dashin: { iconColor: "#8f9bb3" } }

export default function Orders() {
  const { t } = useTranslation("table")
  const tableRef = createRef()
  const [drawerRow, setDrawerRow] = useState<Type | null>(null)
  const [drawerMode, setDrawerMode] = useState<"view" | "create">("view")
  const [refreshKey, setRefreshKey] = useState(0)
  const cols = useMemo(() => SchemaColumns({ t }), [t])
  const editable = useMemo(() => editableCtrl({ t, SchemaName }), [t])

  const data = useCallback(
    async (tableQuery: any) =>
      await dataCtrl({ t, tableQuery, path: SchemaName, searchField: "status" }) as any,
    [t]
  )

  const reload = () => setRefreshKey(k => k + 1)
  const openCreate = () => { setDrawerRow(null); setDrawerMode("create") }
  const closeDrawer = () => { setDrawerRow(null); setDrawerMode("view") }

  return (
    <>
      <TableHead title={t(SchemaLabel)} />
      <Table<Type>
        key={refreshKey}
        tableRef={tableRef}
        title={t(SchemaLabel)}
        columns={cols}
        style={DefaultProps.style}
        icons={tableIcons({ theme })}
        options={{ ...DefaultProps.options, filtering: true }}
        data={data}
        editable={editable}
        actions={[bulkDeleteCtrl({ SchemaName, t, tableRef })]}
        onRowClick={(_e, row) => { if (row) { setDrawerMode("view"); setDrawerRow(row) } }}
        onAdd={openCreate}
      />
      <DetailDrawer
        row={drawerRow}
        columns={cols}
        editable={editable}
        mode={drawerMode}
        onClose={closeDrawer}
        onSaved={reload}
      />
    </>
  )
}

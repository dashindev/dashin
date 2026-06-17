import React, { createRef, useMemo, useState } from "react"
import {
  Table,
  TableHead,
  tableIcons,
  TableDefaultProps as DefaultProps,
  DetailDrawer,
  useTranslation,
  notice
} from "@dashin-dev/dashin"
import { SchemaLabel, SchemaColumns } from "./plugin"
import Type from "./types"

const theme = { dashin: { iconColor: "#8f9bb3" } }

export default function Post() {
  const { t } = useTranslation("table")
  const tableRef = createRef()
  const [drawerRow, setDrawerRow] = useState<Type | null>(null)
  const [drawerMode, setDrawerMode] = useState<"view" | "create">("view")
  const [refreshKey, setRefreshKey] = useState(0)
  const cols = useMemo(() => SchemaColumns({ t, tableRef }), [t])

  const editable = useMemo(
    () => ({
      onRowAdd: async (newData: Type) =>
        await notice({ title: "test create", content: newData }),
      onRowUpdate: async (newData: Type, oldData: Type) =>
        await notice({ title: "test update", content: { newData, oldData } }),
      onBulkUpdate: async (changes: any) =>
        await notice({ title: "test bulk update", content: changes }),
      onRowDelete: async (oldData: Type) =>
        await notice({ title: "test delete", content: oldData })
    }),
    []
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
        data={[
          { id: 1, name: "post 1", content: "content 1" },
          { id: 2, name: "post 2", content: "content 2" }
        ]}
        editable={editable}
        actions={[
          {
            tooltip: "Remove All Selected Rows",
            icon: "delete",
            onClick: async (_evt: any, data: Type[]) =>
              await notice({ title: "test bulk delete", content: data })
          }
        ]}
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

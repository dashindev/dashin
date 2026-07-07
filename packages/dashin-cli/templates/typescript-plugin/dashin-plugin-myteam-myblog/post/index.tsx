import React, { useMemo } from "react"
import { CrudTable, useTranslation, notice } from "@dashin-dev/dashin"
import { SchemaLabel, SchemaColumns } from "./plugin"
import Type from "./types"

export default function Post() {
  const { t } = useTranslation("table")

  const columns = useMemo(() => SchemaColumns({ t }), [t])

  const editable = useMemo(
    () => ({
      onRowAdd: async (newData: Type) =>
        await notice({ title: "test create", content: newData }),
      onRowUpdate: async (newData: Type, oldData: Type) =>
        await notice({ title: "test update", content: { newData, oldData } }),
      onRowDelete: async (oldData: Type) =>
        await notice({ title: "test delete", content: oldData })
    }),
    []
  )

  return (
    <CrudTable<Type>
      title={t(SchemaLabel)}
      columns={columns}
      data={[
        { id: 1, name: "post 1", content: "content 1" },
        { id: 2, name: "post 2", content: "content 2" }
      ]}
      editable={editable}
      actions={[
        {
          tooltip: "Remove All Selected Rows",
          icon: "delete",
          onClick: async (_evt: any, data: Type | Type[]) =>
            await notice({ title: "test bulk delete", content: data })
        }
      ]}
    />
  )
}

import React, { createRef, useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import CrudTable from "@/components/CrudTable"
import { RelatedPreviewProvider } from "@/components/RelatedPreview"
import { dataCtrl, editableCtrl, bulkDeleteCtrl } from "@dashin-dev/source-d1"
import { collections } from "../collections"

import { SchemaLabel, SchemaColumns, SchemaName } from "./plugin"
import Type from "./types"

export default function Customers() {
  const { t } = useTranslation("table")
  const tableRef = createRef()

  const columns = useMemo(() => SchemaColumns({ t }), [t])
  const editable = useMemo(() => editableCtrl({ t, SchemaName }), [t])
  const registry = useMemo(() => collections(t), [t])

  const data = useCallback(
    async (tableQuery: any) =>
      await dataCtrl({ t, tableQuery, path: SchemaName, searchField: "name" }) as any,
    [t]
  )

  return (
    <RelatedPreviewProvider collections={registry}>
      <CrudTable<Type>
        title={t(SchemaLabel)}
        columns={columns}
        data={data}
        editable={editable}
        actions={[bulkDeleteCtrl({ SchemaName, t, tableRef })]}
      />
    </RelatedPreviewProvider>
  )
}

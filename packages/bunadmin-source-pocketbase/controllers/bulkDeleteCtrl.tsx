import React from "react"
import { Action, BulkDeleteProps } from "@xbuilder/bunadmin"
// @ts-ignore
import EvaIcon from "react-eva-icons"
import bulkDeleteSer from "../services/bulkDeleteSer"

export default function bulkDeleteCtrl<RowData extends object>(
  props: BulkDeleteProps
): Action<RowData> {
  const { t, SchemaName, tableRef, primaryKey } = props

  return {
    tooltip: t("Delete all selected rows"),
    icon: () => <EvaIcon name="trash-2-outline" size="large" fill="gray" />,
    onClick: async (_event, data) => {
      data = data as RowData[]
      if (!data.length) return
      await bulkDeleteSer({ data, t, SchemaName, tableRef, primaryKey })
      tableRef.current && tableRef.current.onQueryChange()
    }
  }
}

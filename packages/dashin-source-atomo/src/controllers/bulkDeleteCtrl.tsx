import React from "react"
import { Action, notice } from "@dashin-dev/dashin"
import { EvaIcon } from "@dashin-dev/dashin"
import { atomoDeleteRecord } from "../client"
import { AtomoBulkDeleteCtrlProps } from "../types"

export default function bulkDeleteCtrl<RowData extends object = any>({
  model,
  t,
  tableRef,
  idField = "id",
  baseUrl,
}: AtomoBulkDeleteCtrlProps): Action<RowData> {
  return {
    tooltip: t ? t("Delete all selected rows") : "Delete all selected rows",
    icon: () => <EvaIcon name="trash-2-outline" size="large" fill="gray" />,
    onClick: async (_e, data) => {
      const rows = (Array.isArray(data) ? data : [data]) as RowData[]
      if (!rows.length) return

      const confirmMsg = t
        ? t(`Are you sure you want to delete ${rows.length} records?`)
        : `Are you sure you want to delete ${rows.length} records?`

      if (typeof window !== "undefined" && !window.confirm(confirmMsg)) {
        return
      }

      let successCount = 0
      let failCount = 0

      for (const row of rows) {
        const id = (row as any)?.[idField]
        if (!id) continue
        try {
          await atomoDeleteRecord(model, String(id), { baseUrl })
          successCount++
        } catch {
          failCount++
        }
      }

      if (failCount === 0) {
        await notice({
          title: t ? t("Successfully Deleted") : "Successfully Deleted",
          severity: "success",
          content: `${successCount} records removed`,
        })
      } else {
        await notice({
          title: t ? t("Partial Failure") : "Partial Failure",
          severity: "warning",
          content: `Deleted ${successCount}, failed ${failCount}`,
        })
      }

      if (tableRef?.current?.onQueryChange) {
        tableRef.current.onQueryChange()
      }
    },
  }
}

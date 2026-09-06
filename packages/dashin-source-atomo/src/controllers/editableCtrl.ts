import { EditableDataType, notice } from "@dashin-dev/dashin"
import { atomoCreateRecord, atomoDeleteRecord, atomoUpdateRecord } from "../client"
import { AtomoEditableCtrlProps } from "../types"

export default function editableCtrl<RowData extends object = any>({
  model,
  t,
  baseUrl,
  idField = "id",
  formatError,
}: AtomoEditableCtrlProps): EditableDataType<RowData> {
  const handleError = async (err: any, fallbackKey: string) => {
    const errorMsg = formatError
      ? formatError(err)
      : err?.message || (t ? t(fallbackKey) : fallbackKey)
    await notice({
      title: t ? t("Operation Failed") : "Operation Failed",
      severity: "error",
      content: errorMsg,
    })
    throw err
  }

  return {
    onRowAdd: async (newData: RowData) => {
      try {
        const res = await atomoCreateRecord<RowData>(model, newData as Record<string, any>, { baseUrl })
        await notice({
          title: t ? t("Successfully Created") : "Successfully Created",
          severity: "success",
        })
        return res
      } catch (err: any) {
        return await handleError(err, "Failed to create record")
      }
    },

    onRowUpdate: async (newData: RowData, oldData?: RowData) => {
      const id = (newData as any)?.[idField] || (oldData as any)?.[idField]
      if (!id) {
        const msg = t ? t("Record id is missing for update") : "Record id is missing"
        await notice({ title: msg, severity: "error" })
        throw new Error(msg)
      }
      try {
        const res = await atomoUpdateRecord<RowData>(model, String(id), newData as Record<string, any>, { baseUrl })
        await notice({
          title: t ? t("Successfully Updated") : "Successfully Updated",
          severity: "success",
        })
        return res
      } catch (err: any) {
        return await handleError(err, "Failed to update record")
      }
    },

    onRowDelete: async (oldData: RowData) => {
      const id = (oldData as any)?.[idField]
      if (!id) {
        const msg = t ? t("Record id is missing for deletion") : "Record id is missing"
        await notice({ title: msg, severity: "error" })
        throw new Error(msg)
      }
      try {
        await atomoDeleteRecord(model, String(id), { baseUrl })
        await notice({
          title: t ? t("Successfully Deleted") : "Successfully Deleted",
          severity: "success",
        })
      } catch (err: any) {
        return await handleError(err, "Failed to delete record")
      }
    },
  }
}

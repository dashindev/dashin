import { ENV, request, notice, BulkUpdateProps } from "@xbuilder/bunadmin"
import { sbHeaders, tablePath } from "./sbConfig"

export default async function bulkUpdateSer<T>({
  t,
  SchemaName,
  changes
}: BulkUpdateProps<T>) {
  const headers = await sbHeaders({ Prefer: "return=representation" })
  const resList: any[] = []
  let successCount = 0
  let failCount = 0
  const changesList = Object.values(changes)

  for (let i = 0; i < changesList.length; i++) {
    const { oldData, newData } = changesList[i] as any
    const res = await request(tablePath(SchemaName), {
      prefix: ENV.MAIN_URL || ENV.AUTH_URL,
      method: "PATCH",
      headers,
      params: { id: `eq.${oldData.id}` },
      data: newData
    })
    resList.push(res)
    if (res && res.code && res.code >= 400) {
      await notice({ title: t("Save Failed"), severity: "warning", content: JSON.stringify(oldData) })
      failCount++
    } else {
      successCount++
    }
  }

  const successMsg = successCount > 0 ? `, ${successCount} success` : ""
  const failedMsg = failCount > 0 ? `, ${failCount} failure.` : ""
  await notice({
    title: t(`Batch Request Completed`),
    severity: successCount === changesList.length ? "success" : failCount === changesList.length ? "error" : "info",
    content: `${changesList.length} items ${successMsg}${failedMsg}`
  })

  return resList
}

import { ENV, request, notice, BulkUpdateProps } from "@dashin-dev/dashin"
import { awHeaders, docPath } from "./awConfig"

export default async function bulkUpdateSer<T>({
  t,
  SchemaName,
  changes
}: BulkUpdateProps<T>) {
  const headers = await awHeaders()
  const resList: any[] = []
  let successCount = 0
  let failCount = 0
  const changesList = Object.values(changes)

  for (let i = 0; i < changesList.length; i++) {
    const { oldData, newData } = changesList[i] as any
    const res = await request(docPath(SchemaName, oldData.$id || oldData.id), {
      prefix: ENV.AUTH_URL,
      method: "PATCH",
      headers,
      data: { data: newData }
    })
    resList.push(res)

    if (res && res.code && res.code >= 400) {
      await notice({
        title: t("Save Failed"),
        severity: "warning",
        content: JSON.stringify(oldData)
      })
      failCount++
    } else {
      successCount++
    }
  }

  const successMsg = successCount > 0 ? `, ${successCount} success` : ""
  const failedMsg = failCount > 0 ? `, ${failCount} failure.` : ""
  await notice({
    title: t(`Batch Request Completed`),
    severity:
      successCount === changesList.length
        ? "success"
        : failCount === changesList.length
        ? "error"
        : "info",
    content: `${changesList.length} items ${successMsg}${failedMsg}`
  })

  return resList
}

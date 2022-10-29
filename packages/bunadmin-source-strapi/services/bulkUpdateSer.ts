import {
  ENV,
  request,
  storedToken,
  notice,
  BulkUpdateProps
} from "@xbuilder/bunadmin"

export default async function bulkUpdateSer<T>({
  t,
  SchemaName,
  changes
}: BulkUpdateProps<T>) {
  const token = await storedToken()

  const resList: any[] = []
  let successCount = 0
  let failCount = 0
  const changesList = Object.values(changes)

  for (let i = 0; i < changesList.length; i++) {
    const { oldData, newData } = changes[i]
    // @ts-ignore
    const res = await request(`/${SchemaName}/${oldData.id}`, {
      prefix: ENV.AUTH_URL,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: newData
    })
    resList.push(resList)

    if (res.error) {
      await notice({
        title: t("Save Failed"),
        severity: "warning",
        content: JSON.stringify(oldData)
      })
      failCount++
    } else {
      successCount++
    }

    if (i + 1 === changesList.length) {
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
    }
  }

  return resList
}

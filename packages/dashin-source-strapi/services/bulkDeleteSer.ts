import {
  ENV,
  request,
  storedToken,
  notice,
  BulkDeleteProps
} from "@dashin-dev/dashin"

type Props<RowData extends object> = BulkDeleteProps & {
  data: RowData[]
}

export default async function bulkDeleteSer<T extends object>({
  t,
  SchemaName,
  primaryKey = "id",
  data
}: Props<T>) {
  const token = await storedToken()

  const resList: any[] = []
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    // @ts-ignore
    const _eqData = data[i][primaryKey]
    const res = await request(`/${SchemaName}/${_eqData}`, {
      prefix: ENV.AUTH_URL,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    resList.push(resList)

    if (res.error) {
      await notice({
        title: t("Delete Failed"),
        severity: "warning",
        content: JSON.stringify(item)
      })
      failCount++
    } else {
      successCount++
    }

    if (i + 1 === data.length) {
      const successMsg = successCount > 0 ? `, ${successCount} success` : ""
      const failedMsg = failCount > 0 ? `, ${failCount} failure.` : ""
      await notice({
        title: t(`Batch Request Completed`),
        severity:
          successCount === data.length
            ? "success"
            : failCount === data.length
            ? "error"
            : "info",
        content: `${data.length} items ${successMsg}${failedMsg}`
      })
    }
  }

  return resList
}

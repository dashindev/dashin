import { ENV, request, notice, BulkDeleteProps } from "@dashin-dev/dashin"
import { awHeaders, docPath } from "./awConfig"

type Props<RowData extends object> = BulkDeleteProps & {
  data: RowData[]
}

export default async function bulkDeleteSer<T extends object>({
  t,
  SchemaName,
  primaryKey = "$id",
  data
}: Props<T>) {
  const headers = await awHeaders()
  const resList: any[] = []
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    // @ts-ignore
    const id = data[i][primaryKey] || data[i].id
    const res = await request(docPath(SchemaName, id), {
      prefix: ENV.AUTH_URL,
      method: "DELETE",
      headers
    })
    resList.push(res)

    if (res && res.code && res.code >= 400) {
      await notice({
        title: t("Delete Failed"),
        severity: "warning",
        content: JSON.stringify(item)
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
      successCount === data.length
        ? "success"
        : failCount === data.length
        ? "error"
        : "info",
    content: `${data.length} items ${successMsg}${failedMsg}`
  })

  return resList
}

import { ENV, request, notice, BulkDeleteProps } from "@xbuilder/bunadmin"
import { sbHeaders, tablePath } from "./sbConfig"

type Props<RowData extends object> = BulkDeleteProps & {
  data: RowData[]
}

export default async function bulkDeleteSer<T extends object>({
  t,
  SchemaName,
  primaryKey = "id",
  data
}: Props<T>) {
  const headers = await sbHeaders()
  const resList: any[] = []
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < data.length; i++) {
    // @ts-ignore
    const id = data[i][primaryKey]
    const res = await request(tablePath(SchemaName), {
      prefix: ENV.MAIN_URL || ENV.AUTH_URL,
      method: "DELETE",
      headers,
      params: { [primaryKey]: `eq.${id}` }
    })
    resList.push(res)
    if (res && res.code && res.code >= 400) {
      await notice({ title: t("Delete Failed"), severity: "warning", content: JSON.stringify(data[i]) })
      failCount++
    } else {
      successCount++
    }
  }

  const successMsg = successCount > 0 ? `, ${successCount} success` : ""
  const failedMsg = failCount > 0 ? `, ${failCount} failure.` : ""
  await notice({
    title: t(`Batch Request Completed`),
    severity: successCount === data.length ? "success" : failCount === data.length ? "error" : "info",
    content: `${data.length} items ${successMsg}${failedMsg}`
  })

  return resList
}

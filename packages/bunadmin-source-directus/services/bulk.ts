import { ENV, request, notice, BulkDeleteProps, BulkUpdateProps } from "@xbuilder/bunadmin"
import { dxHeaders, itemsPath } from "./dxConfig"

async function batchNotice(t: any, n: number, ok: number, fail: number) {
  await notice({
    title: t(`Batch Request Completed`),
    severity: ok === n ? "success" : fail === n ? "error" : "info",
    content: `${n} items${ok ? `, ${ok} success` : ""}${fail ? `, ${fail} failure.` : ""}`
  })
}

export async function bulkDeleteSer<T extends object>({
  t, SchemaName, primaryKey = "id", data
}: BulkDeleteProps & { data: T[] }) {
  const headers = await dxHeaders()
  let ok = 0, fail = 0
  const resList: any[] = []
  for (const item of data) {
    // @ts-ignore
    const res = await request(itemsPath(SchemaName, item[primaryKey]), {
      prefix: ENV.MAIN_URL || ENV.AUTH_URL, method: "DELETE", headers
    })
    resList.push(res)
    res && res.errors ? fail++ : ok++
  }
  await batchNotice(t, data.length, ok, fail)
  return resList
}

export async function bulkUpdateSer<T>({ t, SchemaName, changes }: BulkUpdateProps<T>) {
  const headers = await dxHeaders()
  const list = Object.values(changes)
  let ok = 0, fail = 0
  const resList: any[] = []
  for (const c of list) {
    const { oldData, newData } = c as any
    const res = await request(itemsPath(SchemaName, oldData.id), {
      prefix: ENV.MAIN_URL || ENV.AUTH_URL, method: "PATCH", headers, data: newData
    })
    resList.push(res)
    res && res.errors ? fail++ : ok++
  }
  await batchNotice(t, list.length, ok, fail)
  return resList
}

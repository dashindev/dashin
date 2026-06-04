import { notice, BulkDeleteProps, BulkUpdateProps } from "@dashin-dev/dashin"
import { buildDelete, buildUpdate } from "./sql"
import { execute } from "./client"

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
  let ok = 0, fail = 0
  const resList: any[] = []
  for (const item of data) {
    // @ts-ignore
    const res = await execute(buildDelete(SchemaName, primaryKey, item[primaryKey]))
    resList.push(res)
    res.error ? fail++ : ok++
  }
  await batchNotice(t, data.length, ok, fail)
  return resList
}

export async function bulkUpdateSer<T>({ t, SchemaName, changes }: BulkUpdateProps<T>) {
  const list = Object.values(changes)
  let ok = 0, fail = 0
  const resList: any[] = []
  for (const c of list) {
    const { oldData, newData } = c as any
    const res = await execute(buildUpdate(SchemaName, newData, "id", oldData.id))
    resList.push(res)
    res.error ? fail++ : ok++
  }
  await batchNotice(t, list.length, ok, fail)
  return resList
}

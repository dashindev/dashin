import { request, notice, BulkDeleteProps, BulkUpdateProps } from "@dashin-dev/dashin"
import { plHeaders, apiPath, apiBase } from "./plConfig"
import { assertPayloadSuccess } from "./crud"
import { errMessage } from "./errors"

async function batchNotice(t: any, n: number, ok: number, fail: number, errorSummary?: string) {
  const content = `${n} items${ok ? `, ${ok} success` : ""}${fail ? `, ${fail} failure.` : ""}${errorSummary ? ` (${errorSummary})` : ""}`
  await notice({
    title: t(`Batch Request Completed`),
    severity: ok === n ? "success" : fail === n ? "error" : "warning",
    content
  })
}

export async function bulkDeleteSer<T extends object>({
  t, SchemaName, primaryKey = "id", data
}: BulkDeleteProps & { data: T[] }) {
  const headers = await plHeaders()
  let ok = 0, fail = 0
  const resList: any[] = []
  const errorMessages: string[] = []

  for (const item of data) {
    try {
      // @ts-ignore
      const res = await request(apiPath(SchemaName, item[primaryKey]), {
        prefix: apiBase(), method: "DELETE", headers
      })
      assertPayloadSuccess(res, t("Delete Failed"))
      resList.push(res)
      ok++
    } catch (e: any) {
      fail++
      const msg = errMessage(e, "Delete failed")
      errorMessages.push(msg)
      resList.push({ error: msg, item })
    }
  }

  const errorSummary = errorMessages.length > 0 ? errorMessages.slice(0, 3).join("; ") : undefined
  await batchNotice(t, data.length, ok, fail, errorSummary)

  if (fail > 0) {
    const error = new Error(
      ok === 0
        ? `All ${fail} bulk delete operations failed${errorSummary ? `: ${errorSummary}` : ""}`
        : `${fail} of ${data.length} bulk delete operations failed${errorSummary ? `: ${errorSummary}` : ""}`
    ) as any
    error.resList = resList
    error.okCount = ok
    error.failCount = fail
    throw error
  }
  return resList
}

export async function bulkUpdateSer<T>({ t, SchemaName, changes }: BulkUpdateProps<T>) {
  const headers = await plHeaders()
  const list = Object.values(changes)
  let ok = 0, fail = 0
  const resList: any[] = []
  const errorMessages: string[] = []

  for (const c of list) {
    const { oldData, newData } = c as any
    try {
      const res = await request(apiPath(SchemaName, oldData.id), {
        prefix: apiBase(), method: "PATCH", headers, data: newData, checkBusinessErrors: true
      } as any)
      assertPayloadSuccess(res, t("Save Failed"))
      resList.push(res)
      ok++
    } catch (e: any) {
      fail++
      const msg = errMessage(e, "Update failed")
      errorMessages.push(msg)
      resList.push({ error: msg, oldData, newData })
    }
  }

  const errorSummary = errorMessages.length > 0 ? errorMessages.slice(0, 3).join("; ") : undefined
  await batchNotice(t, list.length, ok, fail, errorSummary)

  if (fail > 0) {
    const error = new Error(
      ok === 0
        ? `All ${fail} bulk update operations failed${errorSummary ? `: ${errorSummary}` : ""}`
        : `${fail} of ${list.length} bulk update operations failed${errorSummary ? `: ${errorSummary}` : ""}`
    ) as any
    error.resList = resList
    error.okCount = ok
    error.failCount = fail
    throw error
  }
  return resList
}

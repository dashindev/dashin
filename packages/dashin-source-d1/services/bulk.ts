import { notice, BulkDeleteProps, BulkUpdateProps, BulkMutationError, mutationFailureOutcome } from "@dashin-dev/dashin"
import { buildDelete, buildUpdate } from "./sql"
import { execute } from "./client"

async function batchNotice(t: any, n: number, ok: number, fail: number, errorSummary?: string) {
  const content = `${n} items${ok ? `, ${ok} success` : ""}${fail ? `, ${fail} failure.` : ""}${errorSummary ? ` (${errorSummary})` : ""}`
  try { await notice({
    title: t(`Batch Request Completed`),
    severity: ok === n ? "success" : fail === n ? "error" : "warning",
    content
  }) } catch { /* Notification failure must not replace mutation metadata. */ }
}

function errorMessage(error: any, fallback: string) {
  return error?.message || error?.error?.message || error?.error || fallback
}

export async function bulkDeleteSer<T extends object>({
  t, SchemaName, primaryKey = "id", data
}: BulkDeleteProps & { data: T[] }) {
  let ok = 0, fail = 0
  const resList: any[] = []
  const errorMessages: string[] = []

  for (const item of data) {
    try {
      // @ts-ignore
      const res = await execute(buildDelete(SchemaName, primaryKey, item[primaryKey]))
      resList.push(res.error ? { ...res, outcome: "failed" } : res)
      if (res.error) {
        fail++
        const msg = errorMessage(res, "Delete failed")
        errorMessages.push(msg)
      } else {
        ok++
      }
    } catch (error: any) {
      fail++
      const msg = errorMessage(error, "Delete failed")
      errorMessages.push(msg)
      resList.push({ error: msg, item, id: (item as any)[primaryKey], outcome: mutationFailureOutcome(error), cause: error })
    }
  }

  const errorSummary = errorMessages.length > 0 ? errorMessages.slice(0, 3).join("; ") : undefined
  await batchNotice(t, data.length, ok, fail, errorSummary)

  if (fail > 0) {
    const err = new BulkMutationError(
      ok === 0
        ? `All ${fail} bulk delete operations failed${errorSummary ? `: ${errorSummary}` : ""}`
        : `${fail} of ${data.length} bulk delete operations failed${errorSummary ? `: ${errorSummary}` : ""}`
    , resList, data.map(item => (item as any)[primaryKey]))
    throw err
  }

  return resList
}

export async function bulkUpdateSer<T>({ t, SchemaName, primaryKey = "id", changes }: BulkUpdateProps<T>) {
  const list = Object.values(changes)
  let ok = 0, fail = 0
  const resList: any[] = []
  const errorMessages: string[] = []

  for (const c of list) {
    const { oldData, newData } = c as any
    try {
      const res = await execute(buildUpdate(SchemaName, newData, primaryKey, (oldData as any)[primaryKey]))
      resList.push(res.error ? { ...res, outcome: "failed" } : res)
      if (res.error) {
        fail++
        const msg = errorMessage(res, "Update failed")
        errorMessages.push(msg)
      } else {
        ok++
      }
    } catch (error: any) {
      fail++
      const msg = errorMessage(error, "Update failed")
      errorMessages.push(msg)
      resList.push({ error: msg, oldData, newData, id: (oldData as any)[primaryKey], outcome: mutationFailureOutcome(error), cause: error })
    }
  }

  const errorSummary = errorMessages.length > 0 ? errorMessages.slice(0, 3).join("; ") : undefined
  await batchNotice(t, list.length, ok, fail, errorSummary)

  if (fail > 0) {
    const err = new BulkMutationError(
      ok === 0
        ? `All ${fail} bulk update operations failed${errorSummary ? `: ${errorSummary}` : ""}`
        : `${fail} of ${list.length} bulk update operations failed${errorSummary ? `: ${errorSummary}` : ""}`
    , resList, list.map(c => (c.oldData as any)[primaryKey]))
    throw err
  }

  return resList
}

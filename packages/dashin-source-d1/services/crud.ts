import { EditableCtrl, notice } from "@dashin-dev/dashin"
import { buildInsert, buildUpdate, buildDelete } from "./sql"
import { execute } from "./client"

interface Add<R> extends EditableCtrl { newData: R }
interface Upd<R> extends EditableCtrl { newData: R; oldData: R; primaryKey?: string }
interface Del<R> extends EditableCtrl { oldData: R; primaryKey?: string }

export async function addSer({ t, SchemaName, newData }: Add<any>) {
  const res = await execute(buildInsert(SchemaName, newData))
  if (res.error) {
    const msg = typeof res.error === "string" ? res.error : (res.error.message || JSON.stringify(res.error))
    await notice({ title: t("Create Failed"), severity: "warning", content: msg })
    const err = new Error(msg) as any
    err.data = res
    throw err
  }
  await notice({ title: t("Created"), severity: "success" })
  return res
}

export async function updateSer({ t, SchemaName, newData, oldData, primaryKey = "id" }: Upd<any>) {
  const res = await execute(buildUpdate(SchemaName, newData, primaryKey, oldData[primaryKey]))
  if (res.error) {
    const msg = typeof res.error === "string" ? res.error : (res.error.message || JSON.stringify(res.error))
    await notice({ title: t("Save Failed"), severity: "warning", content: JSON.stringify({ errors: res.error, newData }) })
    const err = new Error(msg) as any
    err.data = res
    throw err
  }
  await notice({ title: t("Changes Saved"), severity: "success" })
  return res
}

export async function deleteSer({ t, SchemaName, oldData, primaryKey = "id" }: Del<any>) {
  const res = await execute(buildDelete(SchemaName, primaryKey, oldData[primaryKey]))
  if (res.error) {
    const msg = typeof res.error === "string" ? res.error : (res.error.message || JSON.stringify(res.error))
    await notice({ title: t("Delete Failed"), severity: "warning", content: JSON.stringify(oldData) })
    const err = new Error(msg) as any
    err.data = res
    throw err
  }
  await notice({ title: t("Deleted"), severity: "success" })
  return res
}

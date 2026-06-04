import { EditableCtrl, notice } from "@dashin-dev/dashin"
import { buildInsert, buildUpdate, buildDelete } from "./sql"
import { execute } from "./client"

interface Add<R> extends EditableCtrl { newData: R }
interface Upd<R> extends EditableCtrl { newData: R; oldData: R; primaryKey?: string }
interface Del<R> extends EditableCtrl { oldData: R; primaryKey?: string }

export async function addSer({ t, SchemaName, newData }: Add<any>) {
  const res = await execute(buildInsert(SchemaName, newData))
  await notice(
    res.error
      ? { title: t("Create Failed"), severity: "warning", content: res.error }
      : { title: t("Created"), severity: "success" }
  )
  return res
}

export async function updateSer({ t, SchemaName, newData, oldData, primaryKey = "id" }: Upd<any>) {
  const res = await execute(buildUpdate(SchemaName, newData, primaryKey, oldData[primaryKey]))
  await notice(
    res.error
      ? { title: t("Save Failed"), severity: "warning", content: JSON.stringify({ errors: res.error, newData }) }
      : { title: t("Changes Saved"), severity: "success" }
  )
  return res
}

export async function deleteSer({ t, SchemaName, oldData, primaryKey = "id" }: Del<any>) {
  const res = await execute(buildDelete(SchemaName, primaryKey, oldData[primaryKey]))
  await notice(
    res.error
      ? { title: t("Delete Failed"), severity: "warning", content: JSON.stringify(oldData) }
      : { title: t("Deleted"), severity: "success" }
  )
  return res
}

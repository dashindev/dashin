import { EditableCtrl, ENV, request, notice } from "@dashin-dev/dashin"
import { dxHeaders, itemsPath } from "./dxConfig"

interface Add<R> extends EditableCtrl { newData: R }
interface Upd<R> extends EditableCtrl { newData: R; oldData: R; primaryKey?: string }
interface Del<R> extends EditableCtrl { oldData: R; primaryKey?: string }

export async function addSer({ t, SchemaName, newData }: Add<any>) {
  const res = await request(itemsPath(SchemaName), {
    prefix: ENV.MAIN_URL || ENV.AUTH_URL,
    method: "POST",
    headers: await dxHeaders(),
    data: newData
  })
  await notice(
    res && res.errors
      ? { title: t("Create Failed"), severity: "warning", content: res }
      : { title: t("Created"), severity: "success" }
  )
  return res
}

export async function updateSer({ t, SchemaName, newData, oldData, primaryKey = "id" }: Upd<any>) {
  const res = await request(itemsPath(SchemaName, oldData[primaryKey]), {
    prefix: ENV.MAIN_URL || ENV.AUTH_URL,
    method: "PATCH",
    headers: await dxHeaders(),
    data: newData
  })
  await notice(
    res && res.errors
      ? { title: t("Save Failed"), severity: "warning", content: JSON.stringify({ errors: res, newData }) }
      : { title: t("Changes Saved"), severity: "success" }
  )
  return res
}

export async function deleteSer({ t, SchemaName, oldData, primaryKey = "id" }: Del<any>) {
  const res = await request(itemsPath(SchemaName, oldData[primaryKey]), {
    prefix: ENV.MAIN_URL || ENV.AUTH_URL,
    method: "DELETE",
    headers: await dxHeaders()
  })
  await notice(
    res && res.errors
      ? { title: t("Delete Failed"), severity: "warning", content: JSON.stringify(oldData) }
      : { title: t("Deleted"), severity: "success" }
  )
  return res
}
